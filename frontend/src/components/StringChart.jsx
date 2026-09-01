import React, { useState } from 'react';
import { useRailwayStore } from '../store/useRailwayStore';
import { Compass, Info, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export default function StringChart() {
  const { trains, tasks, isOptimized, sections } = useRailwayStore();
  const [hoveredTrain, setHoveredTrain] = useState(null);

  const STATIONS_KM = [
    { code: 'NDLS', name: 'New Delhi', km: 0 },
    { code: 'GZB', name: 'Ghaziabad', km: 26 },
    { code: 'ALJN', name: 'Aligarh Jn', km: 131 },
    { code: 'TDL', name: 'Tundla Jn', km: 209 },
    { code: 'ETW', name: 'Etawah Jn', km: 301 },
    { code: 'CNB', name: 'Kanpur Central', km: 440 },
  ];

  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 460;
  const PADDING = { left: 70, right: 30, top: 40, bottom: 40 };

  const plotW = SVG_WIDTH - PADDING.left - PADDING.right;
  const plotH = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  const timeToX = (min) => PADDING.left + (min / 1440) * plotW;
  const kmToY = (km) => PADDING.top + (km / 440) * plotH;

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Time-Distance String Chart (Train Trajectories vs. Maintenance Blocks)
          </h2>
          <p className="text-xs text-slate-400">
            Indian Railways Standard MARECHAL Diagram: Slanted lines are trains; shaded boxes are track maintenance windows.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
            {isOptimized ? '✓ 0 Train-Block Intersections' : '⚠️ Clashes Detected on Manual Paths'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="bg-slate-950/80 rounded-xl border border-slate-800/80">
          {/* Grid lines: Time axis (Every 4 hours) */}
          {[0, 240, 480, 720, 960, 1200, 1440].map((t) => (
            <g key={t}>
              <line
                x1={timeToX(t)}
                y1={PADDING.top}
                x2={timeToX(t)}
                y2={SVG_HEIGHT - PADDING.bottom}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <text
                x={timeToX(t)}
                y={SVG_HEIGHT - PADDING.bottom + 18}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {Math.floor(t / 60).toString().padStart(2, '0')}:00
              </text>
            </g>
          ))}

          {/* Grid lines: Distance / Station axis */}
          {STATIONS_KM.map((st) => (
            <g key={st.code}>
              <line
                x1={PADDING.left}
                y1={kmToY(st.km)}
                x2={SVG_WIDTH - PADDING.right}
                y2={kmToY(st.km)}
                stroke="#1e293b"
              />
              <text
                x={PADDING.left - 8}
                y={kmToY(st.km) + 4}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {st.code}
              </text>
            </g>
          ))}

          {/* Render Shaded Maintenance Block Boxes */}
          {tasks.map((task) => {
            const startM = isOptimized ? task.optimized_start_mins : task.requested_start;
            const endM = isOptimized ? task.optimized_end_mins : task.requested_end;
            const x = timeToX(startM);
            const w = Math.max(12, timeToX(endM) - x);

            // Approximate section km range
            let y1 = kmToY(26);
            let y2 = kmToY(131);
            if (task.section_id.includes('103') || task.section_id.includes('104')) {
              y1 = kmToY(131); y2 = kmToY(209);
            } else if (task.section_id.includes('105') || task.section_id.includes('106')) {
              y1 = kmToY(209); y2 = kmToY(301);
            } else if (task.section_id.includes('107') || task.section_id.includes('108')) {
              y1 = kmToY(301); y2 = kmToY(440);
            }

            let fill = 'rgba(249, 115, 22, 0.25)'; // ENG
            let stroke = '#f97316';
            if (task.department === 'TRD') { fill = 'rgba(234, 179, 8, 0.25)'; stroke = '#eab308'; }
            if (task.department === 'S&T') { fill = 'rgba(59, 130, 246, 0.25)'; stroke = '#3b82f6'; }
            if (task.is_joint || (isOptimized && task.window_type === 'NIGHT_LULL_WINDOW')) {
              fill = 'rgba(168, 85, 247, 0.25)'; stroke = '#a855f7';
            }

            return (
              <g key={task.id}>
                <rect
                  x={x}
                  y={Math.min(y1, y2)}
                  width={w}
                  height={Math.abs(y2 - y1)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1.5"
                  rx="4"
                />
                <text
                  x={x + 4}
                  y={Math.min(y1, y2) + 14}
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {task.department} [{task.block_type}]
                </text>
              </g>
            );
          })}

          {/* Render Train Trajectory String Lines */}
          {trains.map((tr) => {
            const x1 = timeToX(tr.startMin);
            const y1 = kmToY(tr.startKm);
            const x2 = timeToX(tr.endMin);
            const y2 = kmToY(tr.endKm);

            const isHovered = hoveredTrain === tr.number;

            return (
              <g
                key={tr.number}
                onMouseEnter={() => setHoveredTrain(tr.number)}
                onMouseLeave={() => setHoveredTrain(null)}
                className="cursor-pointer"
              >
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={tr.color || '#10b981'}
                  strokeWidth={isHovered ? '3.5' : '2'}
                  opacity={hoveredTrain && !isHovered ? 0.4 : 0.9}
                />
                <circle cx={x1} cy={y1} r="3" fill={tr.color || '#10b981'} />
                <circle cx={x2} cy={y2} r="3" fill={tr.color || '#10b981'} />
                <text
                  x={x1 + 6}
                  y={y1 - 4}
                  fill={tr.color || '#10b981'}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {tr.number} ({tr.name.split(' ')[0]})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50">
        <span>Hover over train lines to highlight paths. Shaded boxes represent track possessions.</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Vande Bharat (130 km/h)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Rajdhani (120 km/h)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span> Joint Synced Block</span>
        </div>
      </div>
    </div>
  );
}