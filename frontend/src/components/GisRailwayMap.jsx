import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRailwayStore } from '../store/useRailwayStore';
import { MapPin, Zap, ShieldAlert, Train, Radio, Layers, Activity, Filter, Eye } from 'lucide-react';

// Custom Map View Changer on Corridor Switch
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function GisRailwayMap() {
  const [mapStyle, setMapStyle] = useState('DARK'); // 'DARK' | 'SATELLITE' | 'STREET'

  const {
    getCorridor,
    getSections,
    getTrains,
    getTasks,
    getSubstations,
    isOptimized,
    showTrains,
    showBlocks,
    showSubstations,
    toggleLayer,
  } = useRailwayStore();

  const corridor = getCorridor();
  const stations = corridor.stations;
  const sections = getSections();
  const trains = getTrains();
  const tasks = getTasks();
  const substations = getSubstations();

  // 100% Free, High-Res, ZERO Watermark Tiles (Esri ArcGIS Official Public CDN)
  const TILE_LAYERS = {
    DARK: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ | Indian Railways GIS',
      maxZoom: 16,
    },
    SATELLITE: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    },
    STREET: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors | CRIS Indian Railways',
      maxZoom: 19,
    }
  };

  // Custom Leaflet HTML Pin Icons
  const createStationIcon = (st) => L.divIcon({
    className: 'custom-station-icon',
    html: `<div style="background: ${st.hub ? '#10b981' : '#1e293b'}; color: ${st.hub ? '#022c22' : '#f8fafc'}; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; border: 1.5px solid ${st.hub ? '#34d399' : '#475569'}; box-shadow: 0 4px 12px rgba(0,0,0,0.6); font-family: monospace;">${st.code}</div>`,
    iconSize: [36, 20],
    iconAnchor: [18, 10],
  });

  const createTrainIcon = (tr) => L.divIcon({
    className: 'custom-train-icon',
    html: `<div style="background: ${tr.color || '#10b981'}; color: #022c22; font-size: 11px; font-weight: 900; padding: 3px 6px; border-radius: 9999px; border: 2px solid #ffffff; box-shadow: 0 0 16px ${tr.color || '#10b981'}; display: flex; align-items: center; gap: 3px; font-family: monospace;">🚆 ${tr.number}</div>`,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
  });

  const createSubstationIcon = (sub) => L.divIcon({
    className: 'custom-tss-icon',
    html: `<div style="background: #eab308; color: #422006; font-size: 9px; font-weight: 900; padding: 2px 5px; border-radius: 4px; border: 1px solid #fef08a; box-shadow: 0 0 10px rgba(234, 179, 8, 0.4); font-family: monospace;">⚡ ${sub.id}</div>`,
    iconSize: [60, 18],
    iconAnchor: [30, 9],
  });

  const trackLineCoords = stations.map(s => [s.lat, s.lng]);
  const activeTile = TILE_LAYERS[mapStyle];

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Geospatial GIS Railway Corridor Map — {corridor.name}
          </h2>
          <p className="text-xs text-slate-400">
            Real-Time GPS Track Topography, 25kV Traction Feeders, Active Possession Blocks & Moving Trains
          </p>
        </div>

        {/* Map Basemap & Layer Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Basemap Switcher */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700/80 text-[11px]">
            <button
              onClick={() => setMapStyle('DARK')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                mapStyle === 'DARK' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌌 Dark GIS (Esri)
            </button>
            <button
              onClick={() => setMapStyle('SATELLITE')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                mapStyle === 'SATELLITE' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapStyle('STREET')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                mapStyle === 'STREET' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ OpenStreet
            </button>
          </div>

          {/* Layer Toggles */}
          <button
            onClick={() => toggleLayer('showTrains')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showTrains ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            🚆 Trains {showTrains ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => toggleLayer('showBlocks')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showBlocks ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            🚧 Blocks {showBlocks ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => toggleLayer('showSubstations')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showSubstations ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            ⚡ 25kV TSS {showSubstations ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="w-full h-[480px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative z-10">
        <MapContainer
          key={mapStyle}
          center={corridor.mapCenter || [27.5, 78.8]}
          zoom={corridor.mapZoom || 7}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <ChangeMapView center={corridor.mapCenter} zoom={corridor.mapZoom} />

          {/* 100% Watermark-Free Official Tile Layer */}
          <TileLayer
            attribution={activeTile.attribution}
            url={activeTile.url}
            maxZoom={activeTile.maxZoom}
          />

          {/* Master Glowing Track Polyline */}
          <Polyline
            positions={trackLineCoords}
            color={isOptimized ? '#10b981' : '#f43f5e'}
            weight={6}
            opacity={0.9}
          />
          <Polyline
            positions={trackLineCoords}
            color="#ffffff"
            weight={2}
            dashArray="6 6"
            opacity={0.8}
          />

          {/* Station Markers */}
          {stations.map(st => (
            <Marker
              key={st.code}
              position={[st.lat, st.lng]}
              icon={createStationIcon(st)}
            >
              <Popup>
                <div className="text-xs space-y-1 p-1">
                  <div className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {st.name} ({st.code})
                  </div>
                  <div className="text-slate-300">KM Post: <span className="font-mono font-bold text-white">{st.km} KM</span></div>
                  <div className="text-slate-400">Interlocking: <span className="text-emerald-400 font-bold">Electronic Interlocking (EI)</span></div>
                  <div className="text-slate-400">Section Speed: <span className="text-white font-mono font-bold">130 km/h</span></div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Active Maintenance Blocks */}
          {showBlocks && tasks.map(task => {
            if (!task.lat || !task.lng) return null;

            let color = '#f97316';
            if (task.department === 'TRD') color = '#eab308';
            if (task.department === 'S&T') color = '#3b82f6';
            if (task.is_joint || (isOptimized && task.window_type === 'NIGHT_LULL_WINDOW')) color = '#a855f7';

            return (
              <CircleMarker
                key={task.id}
                center={[task.lat, task.lng]}
                radius={13}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.7,
                  color: '#ffffff',
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1.5 p-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{task.id} — [{task.department}]</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-400">Sev {task.severity}/5</span>
                    </div>
                    <div className="text-slate-300 text-[11px] font-medium">{task.description}</div>
                    <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-700">
                      Window: <span className="font-mono font-bold text-white">{isOptimized ? `${task.optimized_start_hhmm} - ${task.optimized_end_hhmm}` : '06:00 - 09:00'}</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Required: <span className="text-amber-400 font-bold">{task.machine_required || 'Standard Track Gang'}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* 25kV Traction Sub-Stations (TSS) */}
          {showSubstations && substations.map(sub => (
            <Marker
              key={sub.id}
              position={[sub.lat, sub.lng]}
              icon={createSubstationIcon(sub)}
            >
              <Popup>
                <div className="text-xs space-y-1 p-1">
                  <div className="font-bold text-yellow-400 text-sm flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> {sub.name}
                  </div>
                  <div className="text-slate-300">Voltage: <span className="font-mono font-bold text-white">25kV AC 50Hz</span></div>
                  <div className="text-slate-300">Transformer: <span className="font-mono font-bold text-yellow-400">{sub.capacity}</span></div>
                  <div className="text-slate-400">SCADA Remote: <span className="text-emerald-400 font-bold">ONLINE (FEEDER-1 LIVE)</span></div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Live Commercial Trains */}
          {showTrains && trains.map(tr => {
            if (!tr.lat || !tr.lng) return null;

            return (
              <Marker
                key={tr.number}
                position={[tr.lat, tr.lng]}
                icon={createTrainIcon(tr)}
              >
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <div className="font-bold text-white text-sm flex items-center gap-1">
                      <Train className="w-3.5 h-3.5 text-emerald-400" /> {tr.number} - {tr.name}
                    </div>
                    <div className="text-slate-300">Priority: <span className="font-mono font-bold text-emerald-400">Tier {tr.priority} (Strict No-Delay)</span></div>
                    <div className="text-slate-300">Speed: <span className="font-mono font-bold text-white">{tr.speedKmh} km/h</span></div>
                    <div className="text-slate-400">Status: <span className="text-emerald-400 font-bold">✓ 100% Conflict-Free Track</span></div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend & Telemetry Footer */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-800/80">
        <div className="p-2.5 bg-slate-900/60 rounded-xl flex items-center gap-2 border border-slate-800">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <div>
            <div className="text-slate-400 text-[10px]">Track Clearance</div>
            <div className="font-bold text-white">{isOptimized ? '0 Speed Restrictions' : '2 Speed Restrictions'}</div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded-xl flex items-center gap-2 border border-slate-800">
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <div>
            <div className="text-slate-400 text-[10px]">Active Track Work</div>
            <div className="font-bold text-white">BCM Screening (Km 105)</div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded-xl flex items-center gap-2 border border-slate-800">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div>
            <div className="text-slate-400 text-[10px]">25kV OHE Substations</div>
            <div className="font-bold text-white">{substations.length} TSS Operational</div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded-xl flex items-center gap-2 border border-slate-800">
          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
          <div>
            <div className="text-slate-400 text-[10px]">Joint Possession Blocks</div>
            <div className="font-bold text-white">{isOptimized ? 'Synchronized (01:00 AM)' : 'Uncoordinated Demands'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}