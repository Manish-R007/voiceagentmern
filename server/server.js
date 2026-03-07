require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/database');
const appointmentRoutes = require('./routes/appointmentRoutes');
const agentRoutes = require('./routes/agentRoutes');
const voiceAgentService = require('./services/voiceAgentService');
const sttService = require('./services/sttService');
const authRoutes = require('./routes/Authroutes');
const doctorRoutes = require('./routes/Doctorroutes');

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/appointments', appointmentRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    socketConnections: io.engine.clientsCount,
    services: {
      deepgram: process.env.DEEPGRAM_API_KEY ? 'configured' : 'missing',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});

/* ===============================
   RECONNECT CONFIG
================================ */
const RECONNECT_BASE_DELAY_MS = 1000; // start at 1s
const RECONNECT_MAX_DELAY_MS  = 30000; // cap at 30s
const RECONNECT_MAX_ATTEMPTS  = 5;    // stop after 5 consecutive failures

// Error types that should NOT trigger a reconnect (permanent failures)
const isPermanentError = (message = '') => {
  const msg = message.toLowerCase();
  return (
    msg.includes('400') ||              // Bad request — bad API key or URL params
    msg.includes('401') ||              // Unauthorized — invalid API key
    msg.includes('403') ||              // Forbidden
    msg.includes('invalid api key') ||
    msg.includes('unauthorized')
  );
};

