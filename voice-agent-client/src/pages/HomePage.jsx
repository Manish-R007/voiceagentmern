import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTooth, FaCalendarCheck, FaUserMd, FaStar, FaPhone,
  FaEnvelope, FaMapMarkerAlt, FaBars, FaTimes, FaArrowRight,
  FaShieldAlt, FaClock, FaCheckCircle, FaMicrophoneAlt,
  FaSignOutAlt, FaChevronDown, FaWhatsapp, FaInstagram,
  FaFacebook, FaHeartbeat, FaTeeth, FaStethoscope
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NAVY  = '#0B1F3A';
const GOLD  = '#C9A84C';
const CREAM = '#FAF8F3';

const SPEC_COLORS = {
  'General Dentist':   { bg: '#EEF2FF', text: '#4338CA' },
  'Orthodontist':      { bg: '#FDF4FF', text: '#7E22CE' },
  'Cosmetic Dentist':  { bg: '#FFF1F5', text: '#BE185D' },
  'Periodontist':      { bg: '#ECFDF5', text: '#065F46' },
  'Endodontist':       { bg: '#FFF7ED', text: '#9A3412' },
  'Oral Surgeon':      { bg: '#FEF2F2', text: '#991B1B' },
  'Pediatric Dentist': { bg: '#FEFCE8', text: '#854D0E' },
  'Prosthodontist':    { bg: '#F0FDFA', text: '#0F766E' },
};
const specStyle = s => SPEC_COLORS[s] || { bg: '#F3F4F6', text: '#374151' };

