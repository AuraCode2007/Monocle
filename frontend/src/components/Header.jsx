import React from 'react';
import { Train, Zap, ShieldCheck, Activity, RefreshCw, UserCheck } from 'lucide-react';

export default function Header({ isOptimized, onToggleOptimize, isSolving, activeRole, onRoleChange, isApiConnected }) {
  return (
    <header className="glass-card p-4 rounded-2xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 flex items-center justify-center">
          <Train className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              RailSync<span className="text-emerald-400">-AI</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> CRIS-Compliant
            </span>
            <span className={'text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ' + (isApiConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
              <Activity className="w-3 h-3 animate-pulse" /> {isApiConnected ? 'Backend Live' : 'Demo Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ministry of Railways - Intelligent Automatic Block Planning and Asset Availability Maximizer
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-3 w-full md:w-auto justify-end">
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <select 
            value={activeRole} 
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium text-xs"
          >
            <option value="SECTION_CONTROLLER">Chief Section Controller</option>
            <option value="TRACK_ENGINEER">Sr. Divisional Engineer (Track)</option>
            <option value="TRACTION_CONTROLLER">Traction Power Controller (TRD)</option>
            <option value="SIGNAL_INCHARGE">Divisional Signal Engineer (S&T)</option>
          </select>
        </div>

        <button
          onClick={onToggleOptimize}
          disabled={isSolving}
          className={'px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer ' + (isOptimized ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 active:scale-95')}
        >
          {isSolving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Solving via OR-Tools...</span>
            </>
          ) : isOptimized ? (
            <>
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Reset to Baseline</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>Run AI Optimizer</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
