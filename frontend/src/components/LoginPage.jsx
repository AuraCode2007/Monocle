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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
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
              </div>

              {/* Password Input with Eye Toggle */}
              <div>
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
              </div>

              {/* Error Message */}
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
