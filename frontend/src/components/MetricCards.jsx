import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, GitMerge, TrendingUp } from 'lucide-react';
import { useLanguage } from '../i18n';

export default function MetricCards({ isOptimized, metrics }) {
  const { t } = useLanguage();
  const labels = t.dashboard.metrics;
  const baselineTone = 'railway-text-warning';
  const baselineSoftTone = 'text-amber-400/80';
  const conflicts = metrics?.conflicts ?? 10;
  const delayMinutesSaved = metrics?.delayMinutesSaved ?? 0;
  const jointBlocks = metrics?.jointBlocks ?? 0;
  const availabilityBoostPct = metrics?.availabilityBoostPct ?? 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="glass-card glass-card-hover rounded-2xl border border-slate-800/80 p-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>{labels.activeConflicts}</span>
          {isOptimized ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 railway-text-conflict" />
          )}
        </div>
        <div className={'mt-2 text-2xl font-black ' + (isOptimized ? 'railway-text-resolved' : 'railway-text-conflict')}>
          {isOptimized ? labels.zeroConflicts : `${conflicts} ${labels.clashing}`}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          {isOptimized ? (
            <span className="railway-text-resolved font-medium">{labels.collisionFree}</span>
          ) : (
            <span className="railway-text-conflict font-medium">{labels.trainClashes}</span>
          )}
        </div>
      </div>

      <div className="glass-card glass-card-hover rounded-2xl border border-slate-800/80 p-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>{labels.delaysAvoided}</span>
          <Clock className={'h-4 w-4 ' + (isOptimized ? 'text-emerald-400' : baselineTone)} />
        </div>
        <div className={'mt-2 text-2xl font-black ' + (isOptimized ? 'text-emerald-400' : baselineTone)}>
          {isOptimized ? `+${delayMinutesSaved} ${labels.mins}` : `0 ${labels.baseline}`}
        </div>
        <div className={'mt-1 text-[11px] font-medium ' + (isOptimized ? 'text-emerald-400/80' : baselineSoftTone)}>
          {isOptimized ? labels.passengerSaved : labels.daylightThrottling}
        </div>
      </div>

      <div className="glass-card glass-card-hover rounded-2xl border border-slate-800/80 p-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>{labels.jointBlocks}</span>
          <GitMerge className={'h-4 w-4 ' + (isOptimized ? 'text-emerald-400' : baselineTone)} />
        </div>
        <div className={'mt-2 text-2xl font-black ' + (isOptimized ? 'text-emerald-400' : baselineTone)}>
          {isOptimized ? `${jointBlocks} ${labels.coLocated}` : `0 (${labels.siloed})`}
        </div>
        <div className={'mt-1 text-[11px] font-medium ' + (isOptimized ? 'text-emerald-400/80' : baselineSoftTone)}>
          {isOptimized ? labels.bundled : labels.uncoordinated}
        </div>
      </div>

      <div className="glass-card glass-card-hover rounded-2xl border border-slate-800/80 p-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>{labels.availability}</span>
          <TrendingUp className={'h-4 w-4 ' + (isOptimized ? 'text-emerald-400' : baselineTone)} />
        </div>
        <div className={'mt-2 text-2xl font-black ' + (isOptimized ? 'text-emerald-400' : baselineTone)}>
          {isOptimized ? `+${availabilityBoostPct}%` : `${labels.baselineLabel} (${metrics?.baselineAvailabilityPct ?? 58}%)`}
        </div>
        <div className={'mt-1 text-[11px] font-medium ' + (isOptimized ? 'text-emerald-400/80' : baselineSoftTone)}>
          {isOptimized ? labels.throughput : labels.utilization}
        </div>
      </div>
    </div>
  );
}
