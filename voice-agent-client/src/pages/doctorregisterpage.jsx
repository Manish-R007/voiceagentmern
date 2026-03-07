import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTooth, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaUser, FaPhone, FaMapMarkerAlt, FaArrowLeft,
  FaCheckCircle, FaUserMd, FaStethoscope, FaGraduationCap,
  FaClock, FaCalendarAlt, FaPlus, FaTimes, FaRupeeSign,
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SPECIALIZATIONS = [
  'General Dentist', 'Orthodontist', 'Periodontist',
  'Endodontist', 'Oral Surgeon', 'Pediatric Dentist',
  'Cosmetic Dentist', 'Prosthodontist', 'Oral Pathologist',
];

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// ── Brand tokens (matches new homepage) ───────────────────────────────────
const NAVY = '#0B1F3A';
const GOLD = '#C9A84C';

export default function DoctorRegister({ onSuccess, onSwitchToLogin }) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Step 1 — Basic
    name:     '',
    email:    '',
    phone:    '',
    password: '',
    confirm:  '',
    address:  '',
    // Step 2 — Professional
    specialization:  '',
    qualification:   '',
    experience:      '',
    consultationFee: '500',
    bio:             '',
    // Step 3 — Availability
    availableDays:  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: [...DEFAULT_SLOTS],
    customSlot:     '',
  });

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleDay = day => setForm(f => ({
    ...f,
    availableDays: f.availableDays.includes(day)
      ? f.availableDays.filter(d => d !== day)
      : [...f.availableDays, day],
  }));

  const toggleSlot = slot => setForm(f => ({
    ...f,
    availableSlots: f.availableSlots.includes(slot)
      ? f.availableSlots.filter(s => s !== slot)
      : [...f.availableSlots, slot].sort(),
  }));

  const addCustomSlot = () => {
    const s = form.customSlot.trim();
    if (!s || form.availableSlots.includes(s)) return;
    setForm(f => ({ ...f, availableSlots: [...f.availableSlots, s].sort(), customSlot: '' }));
  };

  // ── Validation ────────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!form.name.trim())              return 'Full name is required.';
    if (!form.email.trim())             return 'Email is required.';
    if (!form.password)                 return 'Password is required.';
    if (form.password.length < 6)       return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const validateStep2 = () => {
    if (!form.specialization)           return 'Please select a specialization.';
    if (!form.qualification.trim())     return 'Qualification is required.';
    if (!form.experience || isNaN(form.experience)) return 'Valid years of experience is required.';
    if (!form.consultationFee || isNaN(form.consultationFee) || Number(form.consultationFee) < 0)
      return 'Please enter a valid consultation fee.';
    return null;
  };

  const nextStep = () => {
    setError('');
    if (step === 1) { const e = validateStep1(); if (e) { setError(e); return; } }
    if (step === 2) { const e = validateStep2(); if (e) { setError(e); return; } }
    setStep(s => s + 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (form.availableDays.length === 0) { setError('Please select at least one available day.'); return; }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/api/doctors/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:            form.name,
          email:           form.email,
          password:        form.password,
          phone:           form.phone,
          address:         form.address,
          specialization:  form.specialization,
          qualification:   form.qualification,
          experience:      Number(form.experience),
          consultationFee: Number(form.consultationFee),
          bio:             form.bio,
          availableDays:   form.availableDays,
          availableSlots:  form.availableSlots,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Registration failed. Please try again.'); return; }

      // Save auth token and log doctor in immediately
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ ...data.doctor, role: 'doctor' }));
      }

      setSuccess(true);
      setTimeout(() => { if (onSuccess) onSuccess({ ...data.doctor, role: 'doctor' }); }, 2000);
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────
  const pwStrength = pw => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6)          s++;
    if (pw.length >= 10)         s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength     = pwStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#059669'][strength];

  // ── Success screen ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, #F0FDF4, #ECFDF5)`, fontFamily: "'DM Sans', sans-serif" }}>
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ background: 'white', borderRadius: 28, boxShadow: '0 20px 60px rgba(11,31,58,0.12)', padding: '56px 48px', textAlign: 'center', maxWidth: 420, width: '100%' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ width: 96, height: 96, background: `linear-gradient(135deg, #059669, #0D9488)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(5,150,105,0.35)' }}>
            <FaUserMd style={{ color: 'white', fontSize: 40 }} />
          </motion.div>
          <h2 style={{ color: NAVY, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome to SmileCare!</h2>
          <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, marginBottom: 6 }}>
            Your doctor account has been created successfully.
          </p>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>Logging you in…</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            {[0, 150, 300].map(d => (
              <span key={d} style={{ width: 8, height: 8, background: '#059669', borderRadius: '50%' }}
                className="animate-bounce" />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const stepLabels = ['Basic Info', 'Professional', 'Availability'];
  const stepSubLabels = ['Name, email & password', 'Qualifications & fee', 'Days & time slots'];

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, #F0FDF4, #F7FFF9)`, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 80px rgba(11,31,58,0.14)' }}>

        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          style={{ background: `linear-gradient(155deg, #065F46 0%, #059669 60%, #0D9488 100%)`, padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 560 }}>

          {/* Logo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaTooth style={{ color: 'white', fontSize: 22 }} />
              </div>
              <div>
                <p style={{ color: 'white', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>SmileCare Dental</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 3 }}>Doctor Registration</p>
              </div>
            </div>

            <h2 style={{ color: 'white', fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
              Join our<br />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>specialist network</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.75, marginBottom: 36 }}>
              Create your profile, set your availability and let Sarah automatically fill your schedule with qualified patients.
            </p>

            {/* Step indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stepLabels.map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: step === i + 1 ? 1 : step > i + 1 ? 0.7 : 0.4, transition: 'opacity 0.3s' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, border: '2px solid',
                    borderColor: step > i + 1 ? 'white' : step === i + 1 ? 'white' : 'rgba(255,255,255,0.4)',
                    background: step > i + 1 ? 'white' : step === i + 1 ? 'rgba(255,255,255,0.2)' : 'transparent',
                    color: step > i + 1 ? '#059669' : 'white',
                    flexShrink: 0,
                  }}>
                    {step > i + 1 ? <FaCheckCircle /> : i + 1}
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600, fontSize: 14, lineHeight: 1 }}>{label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 }}>{stepSubLabels[i]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back to login */}
          <div style={{ marginTop: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 8 }}>Already have a doctor account?</p>
            <button onClick={onSwitchToLogin}
              style={{ color: 'white', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              className="hover:opacity-80 transition">
              <FaArrowLeft style={{ fontSize: 11 }} /> Sign in to Doctor Portal
            </button>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          style={{ background: 'white', padding: '44px 40px', overflowY: 'auto', maxHeight: '90vh' }}>

          {/* Progress bar */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ color: NAVY, fontSize: 22, fontWeight: 700, margin: 0 }}>
                {['Basic Information', 'Professional Details', 'Availability'][step - 1]}
              </h3>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>Step {step} / 3</span>
            </div>
            <div style={{ width: '100%', height: 6, background: '#F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #059669, #0D9488)', borderRadius: 10 }} />
            </div>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: 13, borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STEP 1: BASIC INFO ────────────────────────────────────── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13 }} />
                  <input type="text" name="name" required value={form.name} onChange={handle}
                    placeholder="Dr. Jane Smith"
                    style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#059669'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Email Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13 }} />
                  <input type="email" name="email" required value={form.email} onChange={handle}
                    placeholder="doctor@smilecaredental.com"
                    style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#059669'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
              </div>

              {/* Phone + Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Phone</label>
                  <div style={{ position: 'relative' }}>
                    <FaPhone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 12 }} />
                    <input type="tel" name="phone" value={form.phone} onChange={handle} placeholder="+91 9876543210"
                      style={{ width: '100%', paddingLeft: 38, paddingRight: 12, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 13, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = '#059669'}
                      onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Address</label>
                  <div style={{ position: 'relative' }}>
                    <FaMapMarkerAlt style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 12 }} />
                    <input type="text" name="address" value={form.address} onChange={handle} placeholder="Suite 101"
                      style={{ width: '100%', paddingLeft: 38, paddingRight: 12, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 13, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = '#059669'}
                      onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 12 }} />
                  <input type={showPass ? 'text' : 'password'} name="password" required value={form.password} onChange={handle}
                    placeholder="Min. 6 characters"
                    style={{ width: '100%', paddingLeft: 40, paddingRight: 44, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#059669'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: i <= strength ? strengthColor : '#E5E7EB', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Confirm Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 12 }} />
                  <input type={showConfirm ? 'text' : 'password'} name="confirm" required value={form.confirm} onChange={handle}
                    placeholder="Re-enter password"
                    style={{ width: '100%', paddingLeft: 40, paddingRight: 76, paddingTop: 12, paddingBottom: 12, border: `1.5px solid ${form.confirm ? (form.password === form.confirm ? '#10B981' : '#EF4444') : '#E5E7EB'}`, borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => {}} onBlur={e => {}} />
                  <button type="button" onClick={() => setShowConfirm(s => !s)}
                    style={{ position: 'absolute', right: 38, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {form.confirm && form.password === form.confirm && (
                    <FaCheckCircle style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#10B981' }} />
                  )}
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>⚠️ Passwords do not match</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: PROFESSIONAL ──────────────────────────────────── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Specialization */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Specialization <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaStethoscope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13, zIndex: 1 }} />
                  <select name="specialization" required value={form.specialization} onChange={handle}
                    style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: form.specialization ? NAVY : '#9CA3AF', outline: 'none', background: 'white', appearance: 'none', boxSizing: 'border-box', fontFamily: 'inherit', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#059669'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}>
                    <option value="">Select specialization…</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Qualification */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Qualification <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaGraduationCap style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13 }} />
                  <input type="text" name="qualification" required value={form.qualification} onChange={handle}
                    placeholder="e.g. BDS, MDS (Orthodontics)"
                    style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#059669'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
              </div>

              {/* Experience + Consultation Fee — side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Years of Experience <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaClock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 12 }} />
                    <input type="number" name="experience" required min="0" max="60" value={form.experience} onChange={handle}
                      placeholder="e.g. 10"
                      style={{ width: '100%', paddingLeft: 38, paddingRight: 12, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = '#059669'}
                      onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                </div>

                {/* ── CONSULTATION FEE ── */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Consultation Fee (₹) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 13, fontWeight: 700 }}>₹</span>
                    <input type="number" name="consultationFee" required min="0" value={form.consultationFee} onChange={handle}
                      placeholder="500"
                      style={{ width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 12, paddingBottom: 12, border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = '#059669'}
                      onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                  <p style={{ color: '#9CA3AF', fontSize: 11, marginTop: 4 }}>Shown on appointment PDF</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Bio / About <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea name="bio" value={form.bio} onChange={handle} rows={4}
                  placeholder="Brief description about your expertise, approach, or background…"
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                <p style={{ color: '#9CA3AF', fontSize: 11, marginTop: 4 }}>{form.bio.length}/300 characters</p>
              </div>

              {/* Live preview card */}
              {form.specialization && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 14, padding: '16px 20px' }}>
                  <p style={{ color: '#059669', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Preview Card</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #059669, #0D9488)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
                      {form.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ color: NAVY, fontWeight: 700, fontSize: 15 }}>{form.name || 'Doctor Name'}</p>
                      <p style={{ color: '#059669', fontSize: 12, fontWeight: 600 }}>{form.specialization}</p>
                      <p style={{ color: '#9CA3AF', fontSize: 12 }}>
                        {form.qualification || 'Qualification'} · {form.experience || '0'} yrs · ₹{Number(form.consultationFee || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: AVAILABILITY ──────────────────────────────────── */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Available Days */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  <FaCalendarAlt style={{ color: '#059669' }} /> Available Days
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ALL_DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                        background: form.availableDays.includes(day) ? '#059669' : '#F3F4F6',
                        color: form.availableDays.includes(day) ? 'white' : '#6B7280',
                        boxShadow: form.availableDays.includes(day) ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
                      }}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {form.availableDays.length === 0 && (
                  <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 8 }}>⚠️ Please select at least one day</p>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  <FaClock style={{ color: '#059669' }} /> Available Time Slots
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {DEFAULT_SLOTS.map(slot => (
                    <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                      style={{
                        padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                        background: form.availableSlots.includes(slot) ? '#059669' : '#F3F4F6',
                        color: form.availableSlots.includes(slot) ? 'white' : '#6B7280',
                        boxShadow: form.availableSlots.includes(slot) ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
                      }}>
                      {slot}
                    </button>
                  ))}
                </div>

                {/* Add custom slot */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="time" value={form.customSlot}
                    onChange={e => setForm(f => ({ ...f, customSlot: e.target.value }))}
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: NAVY, outline: 'none', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#059669'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                  <button type="button" onClick={addCustomSlot}
                    style={{ padding: '10px 18px', background: '#059669', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaPlus style={{ fontSize: 11 }} /> Add
                  </button>
                </div>

                {/* Custom slots display */}
                {form.availableSlots.filter(s => !DEFAULT_SLOTS.includes(s)).length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.availableSlots.filter(s => !DEFAULT_SLOTS.includes(s)).map(slot => (
                      <span key={slot} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: '#ECFDF5', color: '#065F46', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                        {slot}
                        <button type="button" onClick={() => toggleSlot(slot)}
                          style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                          className="hover:text-red-500">
                          <FaTimes style={{ fontSize: 10 }} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>{form.availableSlots.length} slots selected</p>
              </div>

              {/* Summary box */}
              <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 14, padding: '20px 22px' }}>
                <p style={{ color: '#065F46', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📋 Registration Summary</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#374151' }}>
                  {[
                    ['Name',            form.name],
                    ['Email',           form.email],
                    ['Specialization',  form.specialization],
                    ['Qualification',   form.qualification],
                    ['Experience',      `${form.experience} years`],
                    ['Consultation Fee',`₹${Number(form.consultationFee || 0).toLocaleString('en-IN')}`],
                    ['Available Days',  form.availableDays.join(', ') || 'None selected'],
                    ['Time Slots',      `${form.availableSlots.length} slots`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: '#9CA3AF', minWidth: 130, fontSize: 12, fontWeight: 600 }}>{l}:</span>
                      <span style={{ color: NAVY, fontWeight: 500, fontSize: 12 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── NAV BUTTONS ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            {step > 1 && (
              <button type="button" onClick={() => { setError(''); setStep(s => s - 1); }}
                style={{ flex: 1, border: '2px solid #E5E7EB', color: '#6B7280', padding: '13px 0', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: 'pointer', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = '#059669'; e.target.style.color = '#059669'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.color = '#6B7280'; }}>
                <FaArrowLeft style={{ fontSize: 12 }} /> Back
              </button>
            )}

            {step < 3 ? (
              <button type="button" onClick={nextStep}
                style={{ flex: 1, background: 'linear-gradient(135deg, #059669, #0D9488)', color: 'white', padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(5,150,105,0.3)', transition: 'all 0.2s' }}>
                Next Step →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit}
                disabled={loading || form.availableDays.length === 0}
                style={{ flex: 1, background: loading || form.availableDays.length === 0 ? '#9CA3AF' : 'linear-gradient(135deg, #059669, #0D9488)', color: 'white', padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 16px rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />
                    Creating Account…
                  </>
                ) : '✅ Create Doctor Account'}
              </button>
            )}
          </div>

          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 16 }}>
            By registering you agree to SmileCare's terms of service.
          </p>
        </motion.div>
      </div>
    </div>
  );
}