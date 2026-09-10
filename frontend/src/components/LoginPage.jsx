import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AUTH_USERS, createMockJwt, ROLE_LABELS, saveSession } from '../auth';
import { useLanguage } from '../i18n';

const DEMO_CREDENTIALS = [
  { label: 'System Admin',         email: 'admin@railsync.ai',        password: 'RailSync@123' },
  { label: 'Section Controller',   email: 'amit.verma@railsync.ai',   password: 'RailSync@123' },
  { label: 'Track Engineer',       email: 'neha.singh@railsync.ai',   password: 'RailSync@123' },
  { label: 'Traction Controller',  email: 'vikas.mehta@railsync.ai',  password: 'RailSync@123' },
  { label: 'Signal In-charge',     email: 'pooja.nair@railsync.ai',   password: 'RailSync@123' },
];

export default function LoginPage({ onLoginSuccess }) {
  const { t } = useLanguage();
  const ui = t.ui;
  const [email, setEmail]               = useState('amit.verma@railsync.ai');
  const [password, setPassword]         = useState('RailSync@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoCredentials = useMemo(() => DEMO_CREDENTIALS, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const user = AUTH_USERS.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user || user.password !== password) {
      setError('Invalid credentials. Use the demo account details listed below.');
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

<<<<<<< HEAD
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F0F0] px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[#4F4F53]/15 bg-white shadow-2xl shadow-[#4F4F53]/10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative hidden overflow-hidden bg-[#4F4F53] p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,136,198,0.35),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(209,167,81,0.25),_transparent_35%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#D1A751] p-3 text-[#4F4F53] shadow-lg shadow-[#D1A751]/20">
                <TrainFront className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-[#D1A751]">Railway Ops Platform</div>
                <h1 className="mt-1 text-3xl font-black text-[#F0F0F0]">Monocle RailSync-AI</h1>
              </div>
            </div>

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B88C6]/50 bg-[#8B88C6]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F0F0F0]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Official access control
              </div>
              <h2 className="max-w-md text-4xl font-black leading-tight text-[#F0F0F0]">
                Controlled access for corridor, possession, and safety operations.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#F0F0F0]/75">
                Secured operational dashboard for engineering, traction, signal, and control-room stakeholders.
                Every action is role-scoped and logged for approval and audit readiness.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-[#F0F0F0] sm:grid-cols-3">
              <div className="rounded-2xl border border-[#F0F0F0]/15 bg-[#F0F0F0]/10 p-3">
                <div className="text-2xl font-black text-[#8B88C6]">24/7</div>
                <div className="mt-1 text-[#F0F0F0]/75">Ops visibility</div>
              </div>
              <div className="rounded-2xl border border-[#F0F0F0]/15 bg-[#F0F0F0]/10 p-3">
                <div className="text-2xl font-black text-[#D1A751]">RBAC</div>
                <div className="mt-1 text-[#F0F0F0]/75">Role access</div>
              </div>
              <div className="rounded-2xl border border-[#F0F0F0]/15 bg-[#F0F0F0]/10 p-3">
                <div className="text-2xl font-black text-[#8B88C6]">JWT</div>
                <div className="mt-1 text-[#F0F0F0]/75">Secure auth</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#8B88C6]/15 p-2 text-[#8B88C6] ring-1 ring-[#8B88C6]/30">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#6C6C72]">{ui.secureSignIn}</div>
                <h3 className="text-2xl font-black text-[#4F4F53]">{ui.login}</h3>
              </div>
            </div>

=======
  const handleCredentialClick = (credential) => {
    setEmail(credential.email);
    setPassword(credential.password);
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
          style={{
            backdropFilter: 'blur(3px)',
            background: 'rgba(0, 0, 0, 0.20)',
          }}
        />

        {/* Dark vignette for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 50%, transparent 20%, rgba(11, 11, 11, 0.50) 70%, rgba(11, 11, 11, 0.70) 100%)
            `,
          }}
        />

        {/* Branding overlay */}
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
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12"
        style={{
          background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',
        }}
      >
        <div className="w-full max-w-md">

          {/* ── Train Wheel Logo ── */}
          <div className="flex justify-center mb-8">
            <div className="relative w-16 h-16">
              {/* Outer circle */}
              <svg className="absolute inset-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Train wheel design */}
                <circle cx="32" cy="32" r="30" stroke="#C41E3A" strokeWidth="2" />
                <circle cx="32" cy="32" r="25" stroke="#8B1414" strokeWidth="1.5" opacity="0.6" />
                
                {/* Center hub */}
                <circle cx="32" cy="32" r="8" fill="#C41E3A" />
                <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
                
                {/* Wheel spokes */}
                <line x1="32" y1="2" x2="32" y2="10" stroke="#2D6A4F" strokeWidth="1.5" />
                <line x1="32" y1="54" x2="32" y2="62" stroke="#2D6A4F" strokeWidth="1.5" />
                <line x1="2" y1="32" x2="10" y2="32" stroke="#2D6A4F" strokeWidth="1.5" />
                <line x1="54" y1="32" x2="62" y2="32" stroke="#2D6A4F" strokeWidth="1.5" />
                
                {/* Diagonal spokes */}
                <line x1="13" y1="13" x2="18" y2="18" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.7" />
                <line x1="51" y1="13" x2="46" y2="18" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.7" />
                <line x1="13" y1="51" x2="18" y2="46" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.7" />
                <line x1="51" y1="51" x2="46" y2="46" stroke="#2D6A4F" strokeWidth="1.5" opacity="0.7" />
              </svg>
            </div>
          </div>

          {/* ── Glassmorphic Card ── */}
          <div
            className="rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.10)',
            }}
          >
            {/* ── Form Header ── */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black" style={{ color: '#8B1414' }}>
                Welcome Back
              </h1>
              <p className="text-sm mt-2" style={{ color: '#2D6A4F' }}>
                {ui.secureSignIn || 'Secure sign-in to your railway operations dashboard'}
              </p>
            </div>

            {/* ── Login Form ── */}
>>>>>>> d91138328f37e3d36f0c4aab6916bfbb4abc75d9
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
<<<<<<< HEAD
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-[#6C6C72]">{ui.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#4F4F53]/20 bg-[#F0F0F0] px-3 py-3 text-sm text-[#4F4F53] outline-none transition focus:border-[#8B88C6] focus:ring-2 focus:ring-[#8B88C6]/25"
                  placeholder="name@railsync.ai"
                  autoComplete="username"
                  required
                />
=======
                <label className="block text-xs font-bold mb-2" style={{ color: '#1B4332' }}>
                  USERNAME OR EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="username"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: '#E8E8E8',
                      background: 'rgba(255, 255, 255, 0.60)',
                      color: '#0B0B0B',
                      backdropFilter: 'blur(10px)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#C41E3A';
                      e.target.style.boxShadow = '0 0 0 3px rgba(196, 30, 58, 0.10)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E8E8E8';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
>>>>>>> d91138328f37e3d36f0c4aab6916bfbb4abc75d9
              </div>

              {/* Password Input with Eye Toggle */}
              <div>
<<<<<<< HEAD
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-[#6C6C72]">{ui.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[#4F4F53]/20 bg-[#F0F0F0] px-3 py-3 text-sm text-[#4F4F53] outline-none transition focus:border-[#8B88C6] focus:ring-2 focus:ring-[#8B88C6]/25"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
=======
                <label className="block text-xs font-bold mb-2" style={{ color: '#1B4332' }}>
                  PASSWORD
                </label>
                <div className="relative">
                  <input
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
                    onFocus={(e) => {
                      e.target.style.borderColor = '#C41E3A';
                      e.target.style.boxShadow = '0 0 0 3px rgba(196, 30, 58, 0.10)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E8E8E8';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#2D6A4F' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C41E3A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2D6A4F'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
>>>>>>> d91138328f37e3d36f0c4aab6916bfbb4abc75d9
              </div>

              {/* Error Message */}
              {error && (
<<<<<<< HEAD
                <div className="flex items-start gap-2 rounded-xl border border-[#D1A751]/50 bg-[#D1A751]/15 px-3 py-2 text-sm text-[#8C6B1F]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
=======
                <div
                  className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(196, 30, 58, 0.10)',
                    border: '1px solid rgba(196, 30, 58, 0.30)',
                    color: '#8B1414',
                  }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
>>>>>>> d91138328f37e3d36f0c4aab6916bfbb4abc75d9
                  <span>{error}</span>
                </div>
              )}

              {/* LOGIN Button */}
              <button
                type="submit"
                disabled={isSubmitting}
<<<<<<< HEAD
                className="w-full rounded-xl bg-[#8B88C6] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#8B88C6]/20 transition hover:bg-[#7D79B5] disabled:cursor-not-allowed disabled:opacity-70"
=======
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
>>>>>>> d91138328f37e3d36f0c4aab6916bfbb4abc75d9
              >
                {isSubmitting ? 'Signing in...' : ui.login || 'Login'}
              </button>
            </form>

<<<<<<< HEAD
            <div className="mt-6 rounded-2xl border border-[#4F4F53]/15 bg-[#F0F0F0] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#6C6C72]">{ui.demoCredentials}</div>
                <span className="rounded-full border border-[#8B88C6]/30 bg-[#8B88C6]/10 px-2 py-1 text-[10px] font-bold uppercase text-[#706CA8]">JWT demo</span>
=======
            {/* ── Demo Credentials ── */}
            <div className="mt-8 pt-8 border-t-2" style={{ borderColor: 'rgba(196, 30, 58, 0.20)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase" style={{ color: '#1B4332' }}>
                  {ui.demoCredentials || 'Demo Accounts'}
                </p>
                <span
                  className="text-[10px] font-bold uppercase px-2 py-1 rounded-full"
                  style={{
                    background: 'rgba(64, 145, 108, 0.15)',
                    color: '#2D6A4F',
                  }}
                >
                  Quick Fill
                </span>
>>>>>>> d91138328f37e3d36f0c4aab6916bfbb4abc75d9
              </div>

              <div className="space-y-2">
                {demoCredentials.map((credential) => (
                  <button
                    key={credential.email}
                    type="button"
                    onClick={() => handleCredentialClick(credential)}
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
<<<<<<< HEAD
                    className="flex w-full items-center justify-between rounded-xl border border-[#4F4F53]/15 bg-white px-3 py-2 text-left transition hover:border-[#8B88C6]/50 hover:bg-[#F0F0F0]"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#4F4F53]">{credential.label}</div>
                      <div className="text-[11px] text-[#6C6C72]">{credential.email}</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-[#8B88C6]" />
=======
                  >
                    <div className="text-left">
                      <div className="text-sm font-bold" style={{ color: '#0B0B0B' }}>
                        {credential.label}
                      </div>
                      <div className="text-xs" style={{ color: '#2D6A4F' }}>
                        {credential.email}
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5" style={{ color: '#2D6A4F' }} />
>>>>>>> d91138328f37e3d36f0c4aab6916bfbb4abc75d9
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}