import React, { useState } from 'react';
import { Calendar, Clock, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function GanttView({ isOptimized, tasks }) {
  const [selectedTask, setSelectedTask] = useState(null);

  const sections = [
    { id: 'SEC_101', name: 'GZB - ALJN (UP Line)' },
    { id: 'SEC_102', name: 'ALJN - GZB (DN Line)' },
    { id: 'SEC_103', name: 'ALJN - TDL (UP Line)' },
    { id: 'SEC_104', name: 'TDL - ALJN (DN Line)' },
    { id: 'SEC_105', name: 'TDL - ETW (UP Line)' },
    { id: 'SEC_106', name: 'ETW - TDL (DN Line)' },
    { id: 'SEC_107', name: 'ETW - CNB (UP Line)' },
    { id: 'SEC_108', name: 'CNB - ETW (DN Line)' },
  ];

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Corridor Master Gantt Timeline (24-Hour Schedule)
          </h2>
          <p className="text-xs text-slate-400">
            High Density Section: New Delhi (NDLS) to Kanpur Central (CNB) - 440 KM
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-medium">Track (ENG)</span>
          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[11px] font-medium">Traction (TRD)</span>
          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-medium">Signal (S&T)</span>
          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-medium">Joint Synced</span>
        </div>
      </div>

      <div className="flex items-center text-[10px] font-mono text-slate-400 mb-2 pl-36 pr-4 border-b border-slate-800/50 pb-1">
        <span className="w-[16.6%]">00:00</span>
        <span className="w-[16.6%]">04:00</span>
        <span className="w-[16.6%]">08:00</span>
        <span className="w-[16.6%]">12:00</span>
        <span className="w-[16.6%]">16:00</span>
        <span className="w-[16.6%]">20:00</span>
        <span>24:00</span>
      </div>

      <div className="space-y-3 overflow-x-auto">
        {sections.map(sec => {
          const secTasks = tasks ? tasks.filter(t => t.section_id === sec.id) : [];

          return (
            <div key={sec.id} className="flex items-center gap-3 min-w-[700px] p-2 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 transition-all border border-slate-800/50">
              <div className="w-32 flex-shrink-0 text-xs font-semibold text-slate-300 truncate" title={sec.name}>
                <span className="text-[10px] text-slate-500 block font-mono">{sec.id}</span>
                {sec.name}
              </div>

              <div className="flex-1 h-8 bg-slate-950/80 rounded-lg relative overflow-hidden border border-slate-800/60">
                <div className="absolute left-0 w-[20.8%] h-full bg-emerald-500/5 border-r border-emerald-500/10" title="Night Lull Window (00:00 - 05:00)"></div>
                <div className="absolute right-0 w-[8.3%] h-full bg-emerald-500/5 border-l border-emerald-500/10" title="Late Night Lull (22:00 - 24:00)"></div>

                {secTasks.map(t => {
                  const startMin = isOptimized ? (t.optimized_start_mins || 60) : (t.requested_start || 360);
                  const dur = t.duration_mins || 120;
                  const leftPct = (startMin / 1440) * 100;
                  const widthPct = Math.max(6, (dur / 1440) * 100);

                  let bgClass = 'bg-orange-500 border-orange-400 text-orange-950';
                  if (t.department === 'TRD') bgClass = 'bg-yellow-500 border-yellow-400 text-yellow-950';
                  if (t.department === 'S&T') bgClass = 'bg-blue-500 border-blue-400 text-blue-950';
                  if (t.is_joint || (isOptimized && secTasks.length > 1)) {
                    bgClass = 'bg-purple-500 border-purple-400 text-purple-950';
                  }

                  const isClashing = !isOptimized && (t.severity >= 3);

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className={'absolute top-1 bottom-1 rounded-md shadow-md cursor-pointer border flex items-center justify-between px-2 text-[10px] font-bold transition-all hover:scale-105 hover:z-20 ' + bgClass}
                      style={{ left: leftPct + '%', width: widthPct + '%' }}
                      title={t.id + ': ' + t.description}
                    >
                      <span className="truncate font-mono">{t.department}</span>
                      {isClashing && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" title="Collision Warning"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400">{selectedTask.id}</span>
              <span className="font-bold text-white">[{selectedTask.department}] {selectedTask.description}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Severity {selectedTask.severity}/5</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Section: {selectedTask.section_name} | Block Type: {selectedTask.block_type} | Duration: {selectedTask.duration_mins} mins
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">Scheduled Window</div>
              <div className="font-mono font-bold text-white">
                {isOptimized ? (selectedTask.optimized_start_hhmm || '01:00') + ' - ' + (selectedTask.optimized_end_hhmm || '04:00') : '06:00 - 09:00'}
              </div>
            </div>
            <button 
              onClick={() => setSelectedTask(null)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
