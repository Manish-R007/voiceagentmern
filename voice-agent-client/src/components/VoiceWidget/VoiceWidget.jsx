import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaComments,
  FaUserMd
} from 'react-icons/fa';
import { useWebRTC } from '../../hooks/useWebRTC';
import MicButton from './MicButton';
import './VoiceWidget.css';

const VoiceWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const {
    isConnected,
    isMuted,
    isListening,
    transcript,
    assistantMessage,
    error,
    audioLevel,
    startCall,
    stopCall,
    toggleMute
  } = useWebRTC();

  // ── Auto scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Transcript ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!transcript) return;
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.type === 'user' && !last.isFinal) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          type: 'user', text: transcript, isFinal: false, timestamp: new Date()
        };
        return updated;
      }
      return [...prev, { type: 'user', text: transcript, isFinal: false, timestamp: new Date() }];
    });
  }, [transcript]);

  // ── Assistant message ────────────────────────────────────────────────
  useEffect(() => {
    if (!assistantMessage) return;
    setMessages(prev => [
      ...prev,
      { type: 'assistant', text: assistantMessage, isFinal: true, timestamp: new Date() }
    ]);
  }, [assistantMessage]);

  // ── Errors ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!error) return;
    setMessages(prev => [...prev, { type: 'error', text: error, timestamp: new Date() }]);
  }, [error]);

  const handleCallToggle = () => {
    if (isConnected) { stopCall(); setMessages([]); }
    else startCall();
  };

  const formatTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Only render when logged in ───────────────────────────────────────
  if (!user) return null;

  return (
    <div className="voice-widget-container">

      {/* Floating Button */}
      <motion.button
        className="chat-button"
        onClick={() => setIsOpen(p => !p)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
      </motion.button>

      {/* Widget Panel */}
      <motion.div
        className="widget-panel"
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : 20,
          scale: isOpen ? 1 : 0.95,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="widget-header">
          <div className="header-content">
            <div className="avatar-container">
              <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`} />
              <div className="avatar">
                <FaUserMd className="text-white text-2xl" />
              </div>
            </div>
            <div className="header-text">
              <h3>Sarah — Dental Assistant</h3>
              <p>{isConnected ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            <FaTimes size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 && !isConnected && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 py-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                <FaUserMd className="text-white text-2xl" />
              </div>
              <p className="text-gray-700 font-semibold">Hi {user?.name?.split(' ')[0]}, I'm Sarah!</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Press the microphone below to start. I can book appointments, find doctors, or answer any dental question.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {isListening && (
            <div className="listening-indicator">
              <div className="voice-wave">
                {[20, 30, 40, 30, 20].map((v, i) => (
                  <span key={i} className="voice-wave-bar"
                    style={{ height: `${Math.min(v, audioLevel * 60)}px` }} />
                ))}
              </div>
              <span>Listening…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="controls-container">
          <MicButton
            isActive={isConnected}
            isMuted={isMuted}
            onClick={handleCallToggle}
            onToggleMute={toggleMute}
          />
          {isConnected && (
            <div className="call-status">
              <span className="dot" /> Connected to Sarah
            </div>
          )}
        </div>

        <div className="disclaimer">
          🦷 For dental emergencies, please call 911 or visit nearest ER
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceWidget;