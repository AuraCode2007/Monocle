import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import GanttView from './components/GanttView';
import StringChart from './components/StringChart';
import GisRailwayMap from './components/GisRailwayMap';
import TrackHealthScorer from './components/TrackHealthScorer';
import ConflictResolver from './components/ConflictResolver';
import SimulationSandbox from './components/SimulationSandbox';
import RollingCalendar from './components/RollingCalendar';
import NationalGrid from './components/NationalGrid';
import AiAssistantModal from './components/AiAssistantModal';
import OperationsCommandCenter from './components/OperationsCommandCenter';
import LoginPage from './components/LoginPage';
import { useLanguage } from './i18n';
import { useRailwayStore } from './store/useRailwayStore';
import { Activity, Calendar, ShieldAlert, Compass, Zap, CalendarDays, Globe, Radio, Cpu, Play, X, Map, Sparkles, CheckCircle2, LogOut, Shield } from 'lucide-react';
import { canAccessTab, getStoredSession, getVisibleLogs, parseJwt, ROLE_LABELS, clearSession } from './auth';

const NAV_ITEMS = [
  { id: 'COMMAND_CENTER', icon: Radio,       color: 'emerald' },
  { id: 'GIS_MAP',        icon: Map,         color: 'emerald' },
  { id: 'ML_SCORER',      icon: Cpu,         color: 'cyan'    },
  { id: 'GANTT',          icon: Calendar,    color: 'emerald' },
  { id: 'STRING_CHART',   icon: Compass,     color: 'cyan'    },
  { id: 'NATIONAL',       icon: Globe,       color: 'emerald' },
  { id: 'SIMULATION',     icon: Zap,         color: 'amber'   },
  { id: 'PTW',            icon: ShieldAlert, color: 'purple'  },
  { id: 'CALENDAR',       icon: CalendarDays,color: 'purple'  },
];

const NAV_GROUPS = [
  { id: 'OPERATIONS',  key: 'operations',  items: ['COMMAND_CENTER', 'GANTT', 'STRING_CHART', 'GIS_MAP'] },
  { id: 'INTELLIGENCE',key: 'intelligence',items: ['ML_SCORER', 'SIMULATION'] },
  { id: 'COMPLIANCE',  key: 'compliance',  items: ['PTW', 'CALENDAR'] },
];

// All active tab styles now use the purple accent from index.css variable remaps
const NAV_ACTIVE_CLASSES = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10',
  cyan:    'bg-cyan-500/10    text-cyan-400    border border-cyan-500/30    shadow-lg shadow-cyan-500/10',
  amber:   'bg-amber-500/10   text-amber-400   border border-amber-500/30   shadow-lg shadow-amber-500/10',
  purple:  'bg-purple-500/10  text-purple-400  border border-purple-500/30  shadow-lg shadow-purple-500/10',
};

const ROLE_LAYOUTS = {
  ADMIN: {
    accent: 'emerald',
    banner: 'Network Command View',
    summary: 'System oversight and enterprise audit access',
    border: 'border-emerald-500/25',
    badge:  'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25',
  },
  SECTION_CONTROLLER: {
    accent: 'cyan',
    banner: 'Operations Control View',
    summary: 'Punctual train movement and corridor authority management',
    border: 'border-cyan-500/25',
    badge:  'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25',
  },
  TRACK_ENGINEER: {
    accent: 'amber',
    banner: 'Maintenance Planning View',
    summary: 'Track health, asset defects, and maintenance sequencing',
    border: 'border-amber-500/25',
    badge:  'bg-amber-500/10 text-amber-300 border border-amber-500/25',
  },
  TRACTION_CONTROLLER: {
    accent: 'purple',
    banner: 'Power & Traction View',
    summary: 'Traction load, power continuity, and corridor energy readiness',
    border: 'border-purple-500/25',
    badge:  'bg-purple-500/10 text-purple-300 border border-purple-500/25',
  },
  SIGNAL_INCHARGE: {
    accent: 'emerald',
    banner: 'Signal & Safety View',
    summary: 'Interlocking, signalling safety, and possession validation',
    border: 'border-emerald-500/25',
    badge:  'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25',
  },
};

const DEMO_STEPS = [
  { tab: 'COMMAND_CENTER', key: 'baseline',  duration: 3600 },
  { tab: 'GANTT',          key: 'timeline',  duration: 3600 },
  { tab: 'COMMAND_CENTER', key: 'optimizing',duration: 5200 },
  { tab: 'PTW',            key: 'permits',   duration: 4200 },
  { tab: 'NATIONAL',       key: 'national',  duration: 4200 },
];

