import React, { useState } from 'react';
import { Train, Zap, ShieldCheck, RefreshCw, UserCheck, Bot, Mic, MapPin, Sparkles, X, ChevronDown } from 'lucide-react';
import { useRailwayStore } from '../store/useRailwayStore';
import { railwayAudio } from '../utils/audioAlerts';
import { voiceAssistant } from '../utils/voiceAssistant';

const QUICK_COMMANDS = [
  { label: 'Run AI Optimizer', cmd: 'run optimizer' },
  { label: 'Show GIS Railway Map', cmd: 'show gis map' },
  { label: 'Show String Chart', cmd: 'show string chart' },
  { label: 'Show ML Risk Scorer', cmd: 'show risk scorer' },
  { label: 'Simulate Emergency at Tundla', cmd: 'simulate emergency' },
  { label: 'Switch to Mumbai Corridor', cmd: 'switch to mumbai' },
  { label: 'Switch to Howrah Corridor', cmd: 'switch to howrah' },
  { label: 'Show Pan-India Grid', cmd: 'show national grid' },
];

export default function Header({ isOptimized, onToggleOptimize, isSolving, activeRole, onRoleChange, isApiConnected, onOpenAssistant }) {
  const [isListening, setIsListening] = useState(false);
  const [micStatus, setMicStatus] = useState(null);
  const [showQuickCmds, setShowQuickCmds] = useState(false);

  const {
    activeCorridorKey, setCorridor,
    setActiveTab, injectEmergencyDefect, toggleOptimize,
  } = useRailwayStore();

  const executeCommand = (cmd) => {
    const q = cmd.toLowerCase();
    setShowQuickCmds(false);
    setMicStatus('done');

    if (q.includes('optimize') || q.includes('solve') || q.includes('run')) {
      voiceAssistant.speak('Running AI optimizer. Eliminating all corridor conflicts.');
      toggleOptimize();
    } else if (q.includes('emergency') || q.includes('fracture')) {
      voiceAssistant.speak('Emergency rail fracture simulated. Isolating Tundla section.');
      injectEmergencyDefect();
      setActiveTab('SIMULATION');
    } else if (q.includes('gis') || q.includes('map')) {
      voiceAssistant.speak('Switching to Geospatial GIS Railway map.');
      setActiveTab('GIS_MAP');
    } else if (q.includes('string') || q.includes('chart')) {
      voiceAssistant.speak('Opening Time-Distance String Chart.');
      setActiveTab('STRING_CHART');
    } else if (q.includes('risk') || q.includes('scorer') || q.includes('ml')) {
      voiceAssistant.speak('Opening AI Machine Learning Track Defect Predictor.');
      setActiveTab('ML_SCORER');
    } else if (q.includes('mumbai') || q.includes('western')) {
      voiceAssistant.speak('Loading Mumbai to Ahmedabad Western Railway corridor.');
      setCorridor('MMCT_ADI');
    } else if (q.includes('howrah') || q.includes('eastern')) {
      voiceAssistant.speak('Loading Howrah to Deen Dayal Upadhyaya Eastern corridor.');
      setCorridor('HWH_DDU');
    } else if (q.includes('national') || q.includes('india') || q.includes('grid')) {
      voiceAssistant.speak('Opening Pan-India Zonal Command Grid.');
      setActiveTab('NATIONAL');
    } else if (q.includes('gantt') || q.includes('timeline')) {
      voiceAssistant.speak('Displaying 24-hour master Gantt timeline.');
      setActiveTab('GANTT');
    } else {
      voiceAssistant.speak('Opening AI search assistant.');
      onOpenAssistant();
    }

    setTimeout(() => setMicStatus(null), 2500);
  };

  const handleMicClick = () => {
    if (isListening) {
      voiceAssistant.stop();
      setIsListening(false);
      setMicStatus(null);
      return;
    }

    setIsListening(true);
    setMicStatus('listening');

    voiceAssistant.listen(
      (transcript) => {
        setIsListening(false);
        executeCommand(transcript);
      },
      (errCode) => {
        setIsListening(false);
        if (errCode === 'UNSUPPORTED' || errCode === 'network') {
          setMicStatus(null);
          setShowQuickCmds(true);
        } else if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          setMicStatus('error');
          alert('Microphone blocked. Click the lock icon in your browser address bar and allow microphone access.');
          setTimeout(() => setMicStatus(null), 2000);
        } else if (errCode === 'no-speech') {
          setMicStatus(null);
        } else {
          setMicStatus(null);
          setShowQuickCmds(true);
        }
      }
    );
  };

  const handleOptimizeClick = () => {
    if (!isOptimized) railwayAudio.playSuccessChime();
    onToggleOptimize();
  };

  return (
    <header className="glass-card p-4 rounded-2xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 relative">

      {showQuickCmds && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl bg-slate-900/98 border border-emerald-500/40 shadow-2xl w-80 text-xs backdrop-blur-md">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Quick Commands
            </span>
            <button onClick={() => setShowQuickCmds(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Click to execute and hear AI voice response:</p>
          <div className="space-y-1.5">
            {QUICK_COMMANDS.map((c, i) => (
              <button
                key={i}
                onClick={() => executeCommand(c.cmd)}
                className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-emerald-600 hover:text-white text-slate-200 font-medium transition-all cursor-pointer flex items-center gap-2"
              >
                <Mic className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 shadow-lg shadow-amber-500/20">
          <Train className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Monocle <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">RailSync-AI</span>
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> CRIS-Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400">Ministry of Railways - Pan-India Automatic Block Planning</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">

        <div className="flex items-center gap-0">
          <button
            onClick={handleMicClick}
            className={'px-3 py-1.5 rounded-l-xl border-y border-l text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ' + (
              isListening ? 'bg-rose-600 text-white border-rose-500 animate-pulse' :
              micStatus === 'done' ? 'bg-emerald-600 text-white border-emerald-500' :
              'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-emerald-500/40'
            )}
            title="Click to speak a voice command"
          >
            <Mic className={'w-3.5 h-3.5 ' + (isListening ? 'animate-bounce text-white' : 'text-emerald-400')} />
            <span>{isListening ? 'Listening...' : micStatus === 'done' ? 'Got it!' : 'Voice Mic'}</span>
          </button>
          <button
            onClick={() => setShowQuickCmds(v => !v)}
            className="px-2 py-1.5 rounded-r-xl border text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border-slate-700/80 transition-all cursor-pointer"
            title="Show quick command presets"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <select value={activeCorridorKey} onChange={(e) => setCorridor(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-bold text-xs">
            <option value="NDLS_CNB">NDLS-CNB (NCR - 440 KM)</option>
            <option value="MMCT_ADI">MMCT-ADI (WR - 492 KM)</option>
            <option value="HWH_DDU">HWH-DDU (ER - 675 KM)</option>
            <option value="MAS_SBC">MAS-SBC (SR - 360 KM)</option>
          </select>
        </div>

        <button onClick={onOpenAssistant}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:border-emerald-500/40">
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <select value={activeRole} onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium text-xs">
            <option value="SECTION_CONTROLLER">Section Controller</option>
            <option value="TRACK_ENGINEER">Sr. DEN (Track)</option>
            <option value="TRACTION_CONTROLLER">TPC (Traction)</option>
            <option value="SIGNAL_INCHARGE">DSTE (Signal)</option>
          </select>
        </div>

        <button onClick={handleOptimizeClick} disabled={isSolving}
          className={'px-4 py-2 rounded-xl font-bold text-xs md:text-sm shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ' + (isOptimized ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 active:scale-95')}>
          {isSolving ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Solving...</span></>) :
           isOptimized ? (<><RefreshCw className="w-3.5 h-3.5 text-slate-400" /><span>Reset</span></>) :
           (<><Zap className="w-3.5 h-3.5 fill-current" /><span>Run AI Optimizer</span></>)}
        </button>

      </div>
    </header>
  );
}