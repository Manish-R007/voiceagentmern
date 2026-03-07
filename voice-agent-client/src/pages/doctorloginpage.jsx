import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTooth, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaArrowLeft, FaUserMd, FaCalendarCheck, FaUsers,
  FaBell, FaUserPlus, FaArrowRight
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DoctorLogin({ onSuccess, onSwitchToPatient, onSwitchToRegister }) {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/api/auth/doctor/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Invalid credentials'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onSuccess) onSuccess(data.user);
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-3xl shadow-2xl overflow-hidden">

        {/* ── Left panel ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-500 p-10 text-white flex flex-col justify-between"
        >
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white/20 p-3 rounded-2xl">
                <FaTooth className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SmileCare Dental</h1>
                <p className="text-white/70 text-sm">Doctor Portal</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Doctor Portal<br />
              <span className="text-white/80">Manage your schedule.</span>
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Sign in to view your appointments, patient list, and get notified instantly when Sarah books a new appointment with you.
            </p>

            {/* Features */}
            <div className="space-y-5">
              {[
                { icon: <FaCalendarCheck />, title: 'Appointment Dashboard',  desc: 'View all your upcoming appointments' },
                { icon: <FaUsers />,         title: 'Patient Management',     desc: 'Access patient records easily' },
                { icon: <FaBell />,          title: 'Instant Notifications',  desc: 'Email alerts for every new booking' },
                { icon: <FaUserMd />,        title: 'Profile Management',     desc: 'Update your availability & bio' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-white/70 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Switch to patient */}
          <div className="mt-10 bg-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="text-2xl">👤</div>
            <div>
              <p className="text-white/70 text-sm">Are you a patient?</p>
              <button onClick={onSwitchToPatient}
                className="text-white font-semibold hover:underline text-sm flex items-center gap-1">
                <FaArrowLeft className="text-xs" /> Patient Sign In
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Right panel ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 flex flex-col justify-center"
        >
          {/* Doctor badge */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
              <FaUserMd className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Doctor Sign In</h3>
              <p className="text-gray-500 text-sm">Access your doctor dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email" name="email" required
                  value={form.email} onChange={handle}
                  placeholder="doctor@smilecaredental.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" required
                  value={form.password} onChange={handle}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2"
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white py-3.5 rounded-xl
                         font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300
                         disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">New to SmileCare?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register CTA */}
          <button
            onClick={onSwitchToRegister}
            className="w-full border-2 border-emerald-400 text-emerald-600 py-3.5 rounded-xl font-semibold
                       hover:bg-emerald-50 hover:border-emerald-500 transition-all duration-300
                       flex items-center justify-center gap-2"
          >
            <FaUserPlus /> Create Doctor Account <FaArrowRight className="text-xs" />
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Register your profile so patients can find and book with you through Sarah.
          </p>

          {/* Security note */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
            🔒 Secure doctor portal — JWT authenticated
          </div>
        </motion.div>
      </div>
    </div>
  );
}