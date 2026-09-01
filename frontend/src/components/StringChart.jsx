import React, { useState } from 'react';
import { useRailwayStore } from '../store/useRailwayStore';
import { Compass } from 'lucide-react';

export default function StringChart() {
  const { isOptimized, getCorridor, getTrains, getTasks } = useRailwayStore();
  const [hoveredTrain, setHoveredTrain] = useState(null);

  const corridor = getCorridor();
  const trains = getTrains();
  const tasks = getTasks();
  const stations = corridor.stations;
  const maxKm = corridor.distance_km;

  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 460;
  const PADDING = { left: 70, right: 30, top: 40, bottom: 40 };

  const plotW = SVG_WIDTH - PADDING.left - PADDING.right;
  const plotH = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  const timeToX = (min) => PADDING.left + (min / 1440) * plotW;
  const kmToY = (km) => PADDING.top + (km / maxKm) * plotH;

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Time-Distance String Chart — {corridor.name}
          </h2>
          <p className="text-xs text-slate-400">
            MARECHAL Train Trajectories (Diagonal Lines) vs Track Maintenance Closures (Shaded Boxes)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
            {isOptimized ? '✓ 0 Train-Block Intersections' : '⚠️ Clashes on Manual Paths'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="bg-slate-950/80 rounded-xl border border-slate-800/80">
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

          {stations.map((st) => (
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

          {tasks.map((task) => {
            const startM = isOptimized ? task.optimized_start_mins : task.requested_start;
            const endM = isOptimized ? task.optimized_end_mins : task.requested_end;
            const x = timeToX(startM);
            const w = Math.max(12, timeToX(endM) - x);

            const y1 = kmToY(maxKm * 0.15);
            const y2 = kmToY(maxKm * 0.45);

            let fill = 'rgba(249, 115, 22, 0.25)';
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
                  y={y1}
                  width={w}
                  height={y2 - y1}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1.5"
                  rx="4"
                />
                <text
                  x={x + 4}
                  y={y1 + 14}
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
    </div>
  );
}