import React from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaPhoneSlash } from 'react-icons/fa';
import './MicButton.css';

const MicButton = ({ isActive, isMuted, onClick, onToggleMute }) => {
  return (
    <div className="mic-button-container">
      <motion.button
        className={`mic-button ${isActive ? 'active' : ''} ${isMuted ? 'muted' : ''}`}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isActive ? {
          boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.7)', '0 0 0 10px rgba(59, 130, 246, 0)'],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        } : {}}
      >
        {isActive ? (
          isMuted ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />
        ) : (
          <FaPhone size={24} />
        )}
      </motion.button>
      
      {isActive && (
        <motion.button
          className="mute-toggle"
          onClick={onToggleMute}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </motion.button>
      )}
    </div>
  );
};

export default MicButton;