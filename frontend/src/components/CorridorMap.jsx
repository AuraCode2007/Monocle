import React from 'react';
import { useRailwayStore } from '../store/useRailwayStore';
import { MapPin, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CorridorMap() {
  const { isOptimized, getCorridor } = useRailwayStore();
  const corridor = getCorridor();
  const stations = corridor.stations;

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Corridor Schematic Track Diagram — {corridor.name}
          </h2>
          <p className="text-xs text-slate-400">{corridor.zone} | {corridor.division} ({corridor.distance_km} KM)</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
          Max Permissible Speed: {corridor.speed_kmh} km/h
        </span>
      </div>

      <div className="relative py-6 px-4 overflow-x-auto">
        <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-slate-700 -translate-y-1/2 rounded-full"></div>
        <div className={'absolute top-1/2 left-8 right-8 h-1.5 -translate-y-1/2 rounded-full transition-all duration-700 ' + (isOptimized ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 via-rose-500 to-emerald-500')}></div>

        <div className="relative flex justify-between items-center min-w-[650px]">
          {stations.map((st) => (
            <div key={st.code} className="flex flex-col items-center group cursor-pointer">
              <div className={'w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-all ' + (st.hub ? 'bg-emerald-500 text-slate-950 scale-110' : 'bg-slate-800 text-slate-200 border border-slate-600')}>
                {st.code}
              </div>
              <span className="text-xs font-semibold text-slate-200 mt-2">{st.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">{st.km} KM</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-800/80">
        <div className="p-3 bg-slate-900/60 rounded-xl flex items-center gap-2 border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-slate-400 text-[10px]">Active Caution Orders</div>
            <div className="font-bold text-white">{isOptimized ? '0 Speed Restrictions' : '2 Caution Orders (30 km/h)'}</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl flex items-center gap-2 border border-slate-800">
          <AlertCircle className={'w-4 h-4 ' + (isOptimized ? 'text-emerald-400' : 'text-amber-400')} />
          <div>
            <div className="text-slate-400 text-[10px]">Track Health Index</div>
            <div className="font-bold text-white">{isOptimized ? '100% Commercial Availability' : 'Intermittent Maintenance Clashes'}</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl flex items-center gap-2 border border-slate-800">
          <ArrowRight className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-slate-400 text-[10px]">Operational Division</div>
            <div className="font-bold text-white">{corridor.division}</div>
          </div>
        </div>
      </div>
    </div>
  );
}