const Stars = ({ n = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} style={{ fontSize: 10, color: i < n ? GOLD : '#E5E7EB' }} />
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════════════════ */
function LandingPage({ onLogin, onRegister, onDoctorLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const services = [
    { icon: <FaTeeth />,        title: 'General Dentistry',  desc: 'Comprehensive check-ups, fillings, and preventative care for lasting oral health.' },
    { icon: <FaTooth />,        title: 'Cosmetic Dentistry', desc: 'Veneers, whitening, and smile design crafted by aesthetic specialists.' },
    { icon: <FaStethoscope />,  title: 'Orthodontics',       desc: 'Braces and clear aligners precisely tailored to your bite and lifestyle.' },
    { icon: <FaHeartbeat />,    title: 'Oral Surgery',       desc: 'Implants, extractions, and corrective procedures performed with precision.' },
    { icon: <FaMicrophoneAlt />,title: 'AI Booking — Sarah', desc: '24/7 voice assistant for instant, confirmed appointment scheduling.' },
    { icon: <FaShieldAlt />,    title: 'Emergency Care',     desc: 'Same-day reserved slots for urgent pain relief and dental trauma.' },
  ];

  const steps = [
    { n: '01', title: 'Create your account',  desc: 'Register in under a minute with just your name, email, and password.' },
    { n: '02', title: 'Talk to Sarah',          desc: 'Open the voice widget and speak naturally — Sarah understands context.' },
    { n: '03', title: 'Confirmed instantly',    desc: 'A confirmation email lands the moment Sarah books your appointment.' },
  ];

  const testimonials = [
    { name: 'Priya M.',   rating: 5, treat: 'Smile Design',    text: 'Booked a consultation at midnight and received an email within seconds. The care exceeded every expectation.' },
    { name: 'James T.',   rating: 5, treat: 'Orthodontics',    text: 'Sarah handled everything — no hold music, no back-and-forth. The smoothest booking experience I have ever had.' },
    { name: 'Ananya S.',  rating: 5, treat: 'Teeth Whitening', text: 'The clinic feels like a luxury spa. Sarah matched me with the perfect specialist for my concerns.' },
    { name: 'Rahul D.',   rating: 4, treat: 'General Checkup', text: 'Effortlessly modern. The AI assistant remembered my details and the whole visit was seamless.' },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: CREAM }} className="min-h-screen overflow-x-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.022]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '256px' }} />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{ background: scrolled ? `${NAVY}F8` : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', transition: 'all 0.4s' }}
        className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaTooth style={{ color: NAVY, fontSize: 17 }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", color: scrolled ? 'white' : NAVY, fontSize: 19, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.3px' }}>SmileCare</p>
              <p style={{ color: GOLD, fontSize: 10, letterSpacing: '0.18em', fontWeight: 600, marginTop: 1 }}>DENTAL CLINIC</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Services','How It Works','Testimonials','Contact'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
                style={{ color: scrolled ? 'rgba(255,255,255,0.7)' : NAVY, fontSize: 14, fontWeight: 500 }}
                className="hover:opacity-100 transition-opacity">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={onDoctorLogin}
              style={{ color: GOLD, border: `1px solid ${GOLD}50`, fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 10 }}
              className="hover:bg-white/5 transition">Doctor Portal</button>
            <button onClick={onLogin}
              style={{ color: scrolled ? 'rgba(255,255,255,0.75)' : NAVY, fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 10 }}
              className="hover:bg-black/5 transition">Sign In</button>
            <button onClick={onRegister}
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, color: NAVY, fontSize: 13, fontWeight: 700, padding: '10px 22px', borderRadius: 12 }}
              className="hover:scale-105 transition-transform shadow-lg">Get Started</button>
          </div>

          <button className="md:hidden" style={{ color: scrolled ? 'white' : NAVY }} onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ background: NAVY, borderTop: `1px solid ${GOLD}25`, padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Services','How It Works','Testimonials','Contact'].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: 500 }}
                  onClick={() => setMenuOpen(false)}>{l}</a>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={onLogin} style={{ flex: 1, border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>Sign In</button>
                <button onClick={onRegister} style={{ flex: 1, background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, color: NAVY, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>Get Started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(155deg, ${NAVY} 0%, #0D2647 55%, #0B3558 100%)`, minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingTop: 96, paddingBottom: 64 }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -180, right: -180, width: 640, height: 640, border: `1px solid ${GOLD}15`, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: -80, right: -80, width: 420, height: 420, border: `1px solid ${GOLD}10`, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: 80, left: '8%', width: 280, height: 280, background: `radial-gradient(circle, ${GOLD}07 0%, transparent 70%)` }} />
        </div>

        <div className="max-w-6xl mx-auto px-8 w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${GOLD}18`, border: `1px solid ${GOLD}40`, color: GOLD, fontSize: 11, fontWeight: 700, padding: '6px 16px', borderRadius: 30, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, background: GOLD, borderRadius: '50%' }} className="animate-pulse" />
                AI-Powered Dental Care
              </div>

              <h1 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 'clamp(38px, 5.5vw, 66px)', lineHeight: 1.08, fontWeight: 900, letterSpacing: '-1px', marginBottom: 24 }}>
                Exceptional Care<br /><em style={{ color: GOLD }}>Begins Here.</em>
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 17, lineHeight: 1.85, maxWidth: 460, marginBottom: 36 }}>
                Meet <strong style={{ color: 'white', fontWeight: 600 }}>Sarah</strong>, your 24/7 AI dental receptionist. Book appointments, get expert guidance, and connect with our specialist team — entirely by voice.
              </p>

              <div className="flex flex-wrap gap-4" style={{ marginBottom: 48 }}>
                <button onClick={onRegister}
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, color: NAVY, fontWeight: 700, fontSize: 14, padding: '14px 32px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8 }}
                  className="hover:scale-105 transition-transform shadow-2xl">
                  Book a Consultation <FaArrowRight style={{ fontSize: 11 }} />
                </button>
                <button onClick={onLogin}
                  style={{ color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 500, padding: '14px 32px', borderRadius: 16 }}
                  className="hover:bg-white/5 transition">Sign In</button>
              </div>

              <div style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: 36 }} className="grid grid-cols-3 gap-6">
                {[['2,500+','Smiles restored'], ['15+','Specialists'], ['24/7','AI availability']].map(([n, l]) => (
                  <div key={l}>
                    <p style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{n}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6, letterSpacing: '0.04em' }}>{l}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sarah card */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center relative">
              <div style={{ position: 'absolute', inset: -40, background: `radial-gradient(circle, ${GOLD}12 0%, transparent 65%)`, pointerEvents: 'none' }} />
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(24px)', borderRadius: 28, padding: 36, width: 340, position: 'relative' }}>

                <div style={{ position: 'absolute', top: 18, right: 18, background: '#10B981', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }} className="animate-pulse" />
                  <span style={{ color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
                </div>

                <div style={{ width: 68, height: 68, background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: `0 14px 40px ${GOLD}40` }}>
                  <FaMicrophoneAlt style={{ color: NAVY, fontSize: 26 }} />
                </div>

                <p style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Hi, I'm Sarah</p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 22 }}>Your AI Dental Receptionist</p>

                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
                  {['Book & reschedule appointments','Answer dental questions 24/7','Find specialists by need','Send instant confirmations'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                      <FaCheckCircle style={{ color: GOLD, fontSize: 10, flexShrink: 0 }} />
                      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{t}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 18 }}>
                  {[0.28, 0.5, 0.78, 1, 0.68, 0.88, 0.48, 0.32, 0.6, 0.28].map((h, i) => (
                    <div key={i} style={{ width: 3, height: h * 32, background: `linear-gradient(to top, ${GOLD}80, ${GOLD})`, borderRadius: 3 }} className="animate-pulse" />
                  ))}
                  <span style={{ color: GOLD, fontSize: 11, marginLeft: 8, fontWeight: 600 }}>Listening…</span>
                </div>

                <button onClick={onRegister}
                  style={{ width: '100%', background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, color: NAVY, fontWeight: 700, fontSize: 14, padding: '12px 0', borderRadius: 13 }}
                  className="hover:opacity-90 transition">Talk to Sarah →</button>
              </div>
            </motion.div>
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.2)', position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)' }} className="animate-bounce">
          <FaChevronDown />
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────────────── */}
      <section id="services" style={{ background: 'white', padding: '96px 0' }}>
        <div className="max-w-6xl mx-auto px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 56 }}>
            <p style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>Our Expertise</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.15 }}>
              Comprehensive care,<br /><em>crafted around you.</em>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ border: '1.5px solid #F0EEE8', borderRadius: 20, padding: 30, cursor: 'pointer', transition: 'all 0.3s' }}
                className="group hover:shadow-xl hover:-translate-y-1 hover:border-transparent">
                <div style={{ width: 50, height: 50, background: `${GOLD}14`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, transition: 'background 0.3s' }}>
                  <span style={{ color: GOLD, fontSize: 18 }}>{s.icon}</span>
                </div>
                <h3 style={{ color: NAVY, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#6B7280', fontSize: 13.5, lineHeight: 1.75 }}>{s.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: GOLD, fontSize: 13, fontWeight: 600, marginTop: 18 }}>
                  Learn more <FaArrowRight style={{ fontSize: 10 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: CREAM, padding: '96px 0' }}>
        <div className="max-w-4xl mx-auto px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>Simple Process</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, lineHeight: 1.15 }}>
              From sign-up to confirmed<br />appointment in three steps.
            </h2>
          </motion.div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 40, left: '12%', right: '12%', height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)` }} className="hidden md:block" />
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  style={{ textAlign: 'center' }}>
                  <div style={{ width: 80, height: 80, background: i === 1 ? `linear-gradient(135deg, ${GOLD}, #E8C96A)` : NAVY, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: i === 1 ? `0 12px 32px ${GOLD}35` : 'none' }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", color: i === 1 ? NAVY : GOLD, fontSize: 22, fontWeight: 900 }}>{s.n}</span>
                  </div>
                  <h3 style={{ color: NAVY, fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.75 }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginTop: 56 }}>
            <button onClick={onRegister}
              style={{ background: NAVY, color: 'white', fontWeight: 600, fontSize: 14, padding: '14px 40px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              className="hover:opacity-90 transition">
              Create your free account <FaArrowRight style={{ fontSize: 11 }} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section id="testimonials" style={{ background: NAVY, padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -160, width: 520, height: 520, border: `1px solid ${GOLD}12`, borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 48 }}>
            <p style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>Patient Stories</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, lineHeight: 1.15 }}>
              Trusted by thousands<br /><em style={{ color: GOLD }}>across the city.</em>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 26 }}>
                <Stars n={t.rating} />
                <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13.5, lineHeight: 1.8, margin: '14px 0 16px' }}>"{t.text}"</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                  <p style={{ color: GOLD, fontSize: 12, marginTop: 3 }}>{t.treat}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCTOR CTA ──────────────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '72px 0' }}>
        <div className="max-w-5xl mx-auto px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ background: `linear-gradient(135deg, ${NAVY}, #0D2B52)`, borderRadius: 26, padding: '48px 44px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, border: `1px solid ${GOLD}15`, borderRadius: '50%', pointerEvents: 'none' }} />
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div style={{ width: 60, height: 60, background: `${GOLD}1A`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaUserMd style={{ color: GOLD, fontSize: 24 }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Are you a dental professional?</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 460, lineHeight: 1.75 }}>
                  Join the SmileCare network. Set your availability and let Sarah automatically fill your schedule with qualified patients.
                </p>
              </div>
              <button onClick={onDoctorLogin}
                style={{ background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, color: NAVY, fontWeight: 700, fontSize: 14, padding: '13px 28px', borderRadius: 14, flexShrink: 0, whiteSpace: 'nowrap' }}
                className="hover:scale-105 transition-transform">Doctor Portal →</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────────────────── */}
      <section id="contact" style={{ background: CREAM, padding: '96px 0' }}>
        <div className="max-w-5xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>Contact</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 32 }}>
              Let's talk about<br />your smile.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { icon: <FaPhone />,        label: 'Call us',    val: '+1 (555) 123-4567' },
                { icon: <FaEnvelope />,     label: 'Email',      val: 'hello@smilecaredental.com' },
                { icon: <FaMapMarkerAlt />, label: 'Visit us',   val: '123 Dental Ave, Suite 100' },
                { icon: <FaClock />,        label: 'Open hours', val: 'Mon–Fri 9–6 · Sat 10–4' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, background: `${GOLD}14`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: GOLD, fontSize: 14 }}>{c.icon}</span>
                  </div>
                  <div>
                    <p style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{c.label}</p>
                    <p style={{ color: NAVY, fontSize: 15, fontWeight: 500, marginTop: 2 }}>{c.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            style={{ background: 'white', borderRadius: 22, padding: 34, boxShadow: '0 4px 40px rgba(11,31,58,0.07)' }}>
            <h3 style={{ color: NAVY, fontWeight: 700, fontSize: 19, marginBottom: 22 }}>Send a message</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[{ t: 'text', p: 'Your full name' }, { t: 'email', p: 'Email address' }, { t: 'tel', p: 'Phone number' }].map((f, i) => (
                <input key={i} type={f.t} placeholder={f.p}
                  style={{ width: '100%', padding: '12px 15px', border: '1.5px solid #EAE9E3', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = '#EAE9E3'} />
              ))}
              <textarea rows={4} placeholder="Your message…"
                style={{ width: '100%', padding: '12px 15px', border: '1.5px solid #EAE9E3', borderRadius: 12, fontSize: 14, color: NAVY, outline: 'none', resize: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e => e.target.style.borderColor = '#EAE9E3'} />
              <button style={{ width: '100%', background: NAVY, color: 'white', fontWeight: 600, fontSize: 14, padding: '14px 0', borderRadius: 12, fontFamily: "'DM Sans', sans-serif" }}
                className="hover:opacity-90 transition">Send Message</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: NAVY, borderTop: `1px solid ${GOLD}18`, padding: '44px 0' }}>
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaTooth style={{ color: NAVY, fontSize: 14 }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 16, fontWeight: 700 }}>SmileCare Dental</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>© {new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Powered by Sarah AI · Your virtual dental receptionist</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {[FaFacebook, FaInstagram, FaWhatsapp].map((Icon, i) => (
              <button key={i} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                className="hover:bg-white/10 transition">
                <Icon style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }} />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   DASHBOARD  (logged in)
══════════════════════════════════════════════════════════════════════════ */
function Dashboard({ user, onLogout }) {
  const [doctors, setDoctors]       = useState([]);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError]     = useState('');
  const [filter, setFilter]         = useState('All');
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setDocLoading(true); setDocError('');
    try {
      const data = await (await fetch(`${API}/api/doctors`)).json();
      if (data.success) setDoctors(data.doctors || []);
      else setDocError('Could not load doctors.');
    } catch { setDocError('Could not connect to server.'); }
    finally { setDocLoading(false); }
  };

  const specs    = ['All', ...Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)))];
  const filtered = filter === 'All' ? doctors : doctors.filter(d => d.specialization === filter);
  const role     = user?.role || 'patient';
  const initial  = user?.name?.charAt(0).toUpperCase() || '?';
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F6F2', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{ background: 'white', borderBottom: '1px solid #EDECE7', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaTooth style={{ color: NAVY, fontSize: 16 }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: 18, fontWeight: 700, lineHeight: 1 }}>SmileCare</p>
              <p style={{ color: GOLD, fontSize: 10, letterSpacing: '0.16em', fontWeight: 600, marginTop: 2 }}>DENTAL</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F7F6F2', border: '1px solid #EDECE7', borderRadius: 14, padding: '8px 16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: role === 'doctor' ? 'linear-gradient(135deg, #059669, #0D9488)' : `linear-gradient(135deg, ${NAVY}, #0D2647)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: role === 'doctor' ? 'white' : GOLD, fontWeight: 700, fontSize: 15 }}>
                {initial}
              </div>
              <div>
                <p style={{ color: NAVY, fontWeight: 600, fontSize: 14, lineHeight: 1 }}>{user?.name}</p>
                <p style={{ color: role === 'doctor' ? '#059669' : GOLD, fontSize: 11, marginTop: 3, fontWeight: 600, textTransform: 'capitalize' }}>{role}</p>
              </div>
            </div>
            <button onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#9CA3AF', fontSize: 13, fontWeight: 500, border: '1px solid #E5E7EB', padding: '10px 16px', borderRadius: 12 }}
              className="hover:text-red-500 hover:border-red-200 transition">
              <FaSignOutAlt /> Sign Out
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(m => !m)} style={{ color: NAVY }}>
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ background: 'white', borderTop: '1px solid #EDECE7', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontWeight: 700 }}>{initial}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: NAVY }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>{role}</p>
                </div>
              </div>
              <button onClick={onLogout} style={{ color: '#EF4444', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaSignOutAlt /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Welcome banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #0D2647 100%)`, borderRadius: 22, padding: '36px 40px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', opacity: 0.05 }}>
            <FaTooth style={{ fontSize: 130, color: 'white' }} />
          </div>
          <div style={{ position: 'absolute', top: -60, right: 180, width: 180, height: 180, border: `1px solid ${GOLD}18`, borderRadius: '50%', pointerEvents: 'none' }} />
          <p style={{ color: `${GOLD}BB`, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{greeting()},</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 30, fontWeight: 700, marginBottom: 8 }}>
            Welcome back, {user?.name?.split(' ')[0]}. 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 460, lineHeight: 1.75 }}>
            Sarah is live and ready to assist. Use the chat widget in the bottom-right corner to book, reschedule, or ask dental questions.
          </p>
        </motion.div>

        {/* Sarah card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'white', border: '1px solid #EDECE7', borderRadius: 22, padding: '28px 32px', marginBottom: 24, boxShadow: '0 2px 16px rgba(11,31,58,0.04)' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-7">
            <div style={{ width: 68, height: 68, background: `linear-gradient(135deg, ${GOLD}, #E8C96A)`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 28px ${GOLD}35`, flexShrink: 0 }}>
              <FaMicrophoneAlt style={{ color: NAVY, fontSize: 26 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }} className="justify-center md:justify-start">
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: 21, fontWeight: 700 }}>Talk to Sarah</h2>
                <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.07em' }}>LIVE</span>
              </div>
              <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.75, maxWidth: 440, marginBottom: 14 }}>
                Ask Sarah to book, reschedule or cancel appointments, check doctor availability, or answer any dental question — hands-free.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {['"Book me a checkup"','"Find an orthodontist"','"I have a toothache"','"What are your hours?"'].map(s => (
                  <span key={s} style={{ background: '#F7F6F2', border: '1px solid #EDECE7', color: '#6B7280', fontSize: 12, padding: '5px 12px', borderRadius: 20, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              {[0.28, 0.55, 0.88, 0.7, 0.45, 0.82, 0.38, 0.6, 0.42, 0.25].map((h, i) => (
                <div key={i} style={{ width: 4, height: h * 40, background: `linear-gradient(to top, ${GOLD}55, ${GOLD})`, borderRadius: 3 }} className="animate-pulse" />
              ))}
            </div>
          </div>
          <p style={{ color: '#C4C2BB', fontSize: 12, marginTop: 20, paddingTop: 18, borderTop: '1px solid #F0EEE8' }}>
            💡 Press the chat bubble in the bottom-right corner to start a conversation with Sarah.
          </p>
        </motion.div>

        {/* Doctors */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: 24, fontWeight: 700 }}>Our Specialists</h2>
              <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>
                {docLoading ? 'Loading…' : `${filtered.length} specialist${filtered.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            {specs.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {specs.map(s => (
                  <button key={s} onClick={() => setFilter(s)}
                    style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, transition: 'all 0.2s', background: filter === s ? NAVY : 'white', color: filter === s ? 'white' : '#6B7280', border: `1.5px solid ${filter === s ? NAVY : '#E5E7EB'}` }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {docLoading && (
            <div className="grid md:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} style={{ background: 'white', borderRadius: 18, padding: 22 }} className="animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div style={{ width: 54, height: 54, background: '#F3F4F6', borderRadius: 14 }} />
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ height: 13, background: '#F3F4F6', borderRadius: 6, width: '70%', marginBottom: 8 }} />
                      <div style={{ height: 11, background: '#F3F4F6', borderRadius: 6, width: '45%' }} />
                    </div>
                  </div>
                  <div style={{ height: 11, background: '#F3F4F6', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 11, background: '#F3F4F6', borderRadius: 6, width: '80%' }} />
                </div>
              ))}
            </div>
          )}

          {docError && !docLoading && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 12 }}>{docError}</p>
              <button onClick={fetchDoctors} style={{ background: '#DC2626', color: 'white', padding: '8px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>Retry</button>
            </div>
          )}

          {!docLoading && !docError && (
            <div className="grid md:grid-cols-3 gap-5">
              {filtered.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
                  <FaUserMd style={{ fontSize: 40, color: '#D1D5DB', margin: '0 auto 12px' }} />
                  <p style={{ color: '#9CA3AF' }}>No doctors found for this filter.</p>
                </div>
              ) : filtered.map((doc, i) => {
                const name = doc.name || 'Doctor';
                const last = name.replace(/^Dr\.?\s*/i, '').split(' ').slice(-1)[0];
                const sc   = specStyle(doc.specialization);
                return (
                  <motion.div key={doc._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ background: 'white', borderRadius: 18, padding: 22, border: '1px solid #EDECE7', cursor: 'pointer', transition: 'all 0.3s' }}
                    className="hover:shadow-lg hover:-translate-y-0.5">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                      {doc.photo
                        ? <img src={doc.photo} alt={name} style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 54, height: 54, background: `linear-gradient(135deg, ${NAVY}, #0D2647)`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                      }
                      <div>
                        <h3 style={{ color: NAVY, fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{name}</h3>
                        <span style={{ background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{doc.specialization}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5, color: '#6B7280', marginBottom: 12 }}>
                      {doc.qualification && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaCheckCircle style={{ color: '#10B981', fontSize: 10, flexShrink: 0 }} />{doc.qualification}</span>}
                      {doc.experience > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaClock style={{ color: GOLD, fontSize: 10, flexShrink: 0 }} />{doc.experience} years experience</span>}
                      {doc.availableDays?.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaCalendarCheck style={{ color: '#3B82F6', fontSize: 10, flexShrink: 0 }} />{doc.availableDays.slice(0,3).map(d => d.slice(0,3)).join(', ')}{doc.availableDays.length > 3 && ` +${doc.availableDays.length - 3}`}</span>}
                    </div>

                    {doc.bio && <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.65, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.bio}</p>}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <Stars n={5} />
                      <button style={{ background: NAVY, color: 'white', fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: 10, fontFamily: "'DM Sans', sans-serif" }}
                        className="hover:opacity-90 transition">Book — Dr. {last}</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[
            { icon: <FaUserMd />,        label: 'Specialists',    value: doctors.length || '–', accent: GOLD },
            { icon: <FaCalendarCheck />, label: 'Appointments',   value: '24 / 7',              accent: '#10B981' },
            { icon: <FaMicrophoneAlt />, label: 'AI Assistant',   value: 'Live',                accent: '#8B5CF6' },
            { icon: <FaStar />,          label: 'Patient Rating', value: '4.9 ★',              accent: GOLD },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #EDECE7', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, background: `${s.accent}14`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent, fontSize: 15, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ color: NAVY, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
                <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════════════════ */
export default function HomePage({ user, onLogin, onRegister, onDoctorLogin, onLogout }) {
  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <Dashboard user={user} onLogout={onLogout} />
        </motion.div>
      ) : (
        <motion.div key="land" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <LandingPage onLogin={onLogin} onRegister={onRegister} onDoctorLogin={onDoctorLogin} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}