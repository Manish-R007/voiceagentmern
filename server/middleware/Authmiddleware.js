const jwt = require('jsonwebtoken');
const Doctor  = require('../models/doctor');
const Patient = require('../models/usermodel');

/* =========================================================
   GENERATE JWT TOKEN
========================================================= */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/* =========================================================
   PROTECT — verifies JWT, loads user from DB
   Attaches req.user and req.userRole
========================================================= */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized — no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load user from correct collection based on role in token
    if (decoded.role === 'doctor') {
      req.user = await Doctor.findById(decoded.id).select('-password');
    } else {
      req.user = await Patient.findById(decoded.id).select('-password');
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.userRole = decoded.role;
    next();

  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};

/* =========================================================
   AUTHORIZE — restrict to specific roles
   Usage: authorize('doctor'), authorize('patient', 'doctor')
========================================================= */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      error: `Role '${req.userRole}' is not authorized for this route`
    });
  }
  next();
};

module.exports = { generateToken, protect, authorize };