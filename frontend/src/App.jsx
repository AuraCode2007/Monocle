import React, { useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import GanttView from './components/GanttView';
import StringChart from './components/StringChart';
import CorridorMap from './components/CorridorMap';
import ConflictResolver from './components/ConflictResolver';
import SimulationSandbox from './components/SimulationSandbox';
import RollingCalendar from './components/RollingCalendar';
import { useRailwayStore } from './store/useRailwayStore';
import { Calendar, MapPin, ShieldAlert, Compass, Zap, CalendarDays } from 'lucide-react';

export default function App() {
  const {
    isOptimized,
    isSolving,
    activeRole,
    activeTab,
    isApiConnected,
    tasks,
    toggleOptimize,
    setActiveRole,
    setActiveTab,
    setIsApiConnected,
  } = useRailwayStore();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/corridor')
      .then(res => res.json())
      .then(data => {
        if (data && data.tasks) {
          setIsApiConnected(true);
        }
      })
      .catch(() => {
        setIsApiConnected(false);
      });
  }, [setIsApiConnected]);

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto flex flex-col font-sans">
      <Header
        isOptimized={isOptimized}
        onToggleOptimize={toggleOptimize}
        isSolving={isSolving}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        isApiConnected={isApiConnected}
      />

      <MetricCards isOptimized={isOptimized} />

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
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
          onClick={() => setActiveTab('MAP')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'MAP' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <MapPin className="w-4 h-4" /> Corridor Schematic Map
        </button>
        <button
          onClick={() => setActiveTab('SIMULATION')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'SIMULATION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <Zap className="w-4 h-4 text-amber-400" /> What-If Emergency Simulator
        </button>
        <button
          onClick={() => setActiveTab('PTW')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'PTW' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <ShieldAlert className="w-4 h-4" /> Conflict Resolution & PTW
        </button>
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'CALENDAR' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <CalendarDays className="w-4 h-4 text-purple-400" /> 26-Week Rolling Horizon
        </button>
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === 'GANTT' && <GanttView isOptimized={isOptimized} tasks={tasks} />}
      {activeTab === 'STRING_CHART' && <StringChart />}
      {activeTab === 'MAP' && <CorridorMap isOptimized={isOptimized} />}
      {activeTab === 'SIMULATION' && <SimulationSandbox />}
      {activeTab === 'PTW' && <ConflictResolver />}
      {activeTab === 'CALENDAR' && <RollingCalendar />}

      <footer className="mt-auto pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>RailSync-AI Engine © Smart India Hackathon 2026</span>
        <span>Ministry of Railways (Government of India)</span>
      </footer>
    </div>
  );
}