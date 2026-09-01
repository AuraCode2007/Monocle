import React from 'react';
import { Calendar as CalIcon, Layers, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function RollingCalendar() {
  const weeks = Array.from({ length: 26 }, (_, i) => ({
    weekNum: i + 1,
    dateRange: `Week ${i + 1}`,
    blocksPlanned: Math.floor(8 + Math.sin(i) * 4),
    utilization: Math.floor(75 + Math.cos(i) * 15),
    status: i < 4 ? 'LOCKED_FIRM' : i < 12 ? 'PROVISIONAL' : 'TENTATIVE'
  }));

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CalIcon className="w-4 h-4 text-purple-400" />
            26-Week Rolling Block Programme (RBP) Horizon
          </h2>
          <p className="text-xs text-slate-400">
            Indian Railways Strategic Horizon: Multi-department predictive block forecasting across Prayagraj Division.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
          Horizon: 6 Months Forward
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 overflow-y-auto max-h-[360px] p-1">
        {weeks.map((w) => {
          let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          if (w.status === 'PROVISIONAL') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          if (w.status === 'TENTATIVE') badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';

          return (
            <div key={w.weekNum} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-slate-200">W{w.weekNum}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${badgeColor}`}>
                    {w.status.slice(0, 4)}
                  </span>
                </div>
                <div className="text-slate-400 text-[10px]">Blocks: <span className="font-bold text-slate-200">{w.blocksPlanned}</span></div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Utilization</span>
                <span className="font-mono font-bold text-emerald-400">{w.utilization}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}