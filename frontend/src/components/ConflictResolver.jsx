import React, { useState } from 'react';
import { ShieldCheck, Key, FileText } from 'lucide-react';

export default function ConflictResolver({ isOptimized }) {
  const [issuedPTW, setIssuedPTW] = useState({});

  const conflicts = [
    {
      id: 'CONF_01',
      task: 'TASK_001 (Deep screening of ballast)',
      dept: 'ENG',
      sec: 'SEC_101 (GZB-ALJN UP)',
      clash: 'Vande Bharat Express (Train 22436)',
      res: 'Shifted block to 01:00 AM - 04:00 AM lull window. Bundled with TRD OHE wire renewal.',
      status: 'RESOLVED_BY_AI'
    },
    {
      id: 'CONF_02',
      task: 'TASK_002 (OHE wire replacement)',
      dept: 'TRD',
      sec: 'SEC_101 (GZB-ALJN UP)',
      clash: 'Prayagraj Express (Train 12417)',
      res: 'Co-located with ENG Task 001 into unified Joint Power+Traffic Block.',
      status: 'RESOLVED_BY_AI'
    },
    {
      id: 'CONF_03',
      task: 'TASK_003 (Point machine overhaul)',
      dept: 'S&T',
      sec: 'SEC_103 (ALJN-TDL UP)',
      clash: 'Howrah Rajdhani Express (Train 12301)',
      res: 'Scheduled 02:15 AM - 03:45 AM during scheduled 3-hour freight loop diversion.',
      status: 'RESOLVED_BY_AI'
    }
  ];

  const handleIssuePTW = (id) => {
    const randomPrivateNo = Math.floor(1000 + Math.random() * 9000);
    setIssuedPTW(prev => ({ ...prev, [id]: randomPrivateNo }));
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Inter-Department Conflict Resolution & Digital Permit-to-Work (PTW)
          </h2>
          <p className="text-xs text-slate-400">Automated Conflict Rectification & Private Number Grant</p>
        </div>
      </div>

      <div className="space-y-3">
        {conflicts.map(c => {
          const isPermitIssued = issuedPTW[c.id];

          return (
            <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-400">{c.id}</span>
                  <span className="font-bold text-white">{c.task}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{c.sec}</span>
                </div>
                <div className="text-rose-400/90 text-[11px]">
                  ⚠️ Clashing: {c.clash}
                </div>
                <div className="text-emerald-400 text-[11px] font-medium">
                  ✓ AI Fix: {isOptimized ? c.res : 'Pending Optimization Engine Run'}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isPermitIssued ? (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> PTW #{isPermitIssued} (Granted)
                  </div>
                ) : (
                  <button
                    onClick={() => handleIssuePTW(c.id)}
                    disabled={!isOptimized}
                    className={'px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ' + (isOptimized ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed')}
                  >
                    <FileText className="w-3.5 h-3.5" /> Issue Digital PTW
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
