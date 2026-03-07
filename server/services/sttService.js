'use strict';

/**
 * sttService.js
 *
 * UPGRADES IN THIS VERSION:
 *  1. nova-3 model  — 54% lower word error rate vs nova-2, better Indian English
 *  2. smart_format  — auto-formats emails (manishrajaa205@gmail.com stays intact),
 *                     phone numbers, dates, currency
 *  3. keyterms      — hints Deepgram to recognise specific names/domains/vocab
 *                     so "manishrajaa205 at gmail dot com" transcribes correctly
 *  4. API key guard — validates key before attempting connection
 *  5. unexpected-response handler — logs real HTTP error body
 *  6. IPv4 agent    — fixes ETIMEDOUT on Indian ISPs that struggle with IPv6
 *  7. KeepAlive     — prevents 1011 timeout during Sarah's TTS playback
 */

const WebSocket = require('ws');
const https     = require('https');

// ── Reusable HTTPS agent ──────────────────────────────────────────────────────
const httpsAgent = new https.Agent({ keepAlive: true, family: 4 });

// ── API key validation ────────────────────────────────────────────────────────

function getApiKey() {
  const key = process.env.DEEPGRAM_API_KEY;

  if (!key || !key.trim()) {
    throw new Error(
      'DEEPGRAM_API_KEY is not set. Add it to your .env file:\n' +
      '  DEEPGRAM_API_KEY=your_key_here'
    );
  }

  if (key.trim().length < 20) {
    throw new Error(
      `DEEPGRAM_API_KEY looks invalid (too short: "${key.trim()}"). ` +
      'Check your .env — you may have a placeholder value.'
    );
  }

  return key.trim();
}

// ── Keyterms ──────────────────────────────────────────────────────────────────
// Nova-3 keyterm prompting boosts recognition probability for these words.
// Critical for: email domains, Indian names, dental vocabulary, digit sequences.
// Add any names/brands your patients commonly say.
const KEYTERMS = [
  // Email keywords
  'gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'protonmail',
  // Words users say aloud in emails/phone numbers
  'at', 'dot', 'underscore', 'hyphen', 'dash',
  // Common Indian names
  'manish', 'raj', 'rajan', 'kumar', 'sharma', 'singh', 'priya',
  'arun', 'suresh', 'ramesh', 'vijay', 'anita', 'sunita',
  // Dental vocabulary
  'appointment', 'checkup', 'cleaning', 'extraction', 'filling',
  'root canal', 'braces', 'whitening', 'SmileCare', 'dentist',
  // Digits
  'zero', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine',
].map(k => `&keyterm=${encodeURIComponent(k)}`).join('');

// ── URL builder ───────────────────────────────────────────────────────────────

function buildDgUrl(sampleRate) {
  return (
    'wss://api.deepgram.com/v1/listen' +
    '?model=nova-3'           +   // Best accuracy: 54% lower WER vs nova-2
    '&language=en-IN'         +   // Indian English accent
    '&encoding=linear16'      +
    `&sample_rate=${sampleRate}` +
    '&channels=1'             +
    '&punctuate=true'         +
    '&smart_format=true'      +   // Auto-formats emails, numbers, dates
    '&interim_results=true'   +   // Required for utterance_end_ms
    '&endpointing=300'        +   // End-of-speech after 300ms silence
    '&utterance_end_ms=1500'  +   // Fallback if speech_final not fired after 1.5s
    KEYTERMS
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

/**
 * Create a Deepgram live-transcription WebSocket.
 *
 * @param {number}   sampleRate   e.g. 16000
 * @param {Function} onTranscript ({text, isFinal, confidence}) => void
 * @param {Function} onError      (err) => void
 * @param {Function} onClose      (code, reason) => void
 * @returns {WebSocket}
 */
function createLiveConnection(sampleRate, onTranscript, onError, onClose) {

  let apiKey;
  try {
    apiKey = getApiKey();
  } catch (validationErr) {
    console.error(`❌ ${validationErr.message}`);
    onError?.(validationErr);
    return { readyState: 3 };
  }

  const url = buildDgUrl(sampleRate);
  console.log(`🔊 Connecting to Deepgram @ ${sampleRate} Hz`);

  const ws = new WebSocket(url, {
    headers:          { Authorization: `Token ${apiKey}` },
    agent:            httpsAgent,
    handshakeTimeout: 10_000,
  });

  ws.on('open', () => {
    console.log(`✅ Deepgram WebSocket open and ready`);
  });

  // Capture real Deepgram error body for 400/401/403 responses
  ws.on('unexpected-response', (req, res) => {
    const status = res.statusCode;
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      let reason = body;
      try {
        const parsed = JSON.parse(body);
        reason = parsed.err_msg || parsed.message || body;
      } catch (_) {}

      const message = `Deepgram rejected connection — HTTP ${status}: ${reason}`;
      console.error(`❌ ${message}`);

      if (status === 400 || status === 401 || status === 403) {
        console.error(
          '🔑 Authentication/configuration error.\n' +
          '   → Check DEEPGRAM_API_KEY in your .env\n' +
          '   → Verify key is active at https://console.deepgram.com'
        );
      }

      onError?.(new Error(message));
    });
  });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (_) { return; }

    if (msg.type === 'Results') {
      const alt        = msg.channel?.alternatives?.[0];
      const text       = alt?.transcript?.trim() ?? '';
      const confidence = alt?.confidence ?? 1;
      const isFinal    = !!(msg.speech_final || msg.is_final);

      if (text) {
        console.log(`🎤 User [${isFinal ? 'FINAL' : 'partial'}]: "${text}" (${(confidence * 100).toFixed(1)}%)`);
        onTranscript?.({ text, isFinal, confidence });
      }

    } else if (msg.type === 'SpeechStarted') {
      console.log(`🗣️  Speech started`);

    } else if (msg.type === 'UtteranceEnd') {
      console.log(`🔇 Utterance end`);

    } else if (msg.type === 'Metadata') {
      console.log(`ℹ️  Deepgram metadata: ${JSON.stringify(msg).slice(0, 200)}`);
    }
  });

  ws.on('error', (err) => {
    if (err.message?.includes('Unexpected server response')) return;
    console.error(`❌ Deepgram WS error: ${err.message}`);
    onError?.(err);
  });

  ws.on('close', (code, reason) => {
    const reasonStr = Buffer.isBuffer(reason) ? reason.toString() : (reason || 'none');
    console.log(`🔌 Deepgram closed — code: ${code}, reason: ${reasonStr}`);
    onClose?.(code, reasonStr);
  });

  return ws;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function closeConnection(ws) {
  if (!ws) return;
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'CloseStream' }));
    }
    ws.terminate();
  } catch (_) {}
  console.log(`🔌 Deepgram connection closed`);
}

/**
 * Send a KeepAlive frame — prevents 1011 timeout while Sarah is speaking.
 * Called every ~8 s from server.js while isSarahSpeaking = true.
 */
function sendKeepAlive(ws) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'KeepAlive' }));
  }
}

module.exports = { createLiveConnection, closeConnection, sendKeepAlive };