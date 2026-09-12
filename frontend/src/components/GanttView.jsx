import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../i18n';
import { getSchedulerGanttData, runScheduler } from '../api';
import {
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Clock,
  Layers,
  ShieldCheck,
  X,
} from 'lucide-react';

// ─── Department → CSS class mapping ──────────────────────────
const DEPT_CLASS = {
  TMS:   'railway-dept-eng',
  TDMS:  'railway-dept-trd',
  SMMS:  'railway-dept-snt',
  JOINT: 'railway-dept-joint',
};

function deptClass(job) {
  if (job.block_type === 'JOINT') return DEPT_CLASS.JOINT;
  return DEPT_CLASS[job.department] || 'railway-dept-eng';
}

// ─── Priority badge colours ───────────────────────────────────
const PRIORITY_COLORS = {
  1: 'bg-red-500/20 text-red-300 border-red-500/30',
  2: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  3: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  4: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  5: 'bg-slate-600/30 text-slate-400 border-slate-600/30',
};
const priorityLabel = (p) =>
  ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'ROUTINE'][p] || `P${p}`;

// ─── Loading skeleton row ─────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 min-w-[700px] p-2 rounded-xl bg-slate-900/40 border border-slate-800/50 animate-pulse">
      <div className="w-32 flex-shrink-0 space-y-1">
        <div className="h-2 w-16 bg-slate-700 rounded" />
        <div className="h-3 w-24 bg-slate-700 rounded" />
      </div>
      <div className="flex-1 h-8 bg-slate-800/80 rounded-lg" />
    </div>
  );
}

// ─── Time ruler labels ────────────────────────────────────────
const TIME_LABELS = ['00:00','04:00','08:00','12:00','16:00','20:00','24:00'];

