import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTooth, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaUser, FaPhone, FaArrowLeft, FaCheckCircle,
  FaCalendarCheck, FaRobot, FaShieldAlt
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PatientRegister({ onSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: ''
  });
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Password strength checker
  const getStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8)             score++;
    if (/[A-Z]/.test(p))           score++;
    if (/[0-9]/.test(p))           score++;
    if (/[^A-Za-z0-9]/.test(p))    score++;
    const map = [
      { label: 'Too short', color: 'bg-red-400'    },
      { label: 'Weak',      color: 'bg-orange-400' },
      { label: 'Fair',      color: 'bg-yellow-400' },
      { label: 'Good',      color: 'bg-blue-400'   },
      { label: 'Strong',    color: 'bg-green-500'  },
    ];
    return { score, ...map[score] };
  };

  const strength = getStrength(form.password);
  const passwordsMatch = form.confirm && form.password === form.confirm;
  const passwordsMismatch = form.confirm && form.password !== form.confirm;

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/api/auth/patient/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     form.name,
          email:    form.email,
          phone:    form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Registration failed'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess(true);
      setTimeout(() => { if (onSuccess) onSuccess(data.user); }, 1500);
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheckCircle className="text-white text-5xl" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome aboard!</h2>
          <p className="text-gray-500 mb-4">Your account has been created successfully.</p>
          <div className="flex items-center justify-center gap-2 text-blue-500">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-gray-400 mt-3">Redirecting you now...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-5 gap-0 rounded-3xl shadow-2xl overflow-hidden">

        {/* ── Left panel (2/5) ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2 bg-gradient-to-br from-blue-600 to-cyan-500 p-10 text-white flex flex-col justify-between"
        >
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white/20 p-3 rounded-2xl">
                <FaTooth className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SmileCare Dental</h1>
                <p className="text-white/70 text-xs">Your Trusted Dental Partner</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-3 leading-tight">
              Join the<br />
              <span className="text-white/80">SmileCare Family!</span>
            </h2>
            <p className="text-white/80 mb-8 text-sm leading-relaxed">
              Create your free account and experience modern dental care with Sarah, your 24/7 AI assistant.
            </p>

            <div className="space-y-5">
              {[
                { icon: <FaCalendarCheck />, title: 'Easy Booking',      desc: 'Book appointments anytime, 24/7' },
                { icon: <FaRobot />,         title: 'AI Assistant Sarah', desc: 'Voice-powered dental receptionist' },
                { icon: <FaEnvelope />,      title: 'Email Confirmations', desc: 'Instant appointment confirmations' },
                { icon: <FaShieldAlt />,     title: 'Secure & Private',  desc: 'Your data is encrypted & safe' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
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

          <div className="mt-10 bg-white/10 rounded-2xl p-4">
            <p className="text-white/70 text-xs mb-1">Already have an account?</p>
            <button onClick={onSwitchToLogin}
              className="text-white font-semibold hover:underline text-sm flex items-center gap-1">
              <FaArrowLeft className="text-xs" /> Back to Sign In
            </button>
          </div>
        </motion.div>

        {/* ── Right panel (3/5) ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-3 bg-white p-10 overflow-y-auto"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-1">Create Account</h3>
          <p className="text-gray-500 text-sm mb-7">Fill in your details to get started — it's free!</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text" name="name" required
                  value={form.name} onChange={handle}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email" name="email" required
                  value={form.email} onChange={handle}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition placeholder-gray-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="tel" name="phone"
                  value={form.phone} onChange={handle}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" required
                  value={form.password} onChange={handle}
                  placeholder="Min. 6 characters"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition placeholder-gray-400"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.score <= 1 ? 'text-red-500' :
                    strength.score === 2 ? 'text-yellow-500' :
                    strength.score === 3 ? 'text-blue-500' : 'text-green-500'
                  }`}>
                    {strength.label}
                  </p>
                </div>
              )}

              {/* Password hints */}
              <div className="mt-2 grid grid-cols-2 gap-1">
                {[
                  { label: '8+ characters',     met: form.password.length >= 8 },
                  { label: 'Uppercase letter',  met: /[A-Z]/.test(form.password) },
                  { label: 'Number',            met: /[0-9]/.test(form.password) },
                  { label: 'Special character', met: /[^A-Za-z0-9]/.test(form.password) },
                ].map((hint, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-xs transition-colors ${
                    hint.met ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    <FaCheckCircle className={hint.met ? 'text-green-500' : 'text-gray-300'} />
                    {hint.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showConfirm ? 'text' : 'password'} name="confirm" required
                  value={form.confirm} onChange={handle}
                  placeholder="Re-enter your password"
                  className={`w-full pl-11 pr-12 py-3 border rounded-xl text-sm
                              focus:outline-none focus:ring-2 focus:border-transparent transition placeholder-gray-400 ${
                    passwordsMismatch
                      ? 'border-red-300 focus:ring-red-400'
                      : passwordsMatch
                      ? 'border-green-300 focus:ring-green-400'
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
                {passwordsMatch && (
                  <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-red-500 mt-1">⚠️ Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-500 mt-1">✅ Passwords match</p>
              )}
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

            {/* Terms */}
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button
              type="submit" disabled={loading || passwordsMismatch}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-3.5 rounded-xl
                         font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300
                         disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating your account...
                </>
              ) : (
                '🎉 Create My Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:underline">
              Sign In
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}