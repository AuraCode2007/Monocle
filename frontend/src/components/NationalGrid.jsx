import React from 'react';
import { useRailwayStore, CORRIDORS } from '../store/useRailwayStore';
import { Globe, MapPin, TrendingUp, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function NationalGrid() {
  const { activeCorridorKey, setCorridor, setActiveTab } = useRailwayStore();

  const ZONES_DATA = [
    { code: 'NCR', name: 'North Central Railway', hq: 'Prayagraj', divisions: 3, routeKm: 3222, efficiency: '94%', activeCorridor: 'NDLS_CNB' },
    { code: 'WR', name: 'Western Railway', hq: 'Mumbai CCG', divisions: 6, routeKm: 6182, efficiency: '96%', activeCorridor: 'MMCT_ADI' },
    { code: 'ER', name: 'Eastern Railway', hq: 'Kolkata', divisions: 4, routeKm: 2717, efficiency: '91%', activeCorridor: 'HWH_DDU' },
    { code: 'SR', name: 'Southern Railway', hq: 'Chennai', divisions: 6, routeKm: 5079, efficiency: '95%', activeCorridor: 'MAS_SBC' },
    { code: 'NR', name: 'Northern Railway', hq: 'New Delhi', divisions: 5, routeKm: 6968, efficiency: '89%' },
    { code: 'CR', name: 'Central Railway', hq: 'Mumbai CSMT', divisions: 5, routeKm: 4151, efficiency: '92%' },
    { code: 'ECR', name: 'East Central Railway', hq: 'Hajipur', divisions: 5, routeKm: 4128, efficiency: '88%' },
    { code: 'SWR', name: 'South Western Railway', hq: 'Hubballi', divisions: 3, routeKm: 3566, efficiency: '95%' },
    { code: 'SCR', name: 'South Central Railway', hq: 'Secunderabad', divisions: 6, routeKm: 6128, efficiency: '93%' },
    { code: 'WCR', name: 'West Central Railway', hq: 'Jabalpur', divisions: 3, routeKm: 2997, efficiency: '92%' },
    { code: 'SECR', name: 'South East Central', hq: 'Bilaspur', divisions: 3, routeKm: 2447, efficiency: '90%' },
    { code: 'ECoR', name: 'East Coast Railway', hq: 'Bhubaneswar', divisions: 3, routeKm: 2746, efficiency: '91%' },
  ];

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Pan-India Zonal Command & 68-Division Macro Scale Architecture
          </h2>
          <p className="text-xs text-slate-400">
            Indian Railways National Scale Deployment: Showing live operational capacity across all 17 Zonal Railways.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
          68 Divisions Integrated
        </span>
      </div>

      {/* National Macro ROI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20">
          <div className="text-[11px] text-slate-400 font-medium">Nationwide Annual Delay Cost Saved</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹5,120 Crore / Yr</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">⚡ Across all 68 divisions via CP-SAT optimization</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="text-[11px] text-slate-400 font-medium">Track Maintenance Hours Saved</div>
          <div className="text-2xl font-black text-purple-400 mt-1">28,400 Hrs / Month</div>
          <div className="text-[10px] text-purple-400/80 mt-1">🔄 Through synchronized multi-dept joint blocks</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20">
          <div className="text-[11px] text-slate-400 font-medium">Line Capacity Throughput Recovery</div>
          <div className="text-2xl font-black text-amber-400 mt-1">+24.8% Gained</div>
          <div className="text-[10px] text-amber-400/80 mt-1">📈 Congested corridors drop from 140% to 88%</div>
        </div>
      </div>

      {/* 4 Flagship High Density Corridors Quick Switcher */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Click to Load & Solve High Density Golden Corridors (HDN 1 - 4)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(CORRIDORS).map((c) => {
            const isSelected = activeCorridorKey === c.id;

            return (
              <div
                key={c.id}
                onClick={() => { setCorridor(c.id); setActiveTab('GANTT'); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{c.zone}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
                  </div>
                  <h4 className="font-bold text-white text-xs mb-1">{c.name}</h4>
                  <p className="text-[10px] text-slate-400">{c.division} | {c.distance_km} KM | {c.speed_kmh} km/h</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono">{c.sections.length} Track Sections</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    Load & View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 17 Zonal Railways Status Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          17 Zonal Railways Live Telemetry Grid
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {ZONES_DATA.map((z) => (
            <div key={z.code} className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800 text-[11px]">
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">{z.code}</span>
                <span className="text-[10px] font-mono text-emerald-400">{z.efficiency}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate" title={z.name}>{z.name}</div>
              <div className="text-[9px] text-slate-500 mt-1">HQ: {z.hq}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}