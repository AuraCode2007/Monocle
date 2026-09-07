import React from 'react';
import { AlertTriangle, Clock3, GitMerge, ShieldCheck, TrainFront } from 'lucide-react';
import { useRailwayStore } from '../store/useRailwayStore';
import { useLanguage } from '../i18n';

export default function OptimizationExplainabilityPanel() {
  const { t } = useLanguage();
  const ui = t.ui;
  const { isOptimized, isApiConnected, optimizerMetrics } = useRailwayStore();
  const {
    affectedTrains,
    passengerTrainsProtected,
    estimatedPassengerDelayAvoidedMinutes,
    decisionExplanations,
    solverTimeSec,
  } = optimizerMetrics;

  if (!isOptimized || !decisionExplanations.length) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          {ui.optimizationEvidence}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {ui.runOptimizerEvidence}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
      <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            {ui.explainableOptimization}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Every work window is traceable to movement protection, low-traffic capacity, or joint possession logic.
          </p>
        </div>
        <div className="text-right text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {isApiConnected ? ui.solverEvidence : ui.simulationEvidence} · {solverTimeSec}s
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-400"><TrainFront className="h-3.5 w-3.5 text-cyan-300" /> {ui.trainsProtected}</div>
          <div className="mt-2 text-2xl font-black text-cyan-200">{passengerTrainsProtected}</div>
          <div className="mt-1 text-[11px] text-slate-400">Passenger services with avoided delay</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-400"><Clock3 className="h-3.5 w-3.5 text-emerald-300" /> {ui.delayAvoided}</div>
          <div className="mt-2 text-2xl font-black text-emerald-200">{estimatedPassengerDelayAvoidedMinutes} min</div>
          <div className="mt-1 text-[11px] text-slate-400">Estimated passenger impact avoided</div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-400"><AlertTriangle className="h-3.5 w-3.5 text-amber-300" /> {ui.conflictsReviewed}</div>
          <div className="mt-2 text-2xl font-black text-amber-200">{affectedTrains.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">Unique services in the baseline clash set</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {decisionExplanations.map((decision) => (
          <article key={decision.task_id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">{decision.task_id} · {decision.department}</div>
                <div className="mt-1 text-xs font-bold text-white">{decision.section_id}</div>
              </div>
              <GitMerge className="h-4 w-4 shrink-0 text-purple-300" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-rose-500/5 p-2"><div className="text-slate-500">Requested</div><div className="mt-1 font-mono font-bold text-rose-200">{decision.original_window}</div></div>
              <div className="rounded-lg bg-emerald-500/5 p-2"><div className="text-slate-500">Selected</div><div className="mt-1 font-mono font-bold text-emerald-200">{decision.optimized_window}</div></div>
            </div>
            <div className="mt-3 space-y-1">
              {decision.reasons.map((reason) => <div key={reason} className="flex gap-2 text-[11px] leading-4 text-slate-300"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />{reason}</div>)}
            </div>
            {decision.affected_train_numbers.length > 0 && (
              <div className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-slate-400">
                {ui.protectedAgainst}: <span className="font-mono font-bold text-cyan-200">{decision.affected_train_numbers.join(', ')}</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
