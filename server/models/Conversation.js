const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  patientInfo: {
    name: String,
    phone: String,
    email: String
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  toolsUsed: [{
    name: String,
    parameters: Object,
    result: Object,
    timestamp: Date
  }],
  appointmentBooked: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  duration: Number,
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);