import React from 'react';
import { Train, Zap, ShieldCheck, RefreshCw, UserCheck, Bot, MapPin } from 'lucide-react';
import { LANGUAGES } from '../i18n';
import { useRailwayStore } from '../store/useRailwayStore';

export default function Header({ isOptimized, onToggleOptimize, isSolving, activeRole, onRoleChange, isApiConnected, onOpenAssistant, language, labels, onChangeLanguage }) {
  const { activeCorridorKey, setCorridor } = useRailwayStore();

  const handleOptimizeClick = () => {
    onToggleOptimize();
  };

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-3 w-full xl:w-auto">
        <div className="p-3 rounded-xl border border-amber-400/40 bg-slate-900/90 text-slate-100 shadow-sm">
          <Train className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Monocle <span className="text-slate-300 text-sm font-bold bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">RailSync</span>
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {labels.compliant}
            </span>
          </div>
          <p className="text-xs text-slate-400">{labels.brandSubtitle}</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 w-full xl:w-auto justify-start xl:justify-end">

        <label className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-slate-200">
          <span className="sr-only">{labels.language}</span>
          <select value={language} onChange={(event) => onChangeLanguage(event.target.value)} aria-label={labels.language} className="railway-select bg-transparent text-slate-200 outline-none cursor-pointer font-bold text-xs [color-scheme:dark]">
            {LANGUAGES.map((option) => <option key={option.code} value={option.code} className="bg-slate-900 text-slate-200">{option.nativeLabel} · {option.label}</option>)}
          </select>
        </label>

        <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <select value={activeCorridorKey} onChange={(e) => setCorridor(e.target.value)}
            className="railway-select bg-transparent text-slate-200 outline-none cursor-pointer font-bold text-xs [color-scheme:dark]">
            <option className="bg-slate-900 text-slate-200" value="NDLS_CNB">NDLS-CNB (NCR - 440 KM)</option>
            <option className="bg-slate-900 text-slate-200" value="MMCT_ADI">MMCT-ADI (WR - 492 KM)</option>
            <option className="bg-slate-900 text-slate-200" value="HWH_DDU">HWH-DDU (ER - 675 KM)</option>
            <option className="bg-slate-900 text-slate-200" value="MAS_SBC">MAS-SBC (SR - 360 KM)</option>
          </select>
        </div>

        <button onClick={onOpenAssistant}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:border-slate-500">
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{labels.askAi}</span>
        </button>

        <label className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs text-slate-300" title="Changes the demo view only; permissions remain tied to the signed-in account.">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">Demo role</span>
          <select value={activeRole} onChange={(e) => onRoleChange(e.target.value)}
            className="railway-select bg-transparent text-slate-200 outline-none cursor-pointer font-medium text-xs [color-scheme:dark]">
            <option className="bg-slate-900 text-slate-200" value="SECTION_CONTROLLER">Section Controller</option>
            <option className="bg-slate-900 text-slate-200" value="TRACK_ENGINEER">Sr. DEN (Track)</option>
            <option className="bg-slate-900 text-slate-200" value="TRACTION_CONTROLLER">TPC (Traction)</option>
            <option className="bg-slate-900 text-slate-200" value="SIGNAL_INCHARGE">DSTE (Signal)</option>
          </select>
        </label>

        <button onClick={handleOptimizeClick} disabled={isSolving}
          className={'px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-1.5 cursor-pointer ' + (isOptimized ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 active:scale-95')}>
            {isSolving ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>{labels.solving}</span></>) :
              isOptimized ? (<><RefreshCw className="w-3.5 h-3.5 text-slate-400" /><span>{labels.reset}</span></>) :
           (<><Zap className="w-3.5 h-3.5 fill-current" /><span>{labels.optimizer}</span></>)}
        </button>

      </div>
    </div>
  );
}