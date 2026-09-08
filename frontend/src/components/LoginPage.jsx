import React, { useMemo, useState } from 'react';
import { LockKeyhole, TrainFront, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AUTH_USERS, createMockJwt, ROLE_LABELS, saveSession } from '../auth';
import { useLanguage } from '../i18n';

const DEMO_CREDENTIALS = [
  { label: 'System Admin', email: 'admin@railsync.ai', password: 'RailSync@123' },
  { label: 'Section Controller', email: 'amit.verma@railsync.ai', password: 'RailSync@123' },
  { label: 'Track Engineer', email: 'neha.singh@railsync.ai', password: 'RailSync@123' },
  { label: 'Traction Controller', email: 'vikas.mehta@railsync.ai', password: 'RailSync@123' },
  { label: 'Signal In-charge', email: 'pooja.nair@railsync.ai', password: 'RailSync@123' },
];

export default function LoginPage({ onLoginSuccess }) {
  const { t } = useLanguage();
  const ui = t.ui;
  const [email, setEmail] = useState('amit.verma@railsync.ai');
  const [password, setPassword] = useState('RailSync@123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoCredentials = useMemo(() => DEMO_CREDENTIALS, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const user = AUTH_USERS.find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());

    if (!user || user.password !== password) {
      setError('Invalid credentials. Use the demo account details listed below.');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const token = createMockJwt(user);
      const session = {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      };

      saveSession(session);
      onLoginSuccess(session);
      setIsSubmitting(false);
    }, 450);
  };

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
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
              </div>

              <div>
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
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-[#D1A751]/50 bg-[#D1A751]/15 px-3 py-2 text-sm text-[#8C6B1F]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#8B88C6] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#8B88C6]/20 transition hover:bg-[#7D79B5] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? ui.authenticating : ui.login}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[#4F4F53]/15 bg-[#F0F0F0] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#6C6C72]">{ui.demoCredentials}</div>
                <span className="rounded-full border border-[#8B88C6]/30 bg-[#8B88C6]/10 px-2 py-1 text-[10px] font-bold uppercase text-[#706CA8]">JWT demo</span>
              </div>

              <div className="space-y-2">
                {demoCredentials.map((credential) => (
                  <button
                    key={credential.email}
                    type="button"
                    onClick={() => {
                      setEmail(credential.email);
                      setPassword(credential.password);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-[#4F4F53]/15 bg-white px-3 py-2 text-left transition hover:border-[#8B88C6]/50 hover:bg-[#F0F0F0]"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#4F4F53]">{credential.label}</div>
                      <div className="text-[11px] text-[#6C6C72]">{credential.email}</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-[#8B88C6]" />
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