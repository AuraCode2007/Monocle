import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, GitMerge, TrendingUp } from 'lucide-react';

export default function MetricCards({ isOptimized, metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="glass-card glass-card-hover p-4 rounded-2xl border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Active Train Conflicts</span>
          {isOptimized ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          )}
        </div>
        <div className={'text-2xl lg:text-3xl font-black mt-1 ' + (isOptimized ? 'text-emerald-400' : 'text-rose-400')}>
          {isOptimized ? '0 Conflicts' : '10 Clashing'}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          {isOptimized ? (
            <span className="text-emerald-400 font-medium">100% Collision-Free Schedule</span>
          ) : (
            <span className="text-rose-400 font-medium">Clashes with Rajdhani/Vande Bharat</span>
          )}
        </div>
      </div>

      <div className="glass-card glass-card-hover p-4 rounded-2xl border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Train Delays Avoided</span>
          <Clock className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl lg:text-3xl font-black text-emerald-400 mt-1">
          {isOptimized ? '+450 Mins' : '0 Mins (Baseline)'}
        </div>
        <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">
          {isOptimized ? '7.5 Hours passenger network time saved' : 'Heavy daylight passenger throttling'}
        </div>
      </div>

      <div className="glass-card glass-card-hover p-4 rounded-2xl border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Joint Synced Blocks</span>
          <GitMerge className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl lg:text-3xl font-black text-purple-400 mt-1">
          {isOptimized ? '4 Co-Located' : '0 (Siloed Requests)'}
        </div>
        <div className="text-[11px] text-purple-400/80 mt-1 font-medium">
          {isOptimized ? 'Track + OHE + Signal bundled closures' : 'Multiple uncoordinated closures requested'}
        </div>
      </div>

      <div className="glass-card glass-card-hover p-4 rounded-2xl border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Asset Availability Boost</span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl lg:text-3xl font-black text-amber-400 mt-1">
          {isOptimized ? '+46.4%' : 'Baseline (58%)'}
        </div>
        <div className="text-[11px] text-amber-400/80 mt-1 font-medium">
          {isOptimized ? 'Net corridor throughput surge' : 'Suboptimal track maintenance utilization'}
        </div>
      </div>
    </div>
  );
}