export default function App() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [demoActive, setDemoActive]           = useState(false);
  const [demoPhase, setDemoPhase]             = useState(0);
  const [activeGroup, setActiveGroup]         = useState('OPERATIONS');
  const [session, setSession]                 = useState(() => getStoredSession());
  const { language, setLanguage, t }          = useLanguage();

  const {
    isOptimized, isSolving, activeRole, activeTab, isApiConnected,
    toggleOptimize, setActiveRole, setAuthorizedRole, setActiveTab, loadBaseline,
  } = useRailwayStore();

  const currentUser        = session?.user || null;
  const userRole           = currentUser?.role || activeRole;
  const roleName           = ROLE_LABELS[userRole] || userRole;
  const currentRoleLayout  = ROLE_LAYOUTS[userRole] || ROLE_LAYOUTS.SECTION_CONTROLLER;
  const visibleNavGroups   = NAV_GROUPS.filter((g) => g.items.some((id) => canAccessTab(userRole, id)));
  const visibleGroupItems  = visibleNavGroups.find((g) => g.id === activeGroup)?.items
                           || visibleNavGroups[0]?.items
                           || NAV_GROUPS[0].items;

  const authLogs = useMemo(() => [
    { id: 1, action: 'Login successful',                       role: 'SECTION_CONTROLLER',  visibility: 'all', time: '08:25', user: 'Amit Verma'   },
    { id: 2, action: 'PTW issued for TDL-ETW turnout',         role: 'TRACK_ENGINEER',       visibility: 'all', time: '09:10', user: 'Neha Singh'   },
    { id: 3, action: 'Traction outage cross-check approved',   role: 'TRACTION_CONTROLLER',  visibility: 'all', time: '10:40', user: 'Vikas Mehta'  },
    { id: 4, action: 'Signal interlocking validation completed',role: 'SIGNAL_INCHARGE',     visibility: 'all', time: '12:05', user: 'Pooja Nair'   },
    { id: 5, action: 'Audit snapshot generated',               role: 'ADMIN',                visibility: 'all', time: '13:15', user: 'Rakesh Sharma'},
  ], []);

  const visibleLogs = useMemo(() => getVisibleLogs(userRole, authLogs), [userRole, authLogs]);

  useEffect(() => {
    if (!session?.token) return;
    const parsed = parseJwt(session.token);
    if (!parsed) { clearSession(); setSession(null); return; }
    if (parsed.role) setAuthorizedRole(parsed.role);
  }, [session, setAuthorizedRole]);

  useEffect(() => {
    if (!session) return;
    loadBaseline();
  }, [loadBaseline, session]);

  useEffect(() => {
    if (!demoActive) return undefined;
    const step  = DEMO_STEPS[demoPhase];
    const timer = window.setTimeout(() => {
      if (demoPhase === 1) {
        setActiveTab('COMMAND_CENTER');
        toggleOptimize();
      } else if (demoPhase >= DEMO_STEPS.length - 1) {
        setDemoActive(false);
        return;
      } else {
        setActiveTab(DEMO_STEPS[demoPhase + 1].tab);
      }
      setDemoPhase((p) => p + 1);
    }, step.duration);
    return () => window.clearTimeout(timer);
  }, [demoActive, demoPhase, setActiveTab, toggleOptimize]);

  const startDemo = () => {
    if (isOptimized) toggleOptimize();
    setDemoPhase(0);
    setDemoActive(true);
    setActiveTab(NAV_ITEMS[0].id);
  };
  const stopDemo = () => setDemoActive(false);
  const activeDemoStep = DEMO_STEPS[demoPhase];

  const handleLoginSuccess = (nextSession) => {
    setSession(nextSession);
    const role = nextSession?.user?.role || 'SECTION_CONTROLLER';
    setAuthorizedRole(role);
    setActiveTab('COMMAND_CENTER');
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setAuthorizedRole('SECTION_CONTROLLER');
    setActiveTab('COMMAND_CENTER');
  };

  if (!session) return <LoginPage onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen flex font-sans" style={{ background: 'linear-gradient(135deg, #E8ECFF 0%, #D4DCFF 50%, #E8ECFF 100%)', backgroundAttachment: 'fixed' }}>
      {/* ── Left Sidebar (Dark) ── */}
      <aside className="hidden lg:flex w-20 flex-col items-center py-6 px-3 gap-6" style={{ background: '#1A1F3A' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5B7FFF' }}>
          <Radio className="w-5 h-5 text-white" />
        </div>
        <nav className="flex flex-col gap-4">
          {visibleGroupItems.filter((id) => canAccessTab(userRole, id)).map((itemId) => {
            const { icon: Icon } = NAV_ITEMS.find((n) => n.id === itemId) || NAV_ITEMS[0];
            const isActive = activeTab === itemId;
            return (
              <button
                key={itemId}
                data-tour-tab={itemId}
                onClick={() => setActiveTab(itemId)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                style={isActive
                  ? { background: '#5B7FFF', boxShadow: '0 4px 16px rgba(91,127,255,0.25)' }
                  : { background: 'transparent', color: '#6B7480' }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(91,127,255,0.15)';
                    e.currentTarget.style.color = '#5B7FFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6B7480';
                  }
                }}
                title={t.nav[itemId]}
              >
                <Icon className="w-5 h-5" style={{ color: isActive ? '#fff' : 'inherit' }} />
              </button>
            );
          })}
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'transparent', color: '#6B7480' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6B7480';
            }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 px-3 py-3 md:px-5 md:py-4 max-w-[1600px] mx-auto flex flex-col font-sans">

        {/* ── Shell Header ── */}
        <header className="monocle-shell-header mb-3 rounded-2xl border p-4">
          <Header
            isOptimized={isOptimized}
            onToggleOptimize={toggleOptimize}
            isSolving={isSolving}
            activeRole={userRole}
            onRoleChange={setActiveRole}
            isApiConnected={isApiConnected}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            language={language}
            labels={t}
            onChangeLanguage={setLanguage}
          />

          {/* Role sub-strip */}
          <div className="mt-3 flex flex-col gap-3 border-t pt-3 lg:flex-row lg:items-center lg:justify-between"
               style={{ borderColor: 'var(--ff-border-light)' }}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

              <div className="flex items-center gap-2">
                <div className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${currentRoleLayout.badge}`}>
                  Active Role
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--ff-ink)' }}>{roleName}</div>
                  <div className="text-[10px]" style={{ color: 'var(--ff-muted)' }}>{currentUser?.department || 'Ops Control'}</div>
                </div>
              </div>

              <div className="hidden h-6 w-px lg:block" style={{ background: 'var(--ff-border)' }} />

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--ff-faint)' }}>Role view</div>
                <div className="text-xs font-bold" style={{ color: 'var(--ff-ink-secondary)' }}>{currentRoleLayout.banner}</div>
              </div>

              <div className="text-xs" style={{ color: 'var(--ff-muted)' }}>{currentRoleLayout.summary}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] glass-card"
                   style={{ borderColor: 'var(--ff-border-light)', color: 'var(--ff-ink-secondary)' }}>
                {currentUser?.name}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all"
                style={{ borderColor: 'var(--ff-border-light)', color: 'var(--ff-muted)', background: 'rgba(245,248,255,0.70)', backdropFilter: 'blur(15px)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ff-border-light)'; e.currentTarget.style.color = 'var(--ff-muted)'; }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* ── Navigation Tabs Bar ── */}
        <div className="mb-4 rounded-xl border px-4 py-2.5 glass-card"
             style={{ borderColor: 'var(--ff-border-light)' }}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">

            {/* Group pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {visibleNavGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => { setActiveGroup(group.id); setActiveTab(group.items[0]); }}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                  style={activeGroup === group.id
                    ? { background: 'var(--ff-accent)', color: '#fff', boxShadow: '0 4px 16px rgba(91,127,255,0.25)' }
                    : { background: 'transparent', color: 'var(--ff-muted)' }}
                >
                  {t.groups[group.key]}
                </button>
              ))}
            </div>

            {/* Tab buttons */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
              {visibleGroupItems.filter((id) => canAccessTab(userRole, id)).map((itemId) => {
                const { icon: Icon, color } = NAV_ITEMS.find((n) => n.id === itemId) || NAV_ITEMS[0];
                const isActive = activeTab === itemId;
                const demoRing = demoActive && activeDemoStep?.tab === itemId;
                return (
                  <button
                    key={itemId}
                    data-tour-tab={itemId}
                    onClick={() => setActiveTab(itemId)}
                    className={
                      'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ' +
                      (isActive ? NAV_ACTIVE_CLASSES[color] : '') +
                      (demoRing ? ' ring-2 ring-offset-2' : '')
                    }
                    style={isActive
                      ? {}
                      : { color: '#1A1F3A', fontWeight: '600' }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--ff-accent)'; e.currentTarget.style.background = 'rgba(91,127,255,0.10)'; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = '#1A1F3A'; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.nav[itemId]}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── Demo frame overlay ── */}
        {demoActive && (
          <div className="demo-live-frame pointer-events-none fixed inset-0 z-30" aria-hidden="true" />
        )}

        {/* ── Demo start/stop FAB ── */}
        <button
          onClick={demoActive ? stopDemo : startDemo}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-all"
          style={demoActive
            ? { borderColor: 'var(--ff-danger)', background: 'rgba(245,248,255,0.85)', color: 'var(--ff-danger)', boxShadow: '0 4px 20px rgba(239,68,68,0.20)', backdropFilter: 'blur(20px)' }
            : { borderColor: 'var(--ff-border-light)', background: 'rgba(245,248,255,0.85)', color: 'var(--ff-ink-secondary)', boxShadow: 'var(--ff-shadow-glass)', backdropFilter: 'blur(20px)' }}
        >
          {demoActive ? <X className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {demoActive ? t.demo.stop : t.demo.start}
        </button>

        {/* ── Demo progress banner ── */}
        {demoActive && (
          <div className="fixed left-1/2 top-4 z-40 w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border p-4"
               style={{ borderColor: 'var(--ff-accent-light)', background: 'rgba(245,248,255,0.85)', boxShadow: 'var(--ff-shadow-hover)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em]"
                 style={{ color: 'var(--ff-accent)' }}>
              <span className="flex items-center gap-2">
                <span className="demo-pulse-dot" />
                <Activity className="h-3.5 w-3.5" />
                {t.demo.active}
              </span>
              <span>{t.demo.phase} {demoPhase + 1} {t.demo.of} {DEMO_STEPS.length}</span>
            </div>
            <div className="mt-3 flex gap-1.5">
              {DEMO_STEPS.map((step, index) => (
                <div
                  key={step.key}
                  className="h-1.5 flex-1 rounded-full transition-all duration-500"
                  style={{ background: index <= demoPhase ? 'var(--ff-accent)' : 'rgba(230,236,255,0.50)' }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-black" style={{ color: 'var(--ff-ink)' }}>
                  <Sparkles className="h-4 w-4" style={{ color: 'var(--ff-accent)' }} />
                  {t.demo[activeDemoStep.key]}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: 'var(--ff-muted)' }}>
                  {t.demo.simulated} · {t.demo.next}
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: 'var(--ff-success)' }} />
            </div>
          </div>
        )}

      {/* ── Dynamic Tab Views ── */}
      <div className="monocle-content">
        {activeTab === 'COMMAND_CENTER' && <OperationsCommandCenter />}
        {activeTab === 'GIS_MAP'        && <GisRailwayMap />}
        {activeTab === 'ML_SCORER'      && <TrackHealthScorer />}
        {activeTab === 'GANTT'          && <GanttView />}
        {activeTab === 'STRING_CHART'   && <StringChart />}
        {activeTab === 'NATIONAL'       && <NationalGrid />}
        {activeTab === 'SIMULATION'     && <SimulationSandbox />}
        {activeTab === 'PTW'            && <ConflictResolver />}
        {activeTab === 'CALENDAR'       && <RollingCalendar />}
      </div>

      {/* ── Role-based Access Logs ── */}
      <div className="mt-6 rounded-2xl border glass-card p-4"
           style={{ borderColor: 'var(--ff-border-light)' }}>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--ff-ink)' }}>
          <Shield className="h-4 w-4" style={{ color: 'var(--ff-accent)' }} />
          Role-based access logs
        </div>
        <div className="space-y-2">
          {visibleLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-1 rounded-xl border p-3 transition-all md:flex-row md:items-center md:justify-between glass-card"
              style={{ borderColor: 'var(--ff-border-light)' }}
            >
              <div className="flex flex-col gap-0.5">
                <div className="text-sm font-semibold" style={{ color: 'var(--ff-ink)' }}>{log.action}</div>
                <div className="text-[11px]" style={{ color: 'var(--ff-muted)' }}>{log.user} · {log.role}</div>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--ff-accent)' }}>
                {log.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Assistant Modal ── */}
      <AiAssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />

      {/* ── Footer ── */}
      <footer className="mt-auto pt-6 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-2 border-t"
              style={{ borderColor: 'var(--ff-border-light)', color: 'var(--ff-faint)' }}>
        <span>{t.footer}</span>
        <span>{t.ministry}</span>
      </footer>
      </div>
    </div>
  );
}