/* ===============================
   SOCKET / VOICE SYSTEM
================================ */
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  let conversationId      = null;
  let deepgramConnection  = null;
  let isDeepgramOpen      = false;
  let isCallActive        = false;
  let isSarahSpeaking     = false;
  let sessionSampleRate   = 16000;
  let audioQueue          = [];
  let readyCheckInterval  = null;
  let keepAliveInterval   = null;

  // Reconnect state
  let reconnectAttempts   = 0;
  let reconnectTimer      = null;

  socket.emit('assistant-response', {
    text: "Hello! Welcome to SmileCare Dental Clinic. I'm Sarah, your virtual assistant. How can I help you today?",
    isFinal: true,
    timestamp: new Date(),
  });

  /* ----------------------------
     Helpers
  ---------------------------- */

  const toBuffer = (data) => {
    if (Buffer.isBuffer(data))    return data;
    if (data instanceof ArrayBuffer) return Buffer.from(data);
    if (data?.buffer)             return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    return Buffer.from(data);
  };

  const flushQueue = () => {
    if (!audioQueue.length) return;
    console.log(`📤 Flushing ${audioQueue.length} audio chunks`);
    audioQueue.forEach((chunk) => {
      try { deepgramConnection.send(chunk); } catch {}
    });
    audioQueue = [];
  };

  const clearIntervals = () => {
    if (readyCheckInterval) { clearInterval(readyCheckInterval); readyCheckInterval = null; }
    if (keepAliveInterval)  { clearInterval(keepAliveInterval);  keepAliveInterval  = null; }
    if (reconnectTimer)     { clearTimeout(reconnectTimer);      reconnectTimer     = null; }
  };

  const closeDeepgram = () => {
    clearIntervals();
    isDeepgramOpen = false;
    audioQueue     = [];

    if (deepgramConnection) {
      try { sttService.closeConnection(deepgramConnection); } catch {}
      deepgramConnection = null;
    }
  };

  /* ----------------------------
     Deepgram Connection
  ---------------------------- */

  const openDeepgramConnection = () => {
    clearIntervals();

    // Guard: stop if call is no longer active
    if (!isCallActive) return;

    // Guard: missing API key — fail immediately, don't loop
    if (!process.env.DEEPGRAM_API_KEY) {
      console.error('❌ DEEPGRAM_API_KEY is not set in .env — cannot connect');
      socket.emit('error', { message: 'Deepgram API key is missing. Check server .env file.' });
      isCallActive = false;
      return;
    }

    if (deepgramConnection) {
      try { sttService.closeConnection(deepgramConnection); } catch {}
      deepgramConnection = null;
    }

    console.log(`🔊 Opening Deepgram @ ${sessionSampleRate}Hz (attempt ${reconnectAttempts + 1}/${RECONNECT_MAX_ATTEMPTS})`);

    deepgramConnection = sttService.createLiveConnection(
      sessionSampleRate,

      /* onTranscript */
      async (transcriptData) => {
        if (isSarahSpeaking) {
          console.log(`🔇 Ignored transcript while Sarah speaking`);
          return;
        }

        // Successful transcript — reset retry counter
        reconnectAttempts = 0;

        socket.emit('transcript', transcriptData);

        if (!transcriptData.isFinal || !transcriptData.text.trim()) return;

        try {
          socket.emit('typing', true);

          const response = await voiceAgentService.processUserInput(
            transcriptData.text,
            conversationId
          );

          if (!response.text || response.suppressed) {
            socket.emit('typing', false);
            return;
          }

          if (!conversationId && response.conversationId) {
            conversationId = response.conversationId;
          }

          socket.emit('typing', false);
          socket.emit('assistant-response', {
            text: response.text,
            conversationId: response.conversationId,
            isFinal: true,
            timestamp: new Date(),
          });

          console.log(`🤖 Sarah: ${response.text}`);

        } catch (err) {
          console.error('AI error:', err);
          socket.emit('typing', false);
          socket.emit('error', { message: 'AI processing failed' });
        }
      },

      /* onError */
      (err) => {
        const msg = err?.message || String(err);
        console.error('❌ Deepgram WS error:', msg);
        isDeepgramOpen = false;

        if (isPermanentError(msg)) {
          console.error('🚫 Permanent Deepgram error — stopping reconnects. Check your DEEPGRAM_API_KEY and connection URL.');
          socket.emit('error', {
            message: `Deepgram authentication/configuration error: ${msg}. Check your API key.`,
          });
          // Stop the call so the close handler won't loop
          isCallActive = false;
        }
      },

      /* onClose */
      (code, reason) => {
        console.log(`🔌 Deepgram closed — code: ${code}, reason: ${reason}`);
        isDeepgramOpen    = false;
        deepgramConnection = null;

        if (!isCallActive) return; // session was stopped intentionally

        reconnectAttempts++;

        if (reconnectAttempts > RECONNECT_MAX_ATTEMPTS) {
          console.error(`🚫 Deepgram failed after ${RECONNECT_MAX_ATTEMPTS} attempts — giving up.`);
          socket.emit('error', {
            message: `Could not connect to Deepgram after ${RECONNECT_MAX_ATTEMPTS} attempts. Please check your API key and network, then restart the session.`,
          });
          isCallActive = false;
          return;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s … capped at 30s
        const delay = Math.min(
          RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempts - 1),
          RECONNECT_MAX_DELAY_MS
        );

        console.log(`🔄 Reconnecting Deepgram in ${delay}ms (attempt ${reconnectAttempts}/${RECONNECT_MAX_ATTEMPTS})…`);

        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          if (isCallActive) openDeepgramConnection();
        }, delay);
      }
    );

    /* Wait for WebSocket ready state */
    let elapsed = 0;

    readyCheckInterval = setInterval(() => {
      elapsed += 50;

      const state = deepgramConnection?.readyState;

      if (state === 1) {
        isDeepgramOpen = true;
        reconnectAttempts = 0; // connected successfully — reset counter

        clearInterval(readyCheckInterval);
        readyCheckInterval = null;

        flushQueue();

        socket.emit('session-started', {
          status: 'ready',
          sampleRate: sessionSampleRate,
        });

        console.log(`✅ Deepgram ready (${elapsed}ms)`);
      }

      if (elapsed > 5000) {
        clearInterval(readyCheckInterval);
        readyCheckInterval = null;
        console.warn('⚠️ Deepgram readyState timeout — connection may be stuck');
        // Let the onClose handler deal with the retry
      }
    }, 50);
  };

  /* ----------------------------
     Start Voice Session
  ---------------------------- */

  socket.on('start-voice-session', (options = {}) => {
    sessionSampleRate = options.sampleRate || 16000;
    isCallActive      = true;
    isSarahSpeaking   = false;
    reconnectAttempts = 0; // reset on every fresh session start

    console.log(`🎤 Voice session started`);
    openDeepgramConnection();
  });

  /* ----------------------------
     Audio Streaming
  ---------------------------- */

  socket.on('audio-chunk', (rawChunk) => {
    if (!isCallActive || isSarahSpeaking) return;

    const buffer = toBuffer(rawChunk);
    if (!buffer?.length) return;

    try {
      if (isDeepgramOpen) {
        deepgramConnection.send(buffer);
      } else {
        audioQueue.push(buffer);
        if (audioQueue.length > 200) audioQueue.shift();
      }
    } catch (err) {
      console.error('audio send error:', err);
    }
  });

  /* ----------------------------
     Sarah Speaking Gate
  ---------------------------- */

  socket.on('sarah-speaking', (speaking) => {
    isSarahSpeaking = speaking;

    if (speaking) {
      console.log('🔇 Sarah speaking - mic gate closed');
      audioQueue = [];

      keepAliveInterval = setInterval(() => {
        if (deepgramConnection && isDeepgramOpen) {
          sttService.sendKeepAlive(deepgramConnection);
        }
      }, 8000);

    } else {
      console.log('🎙️ Sarah finished speaking');
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
    }
  });

  /* ----------------------------
     Stop Voice Session
  ---------------------------- */

  socket.on('stop-voice-session', () => {
    console.log('🛑 Voice session stopped');
    isCallActive      = false;
    isSarahSpeaking   = false;
    reconnectAttempts = 0;
    closeDeepgram();
  });

  /* ----------------------------
     Disconnect
  ---------------------------- */

  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${reason}`);
    isCallActive      = false;
    isSarahSpeaking   = false;
    reconnectAttempts = 0;
    closeDeepgram();
    conversationId    = null;
  });
});

/* ===============================
   ERROR HANDLING
================================ */

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Server error' });
});

app.use((req, res) =>
  res.status(404).json({ success: false, error: 'Route not found' })
);

/* ===============================
   START SERVER
================================ */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════╗
║  🦷 SmileCare Voice Server       ║
╠══════════════════════════════════╣
║  http://localhost:${PORT}         ║
║  Deepgram: ${process.env.DEEPGRAM_API_KEY ? '✅' : '❌ MISSING KEY'}            ║
║  Gemini:   ${process.env.GEMINI_API_KEY   ? '✅' : '❌ MISSING KEY'}            ║
╚══════════════════════════════════╝
`);
});

const shutdown = (sig) => {
  console.log(`${sig} shutting down`);
  io.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = { app, server, io };