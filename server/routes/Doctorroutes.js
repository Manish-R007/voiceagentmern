const express = require('express');
const router  = express.Router();
const Doctor  = require('../models/doctor');
const { protect, authorize, signToken, generateToken } = require('../middleware/Authmiddleware');

// ── Public: list all active doctors ──────────────────────────────────────
// GET /api/doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select('-password -__v')
      .sort({ experience: -1 });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Public: single doctor ─────────────────────────────────────────────────
// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password -__v');
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Public: doctor self-registration ─────────────────────────────────────
// POST /api/doctors/register
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, specialization, qualification,
      experience, phone, address, bio, availableDays, availableSlots,
    } = req.body;

    if (!name || !email || !password || !specialization || !qualification || !experience) {
      return res.status(400).json({ success: false, error: 'Please fill all required fields' });
    }

    if (await Doctor.findOne({ email }))
      return res.status(400).json({ success: false, error: 'Email already registered' });

    const doctor = await Doctor.create({
      name, email, password, specialization, qualification,
      experience, phone, address, bio,
      availableDays:  availableDays  || ['Monday','Tuesday','Wednesday','Thursday','Friday'],
      availableSlots: availableSlots || ['09:00','10:00','11:00','13:00','14:00','15:00','16:00'],
    });

    const token = generateToken(doctor._id);
    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    console.log(`✅ New doctor registered: ${doctor.name} (${doctor.email})`);
    res.status(201).json({ success: true, token, doctor: doctorObj });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Admin: create doctor (kept for seed script / admin panel) ─────────────
// POST /api/doctors
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name, email, password, specialization, qualification,
      experience, phone, address, bio, availableDays, availableSlots,
    } = req.body;

    if (await Doctor.findOne({ email }))
      return res.status(400).json({ success: false, error: 'Email already registered' });

    const doctor = await Doctor.create({
      name, email, password, specialization, qualification,
      experience, phone, address, bio, availableDays, availableSlots,
    });

    const token = signToken(doctor._id);
    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    res.status(201).json({ success: true, token, doctor: doctorObj });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Doctor: update own profile ────────────────────────────────────────────
// PUT /api/doctors/:id
router.put('/:id', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    if (req.user.role === 'doctor' && req.user._id.toString() !== req.params.id)
      return res.status(403).json({ success: false, error: 'Not authorized' });

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).select('-password');

    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Admin: deactivate doctor ──────────────────────────────────────────────
// DELETE /api/doctors/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Doctor deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;