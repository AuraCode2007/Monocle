import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, ChevronRight, Hammer, Zap, Radio, Shield } from 'lucide-react';
import { AUTH_USERS, createMockJwt, saveSession } from '../auth';
import { useLanguage } from '../i18n';

/* ── Department cards (using the original red/green/dark palette) ── */
const DEPT_CARDS = [
  {
    id: 'TMS',
    icon: Hammer,
    abbr: 'TMS',
    label: 'Track Management System',
    sub: 'Civil / Track Engineering',
    desc: 'Track geometry, ballast screening, USFD testing, sleeper renewal.',
    accent: '#EA580C',
    border: 'rgba(234,88,12,0.35)',
    bg: 'rgba(234,88,12,0.08)',
  },
  {
    id: 'TDMS',
    icon: Zap,
    abbr: 'TDMS',
    label: 'Traction Distribution Management',
    sub: 'Electrical / TRD',
    desc: '25 kV OHE catenary, traction substations, power isolation shutdowns.',
    accent: '#D97706',
    border: 'rgba(217,119,6,0.35)',
    bg: 'rgba(217,119,6,0.08)',
  },
  {
    id: 'SMMS',
    icon: Radio,
    abbr: 'SMMS',
    label: 'Signalling Maintenance & Management',
    sub: 'Signal & Telecom (S&T)',
    desc: 'Electronic Interlocking, point machines, DAC, signal aspect testing.',
    accent: '#2563EB',
    border: 'rgba(37,99,235,0.35)',
    bg: 'rgba(37,99,235,0.08)',
  },
  {
    id: 'CONTROL_ROOM',
    icon: Shield,
    abbr: 'COA',
    label: 'Control Office Application',
    sub: 'Central Control / Operations',
    desc: 'Master corridor timetable, train paths, PTW issuance & possession solver.',
    accent: '#7C3AED',
    border: 'rgba(124,58,237,0.35)',
    bg: 'rgba(124,58,237,0.08)',
  },
];

