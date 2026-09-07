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
  { id: 'COMMAND_CENTER', icon: Radio, color: 'emerald' }, { id: 'GIS_MAP', icon: Map, color: 'emerald' },
  { id: 'ML_SCORER', icon: Cpu, color: 'cyan' }, { id: 'GANTT', icon: Calendar, color: 'emerald' },
  { id: 'STRING_CHART', icon: Compass, color: 'cyan' }, { id: 'NATIONAL', icon: Globe, color: 'emerald' },
  { id: 'SIMULATION', icon: Zap, color: 'amber' }, { id: 'PTW', icon: ShieldAlert, color: 'purple' },
  { id: 'CALENDAR', icon: CalendarDays, color: 'purple' },
];

const NAV_GROUPS = [
  { id: 'OPERATIONS', key: 'operations', items: ['COMMAND_CENTER', 'GANTT', 'STRING_CHART', 'GIS_MAP'] },
  { id: 'INTELLIGENCE', key: 'intelligence', items: ['ML_SCORER', 'SIMULATION'] },
  { id: 'COMPLIANCE', key: 'compliance', items: ['PTW', 'CALENDAR'] },
];

const NAV_ACTIVE_CLASSES = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10',
  cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10',
  purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10',
};

const ROLE_LAYOUTS = {
  ADMIN: {
    accent: 'emerald',
    banner: 'Network Command View',
    summary: 'System oversight and enterprise audit access',
    border: 'border-emerald-500/25',
    badge: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25',
  },
  SECTION_CONTROLLER: {
    accent: 'cyan',
    banner: 'Operations Control View',
    summary: 'Punctual train movement and corridor authority management',
    border: 'border-cyan-500/25',
    badge: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25',
  },
  TRACK_ENGINEER: {
    accent: 'amber',
    banner: 'Maintenance Planning View',
    summary: 'Track health, asset defects, and maintenance sequencing',
    border: 'border-amber-500/25',
    badge: 'bg-amber-500/10 text-amber-300 border border-amber-500/25',
  },
  TRACTION_CONTROLLER: {
    accent: 'purple',
    banner: 'Power & Traction View',
    summary: 'Traction load, power continuity, and corridor energy readiness',
    border: 'border-purple-500/25',
    badge: 'bg-purple-500/10 text-purple-300 border border-purple-500/25',
  },
  SIGNAL_INCHARGE: {
    accent: 'emerald',
    banner: 'Signal & Safety View',
    summary: 'Interlocking, signalling safety, and possession validation',
    border: 'border-emerald-500/25',
    badge: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25',
  },
};

const DEMO_STEPS = [
  { tab: 'COMMAND_CENTER', key: 'baseline', duration: 3600 },
  { tab: 'GANTT', key: 'timeline', duration: 3600 },
  { tab: 'COMMAND_CENTER', key: 'optimizing', duration: 5200 },
  { tab: 'PTW', key: 'permits', duration: 4200 },
  { tab: 'NATIONAL', key: 'national', duration: 4200 },
];

