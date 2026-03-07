import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTooth, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaUserPlus } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PatientLogin({ onSuccess, onSwitchToRegister, onSwitchToDoctor }) {
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
      const res  = await fetch(`${API}/api/auth/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onSuccess) onSuccess(data.user);
    } catch { setError('Could not connect to server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-3xl shadow-2xl overflow-hidden">

        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-600 to-cyan-500 p-10 text-white flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white/20 p-3 rounded-2xl">
                <FaTooth className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SmileCare Dental</h1>
                <p className="text-white/70 text-sm">Your Trusted Dental Partner</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Welcome back!<br />
              <span className="text-white/80">Good to see you again.</span>
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Sign in to manage your appointments, view your records, and connect with Sarah 24/7.
            </p>

            <div className="space-y-4">
              {[
                { icon: '📅', text: 'View & manage appointments' },
                { icon: '🤖', text: 'Chat with Sarah anytime' },
                { icon: '📧', text: 'Get email confirmations' },
                { icon: '🦷', text: 'Access dental records' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/90">
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 bg-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
            <div>
              <p className="text-sm text-white/70">Are you a doctor?</p>
              <button onClick={onSwitchToDoctor} className="text-white font-semibold hover:underline text-sm flex items-center gap-1">
                Sign in as Doctor <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 flex flex-col justify-center"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Patient Sign In</h3>
          <p className="text-gray-500 mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" name="email" required
                  value={form.email} onChange={handle}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" required
                  value={form.password} onChange={handle}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                ⚠️ {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-3 rounded-xl font-semibold
                         hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <button onClick={onSwitchToRegister}
                className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                <FaUserPlus className="text-xs" /> Create Account
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Protected by JWT authentication</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}