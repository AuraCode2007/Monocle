import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import GanttView from './components/GanttView';
import CorridorMap from './components/CorridorMap';
import ConflictResolver from './components/ConflictResolver';
import { Calendar, MapPin, ShieldAlert } from 'lucide-react';

export default function App() {
  const [isOptimized, setIsOptimized] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [activeRole, setActiveRole] = useState('SECTION_CONTROLLER');
  const [activeTab, setActiveTab] = useState('GANTT');
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const sampleTasks = [
    { id: 'TASK_001', department: 'ENG', section_id: 'SEC_101', section_name: 'GZB - ALJN (UP)', description: 'Deep screening of ballast by BCM', block_type: 'TRAFFIC', duration_mins: 180, severity: 5, requested_start: 360, optimized_start_mins: 60, optimized_start_hhmm: '01:00', optimized_end_hhmm: '04:00' },
    { id: 'TASK_002', department: 'TRD', section_id: 'SEC_101', section_name: 'GZB - ALJN (UP)', description: 'OHE contact wire wear replacement', block_type: 'POWER', duration_mins: 150, severity: 4, requested_start: 480, optimized_start_mins: 60, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:30', is_joint: true },
    { id: 'TASK_003', department: 'S&T', section_id: 'SEC_103', section_name: 'ALJN - TDL (UP)', description: 'Point machine overhaul & testing', block_type: 'DISCONNECTION', duration_mins: 90, severity: 4, requested_start: 600, optimized_start_mins: 135, optimized_start_hhmm: '02:15', optimized_end_hhmm: '03:45' },
    { id: 'TASK_004', department: 'ENG', section_id: 'SEC_105', section_name: 'TDL - ETW (UP)', description: 'Turnout rail renewal & tamping', block_type: 'TRAFFIC', duration_mins: 120, severity: 3, requested_start: 840, optimized_start_mins: 30, optimized_start_hhmm: '00:30', optimized_end_hhmm: '02:30' },
    { id: 'TASK_005', department: 'TRD', section_id: 'SEC_107', section_name: 'ETW - CNB (UP)', description: 'Cantilever assembly overhaul', block_type: 'POWER', duration_mins: 120, severity: 3, requested_start: 960, optimized_start_mins: 180, optimized_start_hhmm: '03:00', optimized_end_hhmm: '05:00' },
    { id: 'TASK_006', department: 'S&T', section_id: 'SEC_102', section_name: 'ALJN - GZB (DN)', description: 'Digital Axle Counter (DAC) card replacement', block_type: 'DISCONNECTION', duration_mins: 60, severity: 2, requested_start: 720, optimized_start_mins: 90, optimized_start_hhmm: '01:30', optimized_end_hhmm: '02:30' },
  ];

  useEffect(() => {
    setTasks(sampleTasks);
    fetch('http://127.0.0.1:8000/api/v1/corridor')
      .then(res => res.json())
      .then(data => {
        if (data && data.tasks) {
          setTasks(data.tasks);
          setIsApiConnected(true);
        }
      })
      .catch(() => {
        setIsApiConnected(false);
      });
  }, []);

  const handleToggleOptimize = async () => {
    if (isOptimized) {
      setIsOptimized(false);
      return;
    }

    setIsSolving(true);

    if (isApiConnected) {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/optimize', { method: 'POST' });
        const result = await res.json();
        if (result && result.optimized_results) {
          setTasks(result.optimized_results.scheduled_tasks);
          setMetrics(result.optimized_results);
        }
      } catch (err) {
        console.warn('API error, using client solver simulation', err);
      }
    } else {
      await new Promise(r => setTimeout(r, 700));
    }

    setIsSolving(false);
    setIsOptimized(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto flex flex-col font-sans">
      <Header
        isOptimized={isOptimized}
        onToggleOptimize={handleToggleOptimize}
        isSolving={isSolving}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        isApiConnected={isApiConnected}
      />

      <MetricCards isOptimized={isOptimized} metrics={metrics} />

      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('GANTT')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'GANTT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <Calendar className="w-4 h-4" /> 24-Hour Gantt Timeline
        </button>
        <button
          onClick={() => setActiveTab('MAP')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'MAP' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <MapPin className="w-4 h-4" /> Corridor Schematic Map
        </button>
        <button
          onClick={() => setActiveTab('CONFLICTS')}
          className={'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ' + (activeTab === 'CONFLICTS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200')}
        >
          <ShieldAlert className="w-4 h-4" /> Conflict Resolution & PTW
        </button>
      </div>

      {activeTab === 'GANTT' && <GanttView isOptimized={isOptimized} tasks={tasks} />}
      {activeTab === 'MAP' && <CorridorMap isOptimized={isOptimized} />}
      {activeTab === 'CONFLICTS' && <ConflictResolver isOptimized={isOptimized} />}

      <footer className="mt-auto pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>RailSync-AI Engine © Smart India Hackathon 2026</span>
        <span>Dedicated to Ministry of Railways (Government of India)</span>
      </footer>
    </div>
  );
}
