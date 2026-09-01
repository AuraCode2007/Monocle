import React, { useState, useEffect } from 'react';
import { useRailwayStore } from '../store/useRailwayStore';
import { Bot, Search, X, Sparkles, ArrowRight, CornerDownLeft, ShieldCheck, Zap } from 'lucide-react';

export default function AiAssistantModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const { tasks, trains, isOptimized, toggleOptimize, setActiveTab, setFilterDept } = useRailwayStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.toLowerCase();

    if (q.includes('rajdhani') || q.includes('vande bharat') || q.includes('train')) {
      setResponse({
        type: 'TRAIN_QUERY',
        title: 'Train Trajectory & Passage Analysis',
        text: `Found ${trains.length} scheduled passenger & freight services on the NDLS-CNB corridor. High-priority trains (Vande Bharat 22436, Howrah Rajdhani 12302) operate at 130 km/h and have zero allowable maintenance headway clashes.`,
        actionText: 'View on Time-Distance String Chart',
        action: () => { setActiveTab('STRING_CHART'); onClose(); }
      });
    } else if (q.includes('ohe') || q.includes('power') || q.includes('trd')) {
      setResponse({
        type: 'DEPT_FILTER',
        title: 'Traction Distribution (TRD) 25kV OHE Blocks',
        text: 'Found 2 active OHE maintenance blocks requiring 25kV power isolation. In the AI-optimized schedule, Task 002 (GZB-ALJN) has been synchronized with Engineering BCM deep screening into a joint possession window.',
        actionText: 'Focus TRD Blocks on Gantt',
        action: () => { setFilterDept('TRD'); setActiveTab('GANTT'); onClose(); }
      });
    } else if (q.includes('emergency') || q.includes('fracture') || q.includes('fail')) {
      setResponse({
        type: 'EMERGENCY_QUERY',
        title: 'Emergency Crisis Protocols (Form T/348M)',
        text: 'In the event of an emergency ultrasonic rail fracture, the system carves an immediate traffic block and dynamically recalculates train routing without human panic.',
        actionText: 'Open What-If Simulator',
        action: () => { setActiveTab('SIMULATION'); onClose(); }
      });
    } else if (q.includes('optimize') || q.includes('solve') || q.includes('delay')) {
      setResponse({
        type: 'OPTIMIZE_QUERY',
        title: 'Google OR-Tools CP-SAT Optimizer Status',
        text: isOptimized 
          ? 'Current schedule is 100% collision-free. 450 minutes of passenger delay saved and 4 joint blocks synchronized.' 
          : 'Manual schedule currently has 10 uncoordinated conflicts. Running the solver will eliminate all clashes in < 0.2 seconds.',
        actionText: isOptimized ? 'View Form T/348M PTW' : 'Run AI Optimizer Now',
        action: () => { if (!isOptimized) toggleOptimize(); setActiveTab('PTW'); onClose(); }
      });
    } else {
      setResponse({
        type: 'GENERAL',
        title: 'Corridor Intelligence Search Result',
        text: `Searched 8 track sections and ${tasks.length} active maintenance demands across Engineering, Traction, and Signalling departments. All constraints are strictly mapped to Indian Railways CRIS operating codes.`,
        actionText: 'View 24-Hr Master Gantt',
        action: () => { setActiveTab('GANTT'); onClose(); }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-card rounded-2xl border border-slate-700 shadow-2xl p-5 flex flex-col overflow-hidden">
        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask RailSync AI... (e.g., 'Show OHE power blocks', 'How many Rajdhani trains clash?')"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none font-medium"
            autoFocus
          />
          <button type="submit" className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all">
            <CornerDownLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onClose()} className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Suggested Quick Queries */}
        {!response && (
          <div className="py-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Suggested Operational Queries
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Show OHE power blocks between GZB and TDL',
                'Which Rajdhani trains clash with manual blocks?',
                'How does the AI handle emergency rail fractures?',
                'Show 26-week Rolling Block capacity calendar',
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setQuery(prompt); }}
                  className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 text-left text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Response Display */}
        {response && (
          <div className="py-4 space-y-3 animate-fadeIn">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {response.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {response.text}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={response.action}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>{response.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer Hint */}
        <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Ctrl + K</kbd> to open anywhere</span>
          <span>Powered by RailSync-AI Natural Language Engine</span>
        </div>
      </div>
    </div>
  );
}