export default function GanttView() {
  const { t } = useLanguage();

  const [data,       setData]       = useState(null);   // raw scheduler response
  const [loading,    setLoading]    = useState(true);
  const [solving,    setSolving]    = useState(false);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null);   // clicked job object
  const [filterDept, setFilterDept] = useState('ALL');

  // ── Fetch on mount ──────────────────────────────────────────
  const fetchGantt = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSchedulerGanttData(15);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGantt(); }, [fetchGantt]);

  // ── Re-solve on button click ────────────────────────────────
  const handleRunSolver = useCallback(async () => {
    setSolving(true);
    setError(null);
    try {
      const result = await runScheduler(15);
      setData(result);
      setSelected(null);
    } catch (err) {
      setError(err.message || 'Solver error');
    } finally {
      setSolving(false);
    }
  }, []);

  // ── Group scheduled_jobs by resource_key ───────────────────
  const rows = useMemo(() => {
    if (!data?.scheduled_jobs?.length) return [];

    const grouped = {};
    for (const job of data.scheduled_jobs) {
      if (!grouped[job.resource_key]) {
        grouped[job.resource_key] = {
          resource_key: job.resource_key,
          label: job.section,
          sub: job.direction,
          jobs: [],
        };
      }
      grouped[job.resource_key].jobs.push(job);
    }

    // Sort rows by first job start time
    return Object.values(grouped).sort(
      (a, b) =>
        Math.min(...a.jobs.map((j) => j.start_mins)) -
        Math.min(...b.jobs.map((j) => j.start_mins))
    );
  }, [data]);

  // ── Filter rows by department ───────────────────────────────
  const filteredRows = useMemo(() => {
    if (filterDept === 'ALL') return rows;
    return rows
      .map((r) => ({
        ...r,
        jobs: r.jobs.filter((j) => j.department === filterDept),
      }))
      .filter((r) => r.jobs.length > 0);
  }, [rows, filterDept]);

  const metrics = data?.metrics || {};
  const status  = data?.status  || '';

  // ── Status badge ────────────────────────────────────────────
  const statusBadge = {
    OPTIMAL:   { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 className="w-3 h-3" /> },
    FEASIBLE:  { cls: 'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',  icon: <CheckCircle2 className="w-3 h-3" /> },
    INFEASIBLE:{ cls: 'bg-red-500/15     text-red-400     border-red-500/30',     icon: <AlertTriangle className="w-3 h-3" /> },
    UNKNOWN:   { cls: 'bg-slate-500/15   text-slate-400   border-slate-500/30',   icon: <AlertTriangle className="w-3 h-3" /> },
  }[status] || { cls: 'bg-slate-600/15 text-slate-400 border-slate-600/30', icon: null };

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col mb-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            {t?.ui?.ganttTitle || 'Block Schedule'} — CP-SAT Optimized
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real maintenance jobs · grouped by track resource · 24-hour window
          </p>

          {/* Solver metrics strip */}
          {data && (
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {/* Solver status */}
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.cls}`}>
                {statusBadge.icon}
                {status}
              </span>

              {metrics.makespan && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Makespan: <span className="font-mono text-cyan-300">{metrics.makespan}</span>
                </span>
              )}
              {metrics.joint_blocks !== undefined && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <Layers className="w-3 h-3 text-purple-400" />
                  Joint blocks: <span className="font-mono text-purple-300">{metrics.joint_blocks}</span>
                </span>
              )}
              {metrics.resource_conflicts !== undefined && (
                <span className={`inline-flex items-center gap-1 text-[10px] ${metrics.resource_conflicts === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  <ShieldCheck className="w-3 h-3" />
                  Conflicts: <span className="font-mono">{metrics.resource_conflicts}</span>
                </span>
              )}
              {data.solver_time_sec !== undefined && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                  <Zap className="w-3 h-3" />
                  Solved in {data.solver_time_sec}s
                </span>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dept filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-[11px] bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Depts</option>
            <option value="TMS">TMS (Track)</option>
            <option value="TDMS">TDMS (Traction)</option>
            <option value="SMMS">SMMS (Signal)</option>
          </select>

          {/* Run Solver */}
          <button
            onClick={handleRunSolver}
            disabled={solving || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${solving ? 'animate-spin' : ''}`} />
            {solving ? 'Solving…' : 'Run Solver'}
          </button>
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs mb-3 flex-wrap">
        <span className="railway-dept-eng rounded px-2 py-0.5 text-[10px] font-medium">TMS · Track</span>
        <span className="railway-dept-trd rounded px-2 py-0.5 text-[10px] font-medium">TDMS · Traction</span>
        <span className="railway-dept-snt rounded px-2 py-0.5 text-[10px] font-medium">SMMS · Signal</span>
        <span className="railway-dept-joint rounded px-2 py-0.5 text-[10px] font-medium">Joint Block</span>
      </div>

      {/* ── Time ruler ─────────────────────────────────────── */}
      <div className="flex items-center text-[10px] font-mono text-slate-500 mb-2 pl-36 pr-4 border-b border-slate-800/50 pb-1">
        {TIME_LABELS.map((label) => (
          <span key={label} className="flex-1 last:flex-none">{label}</span>
        ))}
      </div>

      {/* ── Error state ────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs mb-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchGantt}
            className="ml-auto text-[10px] px-2 py-0.5 bg-red-500/20 rounded hover:bg-red-500/30 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Gantt body ─────────────────────────────────────── */}
      <div className="space-y-2 overflow-x-auto">

        {/* Loading skeletons */}
        {(loading || solving) && !data && (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        )}

        {/* Empty state */}
        {!loading && !solving && !error && filteredRows.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No scheduled jobs found.{' '}
            <button onClick={handleRunSolver} className="text-emerald-400 hover:underline">
              Run the solver
            </button>{' '}
            to generate a schedule.
          </div>
        )}

        {/* Gantt rows */}
        {filteredRows.map((row) => (
          <div
            key={row.resource_key}
            className="flex items-center gap-3 min-w-[700px] p-2 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 transition-all border border-slate-800/50"
          >
            {/* Row label */}
            <div className="w-32 flex-shrink-0 text-xs font-semibold text-slate-300 truncate" title={row.resource_key}>
              <span className="text-[10px] text-slate-500 block font-mono">{row.sub}</span>
              {row.label}
            </div>

            {/* Timeline bar */}
            <div className="flex-1 h-8 bg-slate-950/80 rounded-lg relative overflow-hidden border border-slate-800/60">

              {/* Night lull shading */}
              <div className="absolute left-0 w-[20.8%] h-full bg-emerald-500/5 border-r border-emerald-500/10" title="Night Lull 00:00–05:00" />
              <div className="absolute right-0 w-[8.3%]  h-full bg-emerald-500/5 border-l border-emerald-500/10" title="Late Night 22:00–24:00" />

              {/* Hour grid lines */}
              {[4,8,12,16,20].map((h) => (
                <div
                  key={h}
                  className="absolute top-0 bottom-0 w-px bg-slate-800/40"
                  style={{ left: `${(h * 60 / 1440) * 100}%` }}
                />
              ))}

              {/* Job bars */}
              {row.jobs.map((job) => {
                const leftPct  = (job.start_mins / 1440) * 100;
                const widthPct = Math.max(1.5, ((job.end_mins - job.start_mins) / 1440) * 100);
                const cls      = deptClass(job);
                const isActive = selected?.job_id === job.job_id;

                return (
                  <div
                    key={job.job_id}
                    onClick={() => setSelected(isActive ? null : job)}
                    className={`
                      absolute top-1 bottom-1 rounded-md shadow-md cursor-pointer border
                      flex items-center justify-between px-1.5 text-[9px] font-bold
                      transition-all hover:scale-y-110 hover:z-20
                      ${cls}
                      ${isActive ? 'ring-2 ring-white/30 z-20 scale-y-110' : ''}
                    `}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    title={`${job.job_id} | ${job.department} | ${job.start}–${job.end} | ${job.work_category}`}
                  >
                    <span className="truncate font-mono leading-none">{job.department}</span>
                    {job.block_type === 'JOINT' && (
                      <Layers className="w-2.5 h-2.5 shrink-0 opacity-80" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Overlay skeleton while re-solving */}
        {solving && data && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30 pointer-events-none">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running CP-SAT solver…
            </div>
          </div>
        )}
      </div>

      {/* ── Detail panel (click-to-inspect) ────────────────── */}
      {selected && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

            {/* Left: job info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-emerald-400 text-xs">{selected.job_id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[selected.priority] || PRIORITY_COLORS[5]}`}>
                  {priorityLabel(selected.priority)}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${DEPT_CLASS[selected.department] || 'railway-dept-eng'}`}>
                  {selected.department}
                </span>
                {selected.block_type === 'JOINT' && (
                  <span className="railway-dept-joint text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" /> Joint Block
                  </span>
                )}
              </div>

              <p className="text-slate-300 text-xs font-semibold mt-1.5 truncate">
                {selected.work_category}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-400">
                <span>Section: <span className="text-slate-200 font-mono">{selected.section}</span></span>
                <span>Direction: <span className="text-slate-200 font-mono">{selected.direction}</span></span>
                <span>Duration: <span className="text-slate-200 font-mono">{selected.duration_mins} min</span></span>
                <span>Block ID: <span className="text-slate-200 font-mono">{selected.block_id}</span></span>
              </div>
            </div>

            {/* Right: time window */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Scheduled Window</div>
                <div className="font-mono font-bold text-white text-sm">
                  {selected.start} – {selected.end}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {selected.start_mins}–{selected.end_mins} min from midnight
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}