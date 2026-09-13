import React, { useState } from 'react';
import { useRailwayStore } from '../store/useRailwayStore';
import { useLanguage } from '../i18n';
import { Compass } from 'lucide-react';

// Dept colour palette — mirrors GanttView CSS class intent but in SVG fills
const DEPT_COLOURS = {
  TMS:    { fill: 'rgba(16,185,129,0.20)',  stroke: '#10b981' },
  TDMS:   { fill: 'rgba(234,179,8,0.20)',   stroke: '#eab308' },
  SMMS:   { fill: 'rgba(59,130,246,0.20)',  stroke: '#3b82f6' },
  JOINT:  { fill: 'rgba(168,85,247,0.20)',  stroke: '#a855f7' },
  DEFAULT:{ fill: 'rgba(249,115,22,0.20)',  stroke: '#f97316' },
};

function deptColour(task, isOptimized, secTaskCount) {
  if (task.is_joint || (isOptimized && secTaskCount > 1)) return DEPT_COLOURS.JOINT;
  return DEPT_COLOURS[task.department] || DEPT_COLOURS.DEFAULT;
}

export default function StringChart() {
  const { t } = useLanguage();
  const ui = t.ui;
  const { isOptimized, getCorridor, getSections, getTrains, getTasks } = useRailwayStore();
  const [hoveredTrain, setHoveredTrain]   = useState(null);
  const [selectedTask, setSelectedTask]   = useState(null);

  const corridor = getCorridor();
  const sections = getSections();
  const trains   = getTrains();
  const allTasks = getTasks();

  // ── Layout ──────────────────────────────────────────────────────────────────
  const SVG_W  = 900;
  const PAD    = { left: 80, right: 28, top: 36, bottom: 36 };
  const ROW_H  = 28;
  const GAP    = 8;
  const SVG_H  = PAD.top + sections.length * (ROW_H + GAP) + PAD.bottom;
  const plotW  = SVG_W - PAD.left - PAD.right;

  const timeToX = (min) =>
    PAD.left + (Math.max(0, Math.min(1440, min || 0)) / 1440) * plotW;

  // Each section occupies its own band; Y = centre of that band
  const rowTopY = (i) => PAD.top + i * (ROW_H + GAP);

  // Map section id -> index for quick lookup
  const secIdx = Object.fromEntries(sections.map((s, i) => [s.id, i]));

  // ── Train lines: map startKm/endKm → section row Y ──────────────────────────
  const trainLines = trains.map((tr) => {
    const startFrac = tr.startKm / Math.max(1, corridor.distance_km);
    const endFrac   = tr.endKm   / Math.max(1, corridor.distance_km);
    const si = Math.round(startFrac * (sections.length - 1));
    const ei = Math.round(endFrac   * (sections.length - 1));
    return {
      ...tr,
      x1: timeToX(tr.startMin),
      y1: rowTopY(si) + ROW_H / 2,
      x2: timeToX(tr.endMin),
      y2: rowTopY(ei) + ROW_H / 2,
    };
  });

  // ── Intersection count ───────────────────────────────────────────────────────
  let intersections = 0;
  trains.forEach((tr) => {
    allTasks.forEach((task) => {
      const s = isOptimized
        ? (task.optimized_start_mins ?? task.requested_start ?? 360)
        : (task.requested_start ?? 360);
      const e = s + (task.duration_mins || 60);
      if (tr.startMin < e && tr.endMin > s) intersections++;
    });
  });

  const TIME_TICKS = [0, 240, 480, 720, 960, 1200, 1440];

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            {ui.stringTitle} — {corridor.name}
          </h2>
          <p className="text-xs text-slate-400">{ui.stringSubtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            {[['bg-emerald-400','TMS'],['bg-yellow-400','TDMS'],['bg-blue-400','SMMS'],['bg-purple-400','Joint']].map(([cls,lbl]) => (
              <React.Fragment key={lbl}>
                <span className={`h-2 w-2 rounded-full ${cls} inline-block`} />
                <span className="text-slate-400">{lbl}</span>
              </React.Fragment>
            ))}
          </div>
          <span className={isOptimized ? 'railway-badge-resolved font-mono text-[11px]' : 'railway-badge-conflict font-mono text-[11px]'}>
            {intersections} Train-Block Intersections
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="bg-white/60 rounded-xl border border-slate-200">

          {/* Time grid */}
          {TIME_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={timeToX(tick)} y1={PAD.top - 8}
                x2={timeToX(tick)} y2={SVG_H - PAD.bottom + 8}
                stroke="#cbd5e1" strokeDasharray="4 4"
              />
              <text
                x={timeToX(tick)} y={SVG_H - PAD.bottom + 22}
                fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="500"
              >
                {String(Math.floor(tick / 60)).padStart(2,'0')}:00
              </text>
            </g>
          ))}

          {/* Night lull shading 00:00-05:00 and 22:00-24:00 */}
          <rect x={timeToX(0)}    y={PAD.top}
                width={timeToX(300)-timeToX(0)}
                height={SVG_H-PAD.top-PAD.bottom}
                fill="rgba(16,185,129,0.07)" />
          <rect x={timeToX(1320)} y={PAD.top}
                width={timeToX(1440)-timeToX(1320)}
                height={SVG_H-PAD.top-PAD.bottom}
                fill="rgba(16,185,129,0.07)" />

          {/* Section rows */}
          {sections.map((sec, i) => {
            const ry       = rowTopY(i);
            const secTasks = allTasks.filter((task) => task.section_id === sec.id);

            return (
              <g key={sec.id}>
                {/* Row bg */}
                <rect x={PAD.left} y={ry} width={plotW} height={ROW_H}
                      fill={i % 2 === 0 ? 'rgba(241,245,249,0.7)' : 'rgba(226,232,240,0.5)'} rx="4" />

                {/* Section label */}
                <text
                  x={PAD.left - 6} y={ry + ROW_H / 2 + 4}
                  fill="#475569" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="600"
                >
                  {sec.id.replace('SEC_','S')}
                </text>

                {/* Train movement windows (background hint) */}
                {trains.map((tr) => (
                  <rect
                    key={sec.id+'-tr-'+tr.number}
                    x={timeToX(tr.startMin)}
                    y={ry + 2}
                    width={Math.max(2, timeToX(tr.endMin) - timeToX(tr.startMin))}
                    height={ROW_H - 4}
                    fill="rgba(34,211,238,0.05)"
                    stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.25"
                    rx="2"
                  />
                ))}

                {/* Maintenance blocks */}
                {secTasks.map((task) => {
                  const startM = isOptimized
                    ? (task.optimized_start_mins ?? task.requested_start ?? 360)
                    : (task.requested_start ?? 360);
                  const dur  = task.duration_mins || 60;
                  const endM = startM + dur;
                  const x    = timeToX(startM);
                  const w    = Math.max(8, timeToX(endM) - x);
                  const col  = deptColour(task, isOptimized, secTasks.length);
                  const isClashing = !isOptimized && (task.severity >= 3);

                  return (
                    <g key={task.id} onClick={() => setSelectedTask(task)} style={{ cursor:'pointer' }}>
                      <rect
                        x={x} y={ry + 2} width={w} height={ROW_H - 4}
                        fill={col.fill} stroke={col.stroke}
                        strokeWidth={selectedTask?.id === task.id ? 2.5 : 1.5}
                        rx="3"
                      />
                      {w > 28 && (
                        <text x={x+4} y={ry+ROW_H/2+4}
                              fill="#1e293b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          {task.department}
                        </text>
                      )}
                      {isClashing && (
                        <circle cx={x+w-5} cy={ry+5} r="3" fill="#f43f5e">
                          <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <title>{task.id}: {task.description} | {startM}–{endM} min ({dur} min)</title>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Train string lines (drawn on top) */}
          {trainLines.map((tr) => {
            const hov = hoveredTrain === tr.number;
            return (
              <g key={tr.number}
                 onMouseEnter={() => setHoveredTrain(tr.number)}
                 onMouseLeave={() => setHoveredTrain(null)}
                 style={{ cursor:'pointer' }}>
                <line
                  x1={tr.x1} y1={tr.y1} x2={tr.x2} y2={tr.y2}
                  stroke={tr.color || '#10b981'}
                  strokeWidth={hov ? 3 : 1.8}
                  opacity={hoveredTrain && !hov ? 0.3 : 0.85}
                />
                <circle cx={tr.x1} cy={tr.y1} r="3.5"
                        fill={tr.color || '#10b981'} stroke="#0f172a" strokeWidth="1.5" />
                <circle cx={tr.x2} cy={tr.y2} r="3.5"
                        fill={tr.color || '#10b981'} stroke="#0f172a" strokeWidth="1.5" />
                {hov && (
                  <text x={tr.x1+6} y={tr.y1-6}
                        fill={tr.color || '#10b981'} fontSize="9"
                        fontFamily="monospace" fontWeight="bold">
                    {tr.number} ({tr.name?.split(' ')[0]})
                  </text>
                )}
                <title>{tr.number} · {tr.name}</title>
              </g>
            );
          })}

        </svg>
      </div>

      {/* Selected task detail */}
      {selectedTask && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-cyan-400">{selectedTask.id}</span>
              <span className="font-bold text-white">[{selectedTask.department}] {selectedTask.description}</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Section: {selectedTask.section_name} | Block: {selectedTask.block_type} | Duration: {selectedTask.duration_mins} min
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">Scheduled window</div>
              <div className="font-mono font-bold text-white">
                {(() => {
                  const s = isOptimized
                    ? (selectedTask.optimized_start_mins ?? selectedTask.requested_start ?? 360)
                    : (selectedTask.requested_start ?? 360);
                  const e = s + (selectedTask.duration_mins || 60);
                  const fmt = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
                  return `${fmt(s)} – ${fmt(e)}`;
                })()}
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
