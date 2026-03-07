const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  name:           { type: String, required: [true, 'Name is required'], trim: true },
  email:          { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password:       { type: String, required: [true, 'Password is required'], minlength: 6, select: false },

  specialization: { type: String, required: [true, 'Specialization is required'] },
  qualification:  { type: String, required: [true, 'Qualification is required'] },
  experience:     { type: Number, default: 0 },

  // ── NEW: consultation fee in INR ──
  consultationFee: { type: Number, default: 500 },

  phone:   { type: String, default: '' },
  address: { type: String, default: '' },
  bio:     { type: String, default: '' },
  photo:   { type: String, default: '' },

  availableDays:  { type: [String], default: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
  availableSlots: { type: [String], default: ['09:00','10:00','11:00','13:00','14:00','15:00','16:00'] },

  isActive: { type: Boolean, default: true },
  role:     { type: String, default: 'doctor' },
}, { timestamps: true });

// Hash password before save
doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

doctorSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);