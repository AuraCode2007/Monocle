import React, { useState } from 'react';
import { Train, Zap, ShieldCheck, Activity, RefreshCw, UserCheck, Bot, Mic, MicOff, MapPin, Sparkles, X } from 'lucide-react';
import { useRailwayStore, CORRIDORS } from '../store/useRailwayStore';
import { railwayAudio } from '../utils/audioAlerts';
import { voiceAssistant } from '../utils/voiceAssistant';

export default function Header({ isOptimized, onToggleOptimize, isSolving, activeRole, onRoleChange, isApiConnected, onOpenAssistant }) {
  const [isListening, setIsListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState(null);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  const {
    activeCorridorKey,
    setCorridor,
    getCorridor,
    setActiveTab,
    injectEmergencyDefect,
    toggleOptimize,
  } = useRailwayStore();

  const currentCorridor = getCorridor();

  const executeVoiceCommand = (transcript) => {
    const q = transcript.toLowerCase();
    setVoiceToast(`Command: "${transcript}"`);
    setShowVoiceMenu(false);

    if (q.includes('optimize') || q.includes('solve') || q.includes('run')) {
      voiceAssistant.speak('Running Google OR-Tools constraint solver. Eliminating all conflicts.');
      toggleOptimize();
      setTimeout(() => setVoiceToast(null), 3500);
    } else if (q.includes('emergency') || q.includes('fracture') || q.includes('fail')) {
      voiceAssistant.speak('Critical rail fracture simulated at Tundla. Initiating emergency isolation.');
      injectEmergencyDefect();
      setActiveTab('SIMULATION');
      setTimeout(() => setVoiceToast(null), 3500);
    } else if (q.includes('map') || q.includes('gis')) {
      voiceAssistant.speak('Switching to Geospatial GIS Railway map.');
      setActiveTab('GIS_MAP');
      setTimeout(() => setVoiceToast(null), 3000);
    } else if (q.includes('string') || q.includes('trajectory')) {
      voiceAssistant.speak('Opening Time-Distance String Chart.');
      setActiveTab('STRING_CHART');
      setTimeout(() => setVoiceToast(null), 3000);
    } else if (q.includes('gantt') || q.includes('timeline')) {
      voiceAssistant.speak('Displaying 24-hour master Gantt timeline.');
      setActiveTab('GANTT');
      setTimeout(() => setVoiceToast(null), 3000);
    } else if (q.includes('mumbai') || q.includes('western')) {
      voiceAssistant.speak('Loading Mumbai to Ahmedabad high-speed corridor.');
      setCorridor('MMCT_ADI');
      setTimeout(() => setVoiceToast(null), 3000);
    } else if (q.includes('howrah') || q.includes('eastern')) {
      voiceAssistant.speak('Loading Howrah to Pt Deen Dayal Upadhyaya Grand Chord corridor.');
      setCorridor('HWH_DDU');
      setTimeout(() => setVoiceToast(null), 3000);
    } else if (q.includes('risk') || q.includes('health') || q.includes('ml')) {
      voiceAssistant.speak('Opening AI Machine Learning Track Defect Predictor.');
      setActiveTab('ML_SCORER');
      setTimeout(() => setVoiceToast(null), 3000);
    } else {
      voiceAssistant.speak(`Executing search for ${transcript}`);
      onOpenAssistant();
      setTimeout(() => setVoiceToast(null), 3000);
    }
  };

  const handleVoiceCommand = () => {
    if (isListening) {
      voiceAssistant.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceToast('Listening... Speak now into your mic');

    voiceAssistant.listen(
      (transcript) => {
        setIsListening(false);
        executeVoiceCommand(transcript);
      },
      (err) => {
        setIsListening(false);
        setVoiceToast(err);
        setShowVoiceMenu(true); // Open quick voice menu fallback so user is never blocked!
        setTimeout(() => setVoiceToast(null), 5000);
      }
    );
  };

  const handleOptimizeClick = () => {
    if (!isOptimized) {
      railwayAudio.playSuccessChime();
    }
    onToggleOptimize();
  };

  return (
    <header className="glass-card p-4 rounded-2xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 relative">
      {/* Voice Status Toast */}
      {voiceToast && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <Activity className="w-3.5 h-3.5 animate-spin" /> {voiceToast}
        </div>
      )}

      {/* Voice Fallback Preset Menu */}
      {showVoiceMenu && (
        <div className="absolute top-16 right-4 z-50 p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl w-80 text-xs animate-fadeIn backdrop-blur-md">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2 font-bold text-white">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-4 h-4" /> Click to Speak Command
            </span>
            <button onClick={() => setShowVoiceMenu(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Click any command below to execute & hear AI voice response:
          </p>
          <div className="space-y-1.5">
            {[
              'Run AI optimizer',
              'Simulate emergency at Tundla',
              'Show Geospatial GIS map',
              'Show Time-Distance String Chart',
              'Show ML Derailment Risk Scorer',
              'Switch to Mumbai corridor',
            ].map((cmd, i) => (
              <button
                key={i}
                onClick={() => executeVoiceCommand(cmd)}
                className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-medium transition-all cursor-pointer flex items-center justify-between"
              >
                <span>🎙️ "{cmd}"</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 flex items-center justify-center">
          <Train className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Monocle <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">RailSync-AI</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> CRIS-Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ministry of Railways - Pan-India Automatic Block Planning & Asset Availability Maximizer
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
        {/* Voice Command Mic Button */}
        <button
          onClick={handleVoiceCommand}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            isListening
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-rose-600/40'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-emerald-500/40'
          }`}
          title="Click to speak (or click preset commands)"
        >
          {isListening ? <Mic className="w-3.5 h-3.5 animate-bounce" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isListening ? 'Listening...' : 'Voice Mic'}</span>
        </button>

        {/* Pan-India Corridor Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={activeCorridorKey}
            onChange={(e) => setCorridor(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-bold text-xs"
          >
            <option value="NDLS_CNB">NDLS-CNB (NCR - 440 KM)</option>
            <option value="MMCT_ADI">MMCT-ADI (WR - 492 KM)</option>
            <option value="HWH_DDU">HWH-DDU (ER - 675 KM)</option>
            <option value="MAS_SBC">MAS-SBC (SR - 360 KM)</option>
          </select>
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAssistant}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-emerald-500/40"
          title="Open AI Assistant (Ctrl + K)"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Role Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <select 
            value={activeRole} 
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium text-xs"
          >
            <option value="SECTION_CONTROLLER">Section Controller</option>
            <option value="TRACK_ENGINEER">Sr. DEN (Track)</option>
            <option value="TRACTION_CONTROLLER">TPC (Traction)</option>
            <option value="SIGNAL_INCHARGE">DSTE (Signal)</option>
          </select>
        </div>

        {/* Optimize CTA Button */}
        <button
          onClick={handleOptimizeClick}
          disabled={isSolving}
          className={'px-4 py-2 rounded-xl font-bold text-xs md:text-sm shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ' + (isOptimized ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 active:scale-95')}
        >
          {isSolving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Solving...</span>
            </>
          ) : isOptimized ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Run AI Optimizer</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}