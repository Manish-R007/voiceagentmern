const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const Doctor   = require('../models/doctor');
const Patient  = require('../models/usermodel');
const { generateToken, protect } = require('../middleware/Authmiddleware');

/* =========================================================
   PATIENT REGISTER   POST /api/auth/patient/register
========================================================= */
router.post('/patient/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    const exists = await Patient.findOne({ email });
    if (exists) return res.status(400).json({ success: false, error: 'Email already registered' });

    const patient = await Patient.create({ name, email, password, phone });
    const token   = generateToken(patient._id, 'patient');

    res.status(201).json({
      success: true,
      token,
      user: { id: patient._id, name: patient.name, email: patient.email, role: 'patient' }
    });
  } catch (err) {
    console.error('Patient register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================
   PATIENT LOGIN   POST /api/auth/patient/login
========================================================= */
router.post('/patient/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient || !(await patient.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(patient._id, 'patient');
    res.json({
      success: true,
      token,
      user: { id: patient._id, name: patient.name, email: patient.email, role: 'patient' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================
   DOCTOR REGISTER   POST /api/auth/doctor/register
========================================================= */
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, specialization, experience, qualification, phone, address, bio, services } = req.body;

//     if (!name || !email || !password || !specialization || !experience || !qualification) {
//       return res.status(400).json({ success: false, error: 'Name, email, password, specialization, experience and qualification are required' });
//     }

//     const exists = await Doctor.findOne({ email });
//     if (exists) return res.status(400).json({ success: false, error: 'Email already registered' });

//     const doctor = await Doctor.create({
//       name, email, password, specialization,
//       experience: parseInt(experience),
//       qualification, phone, address, bio,
//       services: services || [],
//     });

//     const token = generateToken(doctor._id, 'doctor');
//     res.status(201).json({
//       success: true,
//       token,
//       user: {
//         id:             doctor._id,
//         name:           doctor.name,
//         email:          doctor.email,
//         role:           'doctor',
//         specialization: doctor.specialization,
//       }
//     });
//   } catch (err) {
//     console.error('Doctor register error:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

/* =========================================================
   DOCTOR LOGIN   POST /api/auth/doctor/login
========================================================= */
router.post('/doctor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor || !(await doctor.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(doctor._id, 'doctor');
    res.json({
      success: true,
      token,
      user: {
        id:             doctor._id,
        name:           doctor.name,
        email:          doctor.email,
        role:           'doctor',
        specialization: doctor.specialization,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================
   GET CURRENT USER   GET /api/auth/me
========================================================= */
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user, role: req.userRole });
});

module.exports = router;