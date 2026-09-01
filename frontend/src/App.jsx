import React, { useState } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import GanttView from './components/GanttView';
import StringChart from './components/StringChart';
import GisRailwayMap from './components/GisRailwayMap';
import ConflictResolver from './components/ConflictResolver';
import SimulationSandbox from './components/SimulationSandbox';
import RollingCalendar from './components/RollingCalendar';
import NationalGrid from './components/NationalGrid';
import AiAssistantModal from './components/AiAssistantModal';
import { useRailwayStore } from './store/useRailwayStore';
import { Calendar, MapPin, ShieldAlert, Compass, Zap, CalendarDays, Globe, Radio } from 'lucide-react';

export default function App() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const {
    isOptimized,
    isSolving,
    activeRole,
    activeTab,
    isApiConnected,
    toggleOptimize,
    setActiveRole,
    setActiveTab,
  } = useRailwayStore();

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto flex flex-col font-sans">
      <Header
        isOptimized={isOptimized}
        onToggleOptimize={toggleOptimize}
        isSolving={isSolving}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        isApiConnected={isApiConnected}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      <MetricCards isOptimized={isOptimized} />

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('GIS_MAP')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'GIS_MAP' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200')}
        >
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> 🗺️ Geospatial GIS Map
        </button>
        <button
          onClick={() => setActiveTab('GANTT')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'GANTT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200')}
        >
          <Calendar className="w-4 h-4" /> 24-Hr Gantt Timeline
        </button>
        <button
          onClick={() => setActiveTab('STRING_CHART')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'STRING_CHART' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'text-slate-400 hover:text-slate-200')}
        >
          <Compass className="w-4 h-4 text-cyan-400" /> Time-Distance String Chart
        </button>
        <button
          onClick={() => setActiveTab('NATIONAL')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'NATIONAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200')}
        >
          <Globe className="w-4 h-4 text-emerald-400" /> 🇮🇳 Pan-India Zonal Grid
        </button>
        <button
          onClick={() => setActiveTab('SIMULATION')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'SIMULATION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <Zap className="w-4 h-4 text-amber-400" /> What-If Simulator
        </button>
        <button
          onClick={() => setActiveTab('PTW')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'PTW' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <ShieldAlert className="w-4 h-4" /> Conflict & PTW (PDF)
        </button>
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'CALENDAR' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <CalendarDays className="w-4 h-4 text-purple-400" /> 26-Week Horizon
        </button>
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === 'GIS_MAP' && <GisRailwayMap />}
      {activeTab === 'GANTT' && <GanttView />}
      {activeTab === 'STRING_CHART' && <StringChart />}
      {activeTab === 'NATIONAL' && <NationalGrid />}
      {activeTab === 'SIMULATION' && <SimulationSandbox />}
      {activeTab === 'PTW' && <ConflictResolver />}
      {activeTab === 'CALENDAR' && <RollingCalendar />}

      {/* AI Command Palette */}
      <AiAssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />

      <footer className="mt-auto pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>Monocle Engine © Smart India Hackathon 2026</span>
        <span>Dedicated to Ministry of Railways (Government of India)</span>
      </footer>
    </div>
  );
}