import React from 'react';
import { FaTooth } from 'react-icons/fa';

const DentalToothIcon = ({ className = "", pulsating = false }) => {
  return (
    <div className={`relative ${className}`}>
      <FaTooth className={`text-blue-500 text-4xl ${pulsating ? 'animate-pulse' : ''}`} />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
    </div>
  );
};

export default DentalToothIcon;