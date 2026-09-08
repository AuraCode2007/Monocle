import React from 'react';
import { Activity, ArrowUpRight, CircleAlert, Clock3, GitMerge, Map, ShieldCheck, Sparkles, TrainFront, Wrench } from 'lucide-react';
import MetricCards from './MetricCards';
import OptimizationExplainabilityPanel from './OptimizationExplainabilityPanel';
import { useLanguage } from '../i18n';
import { useRailwayStore } from '../store/useRailwayStore';

const ROLE_BRIEFS = {
  ADMIN: {
    eyebrow: 'Network oversight',
    title: 'Division status and audit position',
    summary: 'Review corridor availability, exception volume, and recent controlled actions across the operating network.',
    metrics: [['Corridors in view', '04'], ['Open exceptions', '03'], ['Audit events', '05']],
    action: 'Open national status',
    tab: 'NATIONAL',
    accent: 'text-emerald-300',
  },
  SECTION_CONTROLLER: {
    eyebrow: 'Traffic regulation desk',
    title: 'Train movement and possession position',
    summary: 'Regulate priority services against the active maintenance window and confirm the next safe movement decision.',
    metrics: [['Services in view', '12'], ['Active conflicts', '4'], ['Next possession', '00:30']],
    action: 'Review traffic plan',
    tab: 'GANTT',
    accent: 'text-cyan-300',
  },
  TRACK_ENGINEER: {
    eyebrow: 'Engineering work desk',
    title: 'Track condition and worksite readiness',
    summary: 'Prioritise high-severity defects, confirm available work windows, and prepare the engineering possession request.',
    metrics: [['Critical work items', '03'], ['Risk review', 'Required'], ['Next work window', '00:30']],
    action: 'Open risk review',
    tab: 'ML_SCORER',
    accent: 'text-amber-300',
  },
  TRACTION_CONTROLLER: {
    eyebrow: 'Traction control desk',
    title: 'Power isolation and corridor continuity',
    summary: 'Check OHE work blocks, power isolation dependencies, and the effect of a disruption on corridor throughput.',
    metrics: [['OHE blocks', '02'], ['Isolation status', 'Pending'], ['Supply', '25 kV AC']],
    action: 'Review traction blocks',
    tab: 'GIS_MAP',
    accent: 'text-violet-300',
  },
  SIGNAL_INCHARGE: {
    eyebrow: 'Signal and safety desk',
    title: 'Route protection and possession validation',
    summary: 'Validate interlocking constraints, route protection, and permit conditions before a work block is released.',
    metrics: [['Routes under review', '06'], ['Protection checks', '04'], ['Permits pending', '02']],
    action: 'Review permits',
    tab: 'PTW',
    accent: 'text-emerald-300',
  },
};

