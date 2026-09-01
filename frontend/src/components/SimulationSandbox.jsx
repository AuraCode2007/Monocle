import React from 'react';
import { useRailwayStore } from '../store/useRailwayStore';
import { Flame, RefreshCw, AlertTriangle, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function SimulationSandbox() {
  const { emergencyActive, injectEmergencyDefect, resetEmergency, toggleOptimize, isOptimized, isSolving } = useRailwayStore();

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Interactive "What-If" Simulation & Emergency Stress-Testing Engine
          </h2>
          <p className="text-xs text-slate-400">
            Simulate real-time track failures, weather caution orders, and test how the AI dynamically protects train throughput.
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
          emergencyActive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
          <Activity className="w-3.5 h-3.5" /> {emergencyActive ? 'CRISIS MODE ACTIVE' : 'CORRIDOR NORMAL'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Scenario 1: Rail Fracture Injection */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
              <Flame className="w-4 h-4" />
              Scenario A: Ultrasonic Rail Fracture at Tundla (Km 204)
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Injects a critical severity-5 track defect during daylight peak (13:00). Tests AI ability to carve emergency possession and re-route approaching passenger trains into loop lines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {emergencyActive ? (
              <button
                onClick={resetEmergency}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear Emergency
              </button>
            ) : (
              <button
                onClick={injectEmergencyDefect}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Inject Rail Fracture Defect
              </button>
            )}
          </div>
        </div>

        {/* Scenario 2: Re-solve with Emergency */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <ShieldCheck className="w-4 h-4" />
              AI Dynamic Conflict Rectifier (OR-Tools)
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Re-runs the CP-SAT engine under active emergency constraints to protect Vande Bharat (22436) and Prayagraj Express (12417) without causing secondary delay spirals.
            </p>
          </div>

          <div>
            <button
              onClick={toggleOptimize}
              disabled={isSolving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSolving ? 'Recalculating...' : isOptimized ? 'Re-optimize Corridor' : 'Run Dynamic Re-solve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}