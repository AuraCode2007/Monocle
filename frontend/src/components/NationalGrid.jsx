import React, { useMemo, useState } from 'react';
import { useRailwayStore, CORRIDORS } from '../store/useRailwayStore';
import { useLanguage } from '../i18n';
import { Globe, ArrowRight, Zap, Calculator, ExternalLink } from 'lucide-react';

const NETWORK_FACTS = {
  zones: 17,
  divisions: 68,
  source: 'Indian Railways / Railway Board network directory',
  sourceUrl: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,538',
};

const SCALING_ASSUMPTIONS = {
  planningCyclesPerWeek: 1,
  weeksPerYear: 52,
  rupeesPerPassengerDelayMinute: 0,
};

export default function NationalGrid() {
  const { t } = useLanguage();
  const ui = t.ui;
  const { activeCorridorKey, setCorridor, setActiveTab, isOptimized, optimizerMetrics } = useRailwayStore();
  const [showMethodology, setShowMethodology] = useState(false);

  const evidence = useMemo(() => {
    const cycleDelayMinutes = optimizerMetrics.delayMinutesSaved || 0;
    const cycleJointBlocks = optimizerMetrics.jointBlocks || 0;
    const cycleHoursRecovered = cycleJointBlocks * 90 / 60;
    const annualNetworkDelayMinutes = cycleDelayMinutes * NETWORK_FACTS.divisions * SCALING_ASSUMPTIONS.planningCyclesPerWeek * SCALING_ASSUMPTIONS.weeksPerYear;
    const annualNetworkHoursRecovered = cycleHoursRecovered * NETWORK_FACTS.divisions * SCALING_ASSUMPTIONS.planningCyclesPerWeek * SCALING_ASSUMPTIONS.weeksPerYear;
    const observedAvailabilityGain = optimizerMetrics.availabilityBoostPct || 0;

    return {
      cycleDelayMinutes,
      cycleJointBlocks,
      cycleHoursRecovered,
      annualNetworkDelayMinutes,
      annualNetworkHoursRecovered,
      observedAvailabilityGain,
    };
  }, [optimizerMetrics]);

  const ZONES_DATA = [
    { code: 'NCR', name: 'North Central Railway', hq: 'Prayagraj', activeCorridor: 'NDLS_CNB' },
    { code: 'WR', name: 'Western Railway', hq: 'Mumbai CCG', activeCorridor: 'MMCT_ADI' },
    { code: 'ER', name: 'Eastern Railway', hq: 'Kolkata', activeCorridor: 'HWH_DDU' },
    { code: 'SR', name: 'Southern Railway', hq: 'Chennai', activeCorridor: 'MAS_SBC' },
    { code: 'NR', name: 'Northern Railway', hq: 'New Delhi' },
    { code: 'CR', name: 'Central Railway', hq: 'Mumbai CSMT' },
    { code: 'ECR', name: 'East Central Railway', hq: 'Hajipur' },
    { code: 'SWR', name: 'South Western Railway', hq: 'Hubballi' },
    { code: 'SCR', name: 'South Central Railway', hq: 'Secunderabad' },
    { code: 'WCR', name: 'West Central Railway', hq: 'Jabalpur' },
    { code: 'SECR', name: 'South East Central Railway', hq: 'Bilaspur' },
    { code: 'ECoR', name: 'East Coast Railway', hq: 'Bhubaneswar' },
  ];

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            {ui.nationalTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {ui.nationalSubtitle}
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
          {NETWORK_FACTS.zones} zones · {NETWORK_FACTS.divisions} divisions
        </span>
      </div>

      {/* Evidence-backed scenario metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20">
          <div className="text-[11px] text-slate-400 font-medium">{ui.measuredDelay}</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{isOptimized ? `${evidence.cycleDelayMinutes} min` : ui.runSolver}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Returned by the active backend optimization</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20">
          <div className="text-[11px] text-slate-400 font-medium">{ui.measuredJoint}</div>
          <div className="text-2xl font-black text-purple-400 mt-1">{isOptimized ? evidence.cycleJointBlocks : ui.runSolver}</div>
          <div className="text-[10px] text-purple-400/80 mt-1">Each joint block saves 90 minutes in the solver model</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20">
          <div className="text-[11px] text-slate-400 font-medium">{ui.measuredAvailability}</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{isOptimized ? `+${evidence.observedAvailabilityGain}%` : ui.runSolver}</div>
          <div className="text-[10px] text-amber-400/80 mt-1">Calculated from baseline and optimized downtime</div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white"><Calculator className="h-4 w-4 text-cyan-300" /> {ui.networkProjection}</div>
            <p className="mt-1 text-[11px] text-slate-300">{isOptimized ? `${Math.round(evidence.annualNetworkDelayMinutes).toLocaleString()} delay minutes and ${evidence.annualNetworkHoursRecovered.toFixed(0)} maintenance hours per year if this measured cycle repeats once weekly across ${NETWORK_FACTS.divisions} divisions.` : 'Run the backend solver to calculate a projection from measured scenario outputs.'}</p>
          </div>
          <button onClick={() => setShowMethodology((visible) => !visible)} className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-slate-950/50 px-3 py-2 text-[11px] font-bold text-cyan-200"><Calculator className="h-3.5 w-3.5" /> {showMethodology ? ui.hideMethod : ui.showMethod}</button>
        </div>
        {showMethodology && <div className="mt-3 grid grid-cols-1 gap-2 border-t border-cyan-500/20 pt-3 text-[11px] text-slate-300 md:grid-cols-2"><div><span className="font-mono text-cyan-200">annual delay minutes</span> = measured minutes/cycle × divisions × cycles/week × 52</div><div><span className="font-mono text-cyan-200">annual hours</span> = joint blocks/cycle × 1.5 hours × divisions × cycles/week × 52</div><div>Inputs: {NETWORK_FACTS.divisions} divisions, {SCALING_ASSUMPTIONS.planningCyclesPerWeek} planning cycle/week, {SCALING_ASSUMPTIONS.weeksPerYear} weeks/year.</div><div>These are scenario projections, not audited national savings. ₹ conversion is intentionally omitted until an official delay-cost basis is supplied.</div></div>}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-[10px] text-slate-500">
        <span>Network fact source: {NETWORK_FACTS.source}</span>
        <a href={NETWORK_FACTS.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold text-emerald-300 hover:text-emerald-200">{ui.openSource} <ExternalLink className="h-3 w-3" /></a>
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

      {/* Source-backed directory sample */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Zonal Railway Directory Sample ({NETWORK_FACTS.zones} zones nationally)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {ZONES_DATA.map((z) => (
            <div key={z.code} className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800 text-[11px]">
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">{z.code}</span>
                <span className="text-[10px] font-mono text-emerald-400">{ui.directory}</span>
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