export default function LoginPage({ onLoginSuccess }) {
  const { t } = useLanguage();
  const ui = t.ui;

  const [step, setStep]                 = useState(1);
  const [selectedDept, setSelectedDept] = useState(null);
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredDept, setHoveredDept]   = useState(null);

  /* ── Step 1: select dept ─────────────────────────────────── */
  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setError('');
    const deptUser = AUTH_USERS.find((u) => u.department === dept.id);
    if (deptUser) {
      setUsername(deptUser.username);
      setPassword(deptUser.password);
    } else {
      setUsername('');
      setPassword('');
    }
    setStep(2);
  };

  /* ── Step 2: authenticate ────────────────────────────────── */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const user = AUTH_USERS.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.department === selectedDept.id,
    );

    if (!user || user.password !== password) {
      setError(
        user
          ? 'Incorrect password. Please try again.'
          : `No ${selectedDept.abbr} account found with that username.`,
      );
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const token   = createMockJwt(user);
      const session = {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      };
      saveSession(session);
      onLoginSuccess(session);
      setIsSubmitting(false);
    }, 450);
  };

  const handleQuickFill = () => {
    const deptUser = AUTH_USERS.find((u) => u.department === selectedDept.id);
    if (deptUser) { setUsername(deptUser.username); setPassword(deptUser.password); }
  };

  /* ── Input focus helpers (original red style) ────────────── */
  const inputFocus = (e) => {
    e.target.style.borderColor = '#C41E3A';
    e.target.style.boxShadow   = '0 0 0 3px rgba(196, 30, 58, 0.10)';
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = '#E8E8E8';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div className="min-h-screen flex font-sans overflow-hidden">

      {/* ── LEFT SIDE: Railway Tunnel Background Image ── */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'url(/railway-tunnel.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Blur overlay */}
        <div
          className="absolute inset-0"
          style={{ backdropFilter: 'blur(3px)', background: 'rgba(0, 0, 0, 0.20)' }}
        />
        {/* Dark vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(11, 11, 11, 0.50) 70%, rgba(11, 11, 11, 0.70) 100%)`,
          }}
        />
        {/* Branding */}
        <div className="relative z-10 text-center px-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-widest drop-shadow-2xl" style={{ color: '#F5E6D3' }}>
            MONOCLE
          </h2>
          <p className="text-sm mt-3 uppercase tracking-[0.2em] drop-shadow-lg" style={{ color: '#F5E6D3' }}>
            Railway Operations Platform
          </p>
          <div className="mt-6 h-1 w-24 mx-auto bg-gradient-to-r from-red-600 via-white to-green-600 rounded-full" />
        </div>
      </div>

      {/* ── RIGHT SIDE: Login Form (Glassmorphism) ── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto"
        style={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', minHeight: '100vh' }}
      >
        <div className="w-full max-w-md py-6">

          {/* ── Train Wheel Logo ── */}
          <div className="flex justify-center mb-8">
            <div className="relative w-16 h-16">
              <svg className="absolute inset-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" stroke="#C41E3A" strokeWidth="2" />
                <circle cx="32" cy="32" r="25" stroke="#8B1414" strokeWidth="1.5" opacity="0.6" />
                <circle cx="32" cy="32" r="8" fill="#C41E3A" />
                <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
                <line x1="32" y1="2"  x2="32" y2="10" stroke="#2D6A4F" strokeWidth="1.5" />
                <line x1="32" y1="54" x2="32" y2="62" stroke="#2D6A4F" strokeWidth="1.5" />
                <line x1="2"  y1="32" x2="10" y2="32" stroke="#2D6A4F" strokeWidth="1.5" />
                <line x1="54" y1="32" x2="62" y2="32" stroke="#2D6A4F" strokeWidth="1.5" />
                <line x1="13" y1="13" x2="18" y2="18" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.7" />
                <line x1="51" y1="13" x2="46" y2="18" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.7" />
                <line x1="13" y1="51" x2="18" y2="46" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.7" />
                <line x1="51" y1="51" x2="46" y2="46" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.7" />
              </svg>
            </div>
          </div>

          {/* ── Glassmorphic Card ── */}
          <div
            className="rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.10)',
            }}
          >

            {/* ══════════════════════════════════════════
                STEP 1 — Department Selection
            ══════════════════════════════════════════ */}
            {step === 1 && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-black" style={{ color: '#8B1414' }}>
                    Select Department
                  </h1>
                  <p className="text-sm mt-2" style={{ color: '#2D6A4F' }}>
                    Choose your department to continue sign-in
                  </p>
                </div>

                <div className="space-y-3">
                  {DEPT_CARDS.map((dept) => {
                    const Icon = dept.icon;
                    const isHovered = hoveredDept === dept.id;
                    return (
                      <button
                        key={dept.id}
                        id={`dept-card-${dept.id}`}
                        type="button"
                        onClick={() => handleSelectDept(dept)}
                        onMouseEnter={() => setHoveredDept(dept.id)}
                        onMouseLeave={() => setHoveredDept(null)}
                        className="w-full text-left rounded-2xl p-4 transition-colors duration-200"
                        style={{
                          background: isHovered ? dept.bg : 'rgba(255,255,255,0.50)',
                          border: `2px solid ${isHovered ? dept.border : '#E8E8E8'}`,
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
                            style={{ background: dept.accent + '22', border: `1.5px solid ${dept.border}` }}
                          >
                            <Icon className="w-5 h-5 transition-colors duration-200" style={{ color: dept.accent }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className="text-[10px] font-black uppercase tracking-[0.18em] px-2 py-0.5 rounded-full transition-colors duration-200"
                                style={{ background: dept.bg, color: dept.accent, border: `1px solid ${dept.border}` }}
                              >
                                {dept.abbr}
                              </span>
                            </div>
                            <div className="text-sm font-bold truncate" style={{ color: '#0B0B0B' }}>{dept.label}</div>
                            <div className="text-xs truncate" style={{ color: '#2D6A4F' }}>{dept.sub}</div>
                          </div>
                          <ChevronRight
                            className="w-4 h-4 shrink-0 transition-colors duration-200"
                            style={{ color: isHovered ? dept.accent : '#ccc' }}
                          />
                        </div>
                        <p className="mt-2 text-xs leading-relaxed" style={{ color: '#666', paddingLeft: '52px' }}>
                          {dept.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════
                STEP 2 — Credentials
            ══════════════════════════════════════════ */}
            {step === 2 && selectedDept && (
              <>
                {/* Back button */}
                <button
                  id="login-back-btn"
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex items-center gap-1.5 mb-5 text-sm font-semibold transition-colors"
                  style={{ color: '#2D6A4F' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#C41E3A'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#2D6A4F'}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to department selection
                </button>

                {/* Selected dept badge */}
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-6"
                  style={{ background: selectedDept.bg, border: `1.5px solid ${selectedDept.border}` }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: selectedDept.accent + '22', border: `1px solid ${selectedDept.border}` }}
                  >
                    <selectedDept.icon className="w-4 h-4" style={{ color: selectedDept.accent }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: selectedDept.accent }}>
                      {selectedDept.abbr}
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#0B0B0B' }}>{selectedDept.label}</div>
                  </div>
                </div>

                {/* Form header */}
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-black" style={{ color: '#8B1414' }}>
                    Welcome Back
                  </h1>
                  <p className="text-sm mt-2" style={{ color: '#2D6A4F' }}>
                    {ui.secureSignIn || `Secure sign-in to ${selectedDept.abbr} department dashboard`}
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4" id="login-form">

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold mb-2" style={{ color: '#1B4332' }}>
                      USERNAME
                    </label>
                    <input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 transition-all"
                      style={{
                        borderColor: '#E8E8E8',
                        background: 'rgba(255, 255, 255, 0.60)',
                        color: '#0B0B0B',
                        backdropFilter: 'blur(10px)',
                      }}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold mb-2" style={{ color: '#1B4332' }}>
                      PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 transition-all pr-12"
                        style={{
                          borderColor: '#E8E8E8',
                          background: 'rgba(255, 255, 255, 0.60)',
                          color: '#0B0B0B',
                          backdropFilter: 'blur(10px)',
                        }}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: '#2D6A4F' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#C41E3A'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2D6A4F'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                      style={{
                        background: 'rgba(196, 30, 58, 0.10)',
                        border: '1px solid rgba(196, 30, 58, 0.30)',
                        color: '#8B1414',
                      }}
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* LOGIN Button */}
                  <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg font-bold uppercase tracking-[0.1em] text-white transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: isSubmitting ? '#A01018' : '#C41E3A',
                      boxShadow: isSubmitting ? 'none' : '0 0 20px rgba(196, 30, 58, 0.30)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = '#8B1414';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(196, 30, 58, 0.40)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = '#C41E3A';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(196, 30, 58, 0.30)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {isSubmitting ? 'Signing in...' : ui.login || 'Login'}
                  </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-8 pt-8 border-t-2" style={{ borderColor: 'rgba(196, 30, 58, 0.20)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase" style={{ color: '#1B4332' }}>
                      {ui.demoCredentials || 'Demo Account'}
                    </p>
                    <button
                      id="quick-fill-btn"
                      type="button"
                      onClick={handleQuickFill}
                      className="text-[10px] font-bold uppercase px-2 py-1 rounded-full transition-all"
                      style={{
                        background: 'rgba(64, 145, 108, 0.15)',
                        color: '#2D6A4F',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(64,145,108,0.30)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(64,145,108,0.15)'}
                    >
                      Quick Fill
                    </button>
                  </div>

                  <div className="space-y-2">
                    {AUTH_USERS.filter((u) => u.department === selectedDept.id).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => { setUsername(u.username); setPassword(u.password); }}
                        className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: '#E8E8E8',
                          background: 'rgba(255, 255, 255, 0.40)',
                          backdropFilter: 'blur(10px)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#C41E3A';
                          e.currentTarget.style.background = 'rgba(196, 30, 58, 0.10)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E8E8E8';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.40)';
                        }}
                      >
                        <div className="text-left">
                          <div className="text-sm font-bold" style={{ color: '#0B0B0B' }}>{u.name}</div>
                          <div className="text-xs" style={{ color: '#2D6A4F' }}>
                            @{u.username} · {u.designation}
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