export default function OperationsCommandCenter() {
  const { t } = useLanguage();
  const labels = t.dashboard;
  const { activeCorridorKey, activeRole, emergencyActive, isApiConnected, isOptimized, optimizerMetrics, getCorridor, getTasks, getTrains, setActiveTab } = useRailwayStore();
  const corridor = getCorridor();
  const tasks = getTasks();
  const trains = getTrains();
  const criticalTasks = tasks.filter((task) => task.severity >= 4).slice(0, 3);
  const roleLabel = activeRole.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  const comparisonRows = [
    { label: labels.activeConflicts, manual: optimizerMetrics.conflicts, ai: 0, unit: labels.clashes },
    { label: labels.passengerDelay, manual: optimizerMetrics.conflicts * 45, ai: optimizerMetrics.delayMinutesSaved, unit: labels.minutes },
    { label: labels.jointPossessions, manual: 0, ai: optimizerMetrics.jointBlocks, unit: labels.blocks },
    { label: labels.assetAvailability, manual: `${optimizerMetrics.baselineAvailabilityPct}%`, ai: `${optimizerMetrics.baselineAvailabilityPct + optimizerMetrics.availabilityBoostPct}%`, unit: '' },
  ];
  const roleBrief = ROLE_BRIEFS[activeRole] || ROLE_BRIEFS.SECTION_CONTROLLER;

  return (
    <main className="space-y-5 pb-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-5 md:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-32 bg-gradient-to-l from-emerald-500/5 to-transparent lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300"><Activity className="h-3.5 w-3.5" /> {labels.operationsCenter} <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-slate-400 tracking-normal">{activeCorridorKey}</span></div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">{corridor.name}</h2>
            <p className="mt-2 text-sm text-slate-300">{labels.onePicture} {corridor.distance_km} km.</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3"><span className={'h-2.5 w-2.5 rounded-full ' + (emergencyActive ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400')} /><div><div className="text-xs font-bold text-white">{emergencyActive ? labels.crisisMode : labels.corridorOperational}</div><div className="mt-0.5 text-[11px] text-slate-400">{roleLabel} · {isApiConnected ? labels.liveFeed : labels.simulationData}</div></div></div>
        </div>
      </section>

      <MetricCards isOptimized={isOptimized} metrics={optimizerMetrics} />

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className={'mb-2 text-[10px] font-bold uppercase tracking-[0.2em] ' + roleBrief.accent}>{roleBrief.eyebrow}</div>
          <h3 className="text-xl font-black text-white">{roleBrief.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{roleBrief.summary}</p>
          <button onClick={() => setActiveTab(roleBrief.tab)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">
            {roleBrief.action} <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 self-start border-t border-slate-800 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          {roleBrief.metrics.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
              <div className="mt-2 truncate text-sm font-black text-slate-100">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-2xl border-slate-800/80 p-5">
        <div className="mb-4 flex flex-col gap-1 border-b border-slate-800/80 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white"><GitMerge className="h-4 w-4 text-emerald-400" /> {labels.manualVsAi}</div>
            <p className="mt-1 text-xs text-slate-400">{labels.sameCorridor}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{labels.decisionView}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { title: labels.manualScheduling, tone: 'rose', subtitle: labels.siloedRequests },
            { title: labels.aiScheduling, tone: 'emerald', subtitle: labels.synchronized },
          ].map((plan, planIndex) => (
            <div key={plan.title} className={'rounded-xl border p-4 ' + (planIndex === 0 ? 'border-rose-500/20 bg-rose-500/5' : 'border-emerald-500/20 bg-emerald-500/5')}>
              <div className="flex items-center justify-between gap-3"><div className="text-sm font-black text-white">{plan.title}</div><span className={'rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ' + (planIndex === 0 ? 'border-rose-400/30 text-rose-300' : 'border-emerald-400/30 text-emerald-300')}>{planIndex === 0 ? labels.baseline : labels.recommended}</span></div>
              <div className="mt-1 text-[11px] text-slate-400">{plan.subtitle}</div>
              <div className="mt-4 space-y-3">
                {comparisonRows.map((row) => <div key={row.label} className="flex items-end justify-between gap-3 border-b border-white/5 pb-2"><span className="text-[11px] text-slate-400">{row.label}</span><span className={'text-right text-lg font-black ' + (planIndex === 0 ? 'text-rose-300' : 'text-emerald-300')}>{planIndex === 0 ? row.manual : row.ai} <small className="text-[10px] font-bold text-slate-500">{row.unit}</small></span></div>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <OptimizationExplainabilityPanel />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="glass-card rounded-2xl border-slate-800/80 p-5">
          <div className="mb-4 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-bold text-white"><TrainFront className="h-4 w-4 text-cyan-400" /> {labels.liveMovement}</div><p className="mt-1 text-xs text-slate-400">{labels.priorityServices}</p></div><button onClick={() => setActiveTab('GIS_MAP')} className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300">{labels.openMap} <ArrowUpRight className="h-3.5 w-3.5" /></button></div>
          <div className="space-y-2">{trains.map((train) => <button key={train.number} onClick={() => setActiveTab('STRING_CHART')} className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"><span className="flex min-w-0 items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: train.color }} /><span className="truncate text-xs font-bold text-white">{train.number} · {train.name}</span></span><span className="ml-3 shrink-0 text-[11px] font-semibold text-slate-400">{train.dir === 'UP' ? labels.upDirection : labels.downDirection} · {train.speedKmh} km/h</span></button>)}</div>
        </div>

        <div className="glass-card rounded-2xl border-slate-800/80 p-5">
          <div className="mb-4 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-bold text-white"><Wrench className="h-4 w-4 text-amber-400" /> {labels.maintenanceWatchlist}</div><p className="mt-1 text-xs text-slate-400">{labels.highestPriority}</p></div><button onClick={() => setActiveTab('GANTT')} className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300">{labels.timeline} <ArrowUpRight className="h-3.5 w-3.5" /></button></div>
          <div className="space-y-2">{criticalTasks.map((task) => <button key={task.id} onClick={() => setActiveTab('GANTT')} className="w-full rounded-xl border border-white/5 bg-slate-950/40 p-3 text-left transition hover:border-amber-400/30 hover:bg-amber-400/5"><div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-bold text-white">{task.description}</span><span className="shrink-0 text-[10px] font-black text-rose-400">P{task.severity}</span></div><div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400"><span>{task.section_name}</span><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {isOptimized ? task.optimized_start_hhmm : '06:00'} {labels.start}</span></div></button>)}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <button onClick={() => setActiveTab('ML_SCORER')} className="glass-card glass-card-hover rounded-2xl p-4 text-left"><div className="flex items-center gap-2 text-sm font-bold text-white"><CircleAlert className="h-4 w-4 text-rose-400" /> {labels.scanRisk}</div><p className="mt-2 text-xs text-slate-400">{labels.reviewPredictive}</p><span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-300">{labels.openRisk} <ArrowUpRight className="h-3.5 w-3.5" /></span></button>
        <button onClick={() => setActiveTab('SIMULATION')} className="glass-card glass-card-hover rounded-2xl p-4 text-left"><div className="flex items-center gap-2 text-sm font-bold text-white"><Sparkles className="h-4 w-4 text-amber-400" /> {labels.testDisruption}</div><p className="mt-2 text-xs text-slate-400">{labels.seeIncident}</p><span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-300">{labels.openSimulator} <ArrowUpRight className="h-3.5 w-3.5" /></span></button>
        <button onClick={() => setActiveTab('PTW')} className="glass-card glass-card-hover rounded-2xl p-4 text-left"><div className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck className="h-4 w-4 text-emerald-400" /> {labels.authorizeWork}</div><p className="mt-2 text-xs text-slate-400">{labels.resolveClashes}</p><span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-300">{labels.reviewConflicts} <ArrowUpRight className="h-3.5 w-3.5" /></span></button>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4 text-xs text-slate-500"><span className="flex items-center gap-2"><GitMerge className="h-3.5 w-3.5" /> {corridor.zone} · {corridor.division}</span><button onClick={() => setActiveTab('GIS_MAP')} className="flex items-center gap-1 font-bold text-slate-300 hover:text-white"><Map className="h-3.5 w-3.5" /> {labels.exploreNetwork}</button></div>
    </main>
  );
}