export default function App() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [demoPhase, setDemoPhase] = useState(0);
  const [activeGroup, setActiveGroup] = useState('OPERATIONS');
  const [session, setSession] = useState(() => getStoredSession());
  const { language, setLanguage, t } = useLanguage();

  const {
    isOptimized,
    isSolving,
    activeRole,
    activeTab,
    isApiConnected,
    toggleOptimize,
    setActiveRole,
    setAuthorizedRole,
    setActiveTab,
    loadBaseline,
  } = useRailwayStore();

  const currentUser = session?.user || null;
  const userRole = currentUser?.role || activeRole;
  const roleName = ROLE_LABELS[userRole] || userRole;
  const currentRoleLayout = ROLE_LAYOUTS[userRole] || ROLE_LAYOUTS.SECTION_CONTROLLER;
  const visibleNavGroups = NAV_GROUPS.filter((group) => group.items.some((item) => canAccessTab(userRole, item)));
  const visibleGroupItems = visibleNavGroups.find((group) => group.id === activeGroup)?.items || visibleNavGroups[0]?.items || NAV_GROUPS[0].items;

  const authLogs = useMemo(() => [
    { id: 1, action: 'Login successful', role: 'SECTION_CONTROLLER', visibility: 'all', time: '08:25', user: 'Amit Verma' },
    { id: 2, action: 'PTW issued for TDL-ETW turnout', role: 'TRACK_ENGINEER', visibility: 'all', time: '09:10', user: 'Neha Singh' },
    { id: 3, action: 'Traction outage cross-check approved', role: 'TRACTION_CONTROLLER', visibility: 'all', time: '10:40', user: 'Vikas Mehta' },
    { id: 4, action: 'Signal interlocking validation completed', role: 'SIGNAL_INCHARGE', visibility: 'all', time: '12:05', user: 'Pooja Nair' },
    { id: 5, action: 'Audit snapshot generated', role: 'ADMIN', visibility: 'all', time: '13:15', user: 'Rakesh Sharma' },
  ], []);

  const visibleLogs = useMemo(() => getVisibleLogs(userRole, authLogs), [userRole, authLogs]);

  useEffect(() => {
    if (!session?.token) return;
    const parsed = parseJwt(session.token);
    if (!parsed) {
      clearSession();
      setSession(null);
      return;
    }

    if (parsed.role) {
      setAuthorizedRole(parsed.role);
    }
  }, [session, setAuthorizedRole]);

  useEffect(() => {
    if (!session) return;
    loadBaseline();
  }, [loadBaseline, session]);

  useEffect(() => {
    if (!demoActive) return undefined;
    const step = DEMO_STEPS[demoPhase];
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
      setDemoPhase((phase) => phase + 1);
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

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-4 max-w-[1600px] mx-auto flex flex-col font-sans">
      <header className={`monocle-shell-header mb-3 rounded-2xl border bg-slate-950/70 p-3 ${currentRoleLayout.border}`}>
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

        <div className="mt-3 flex flex-col gap-3 border-t border-slate-800/80 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <div className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${currentRoleLayout.badge}`}>
                Active Role
              </div>
              <div>
                <div className="text-xs font-bold text-white">{roleName}</div>
                <div className="text-[10px] text-slate-400">{currentUser?.department || 'Ops Control'}</div>
              </div>
            </div>
            <div className="hidden h-6 w-px bg-slate-800 lg:block" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Role view</div>
              <div className="text-xs font-bold text-slate-200">{currentRoleLayout.banner}</div>
            </div>
            <div className="text-xs text-slate-400">{currentRoleLayout.summary}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
              {currentUser?.name}
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200 transition hover:border-rose-500/40 hover:text-rose-200">
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="mb-4 border-b border-slate-800 pb-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {visibleNavGroups.map((group) => <button key={group.id} onClick={() => { setActiveGroup(group.id); setActiveTab(group.items[0]); }} className={'shrink-0 rounded-lg px-3 py-1.5 transition ' + (activeGroup === group.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200')}>{t.groups[group.key]}</button>)}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {visibleGroupItems.filter((itemId) => canAccessTab(userRole, itemId)).map((itemId) => {
            const { icon: Icon, color } = NAV_ITEMS.find((item) => item.id === itemId) || NAV_ITEMS[0];
            return <button key={itemId} data-tour-tab={itemId} onClick={() => setActiveTab(itemId)} className={'flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 transition ' + (activeTab === itemId ? NAV_ACTIVE_CLASSES[color] : 'text-slate-500 hover:text-slate-200') + (demoActive && activeDemoStep?.tab === itemId ? ' ring-2 ring-amber-300 ring-offset-2 ring-offset-[#080e1a]' : '')}><Icon className="h-3.5 w-3.5" /> {t.nav[itemId]}</button>;
          })}
          </div>
        </div>
      </div>

      {demoActive && (
        <div className="demo-live-frame pointer-events-none fixed inset-0 z-30" aria-hidden="true" />
      )}
      <button onClick={demoActive ? stopDemo : startDemo} className={'fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition shadow-lg ' + (demoActive ? 'border-rose-300/60 bg-rose-950/90 text-rose-100 hover:bg-rose-900' : 'border-slate-700 bg-slate-950/90 text-slate-200 hover:border-emerald-500/30 hover:text-emerald-300')}>
        {demoActive ? <X className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {demoActive ? t.demo.stop : t.demo.start}
      </button>
      {demoActive && (
        <div className="fixed left-1/2 top-4 z-40 w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-amber-300/50 bg-slate-950/95 p-4 shadow-2xl shadow-amber-950/30 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300"><span className="flex items-center gap-2"><span className="demo-pulse-dot" /><Activity className="h-3.5 w-3.5" /> {t.demo.active}</span><span>{t.demo.phase} {demoPhase + 1} {t.demo.of} {DEMO_STEPS.length}</span></div>
          <div className="mt-3 flex gap-1.5">{DEMO_STEPS.map((step, index) => <div key={step.key} className={'h-1.5 flex-1 rounded-full transition-all duration-500 ' + (index <= demoPhase ? 'bg-amber-300 shadow-lg shadow-amber-300/50' : 'bg-slate-700')} />)}</div>
          <div className="mt-3 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-black text-white"><Sparkles className="h-4 w-4 text-amber-300" /> {t.demo[activeDemoStep.key]}</div><div className="mt-1 text-[11px] text-slate-400">{t.demo.simulated} · {t.demo.next}</div></div><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /></div>
        </div>
      )}

      {/* Dynamic Tab Views */}
      <div className="monocle-content">
        {activeTab === 'COMMAND_CENTER' && <OperationsCommandCenter />}
        {activeTab === 'GIS_MAP' && <GisRailwayMap />}
        {activeTab === 'ML_SCORER' && <TrackHealthScorer />}
        {activeTab === 'GANTT' && <GanttView />}
        {activeTab === 'STRING_CHART' && <StringChart />}
        {activeTab === 'NATIONAL' && <NationalGrid />}
        {activeTab === 'SIMULATION' && <SimulationSandbox />}
        {activeTab === 'PTW' && <ConflictResolver />}
        {activeTab === 'CALENDAR' && <RollingCalendar />}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Shield className="h-4 w-4 text-emerald-400" />
          Role-based access logs
        </div>
        <div className="space-y-2">
          {visibleLogs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-slate-100">{log.action}</div>
                <div className="text-[11px] text-slate-400">{log.user} · {log.role}</div>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">{log.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Command Palette */}
      <AiAssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />

      <footer className="mt-auto pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>{t.footer}</span>
        <span>{t.ministry}</span>
      </footer>
    </div>
  );
}