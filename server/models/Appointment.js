const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  service: {
    type: String,
    enum: ['General Checkup', 'Teeth Cleaning', 'Root Canal', 'Crown', 'Whitening', 'Emergency'],
    required: true
  },
  dentist: {
    type: String,
    default: 'Dr. Smith'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    default: ''
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick availability checks
appointmentSchema.index({ date: 1, time: 1, dentist: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);