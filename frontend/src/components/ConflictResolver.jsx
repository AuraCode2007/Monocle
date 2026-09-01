import React, { useState } from 'react';
import { useRailwayStore } from '../store/useRailwayStore';
import { ShieldCheck, Key, FileText, Download, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function ConflictResolver() {
  const { isOptimized, tasks, issuedPTW, issuePTW, activeRole } = useRailwayStore();

  const conflicts = [
    {
      id: 'CONF_01',
      task: 'TASK_001 (Deep screening of ballast by BCM)',
      dept: 'ENG',
      sec: 'SEC_101 (GZB-ALJN UP)',
      clash: 'Vande Bharat Express (Train 22436)',
      res: 'Shifted block to 01:00 AM - 04:00 AM lull window. Bundled with TRD OHE wire renewal.',
      status: 'RESOLVED_BY_AI'
    },
    {
      id: 'CONF_02',
      task: 'TASK_002 (OHE wire replacement 25kV)',
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

  const handleDownloadMemo = (c) => {
    const doc = new jsPDF();
    const ptw = issuedPTW[c.id] || { privateNo: 4821, timestamp: '01:00 AM', authorizedBy: activeRole };

    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    doc.text('INDIAN RAILWAYS - FORM T/348M', 20, 20);
    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    doc.text('MEMO FOR DISCONNECTION / TRAFFIC & POWER BLOCK MEMO', 20, 28);
    doc.line(20, 32, 190, 32);

    doc.text(`DIVISION: Prayagraj (NCR) | CORRIDOR: NDLS - CNB`, 20, 42);
    doc.text(`SECTION CODE: ${c.sec}`, 20, 50);
    doc.text(`DEPARTMENT: ${c.dept} | BLOCK TYPE: CO-LOCATED JOINT BLOCK`, 20, 58);
    doc.text(`TASK DESCRIPTION: ${c.task}`, 20, 66);
    doc.text(`SAFETY CLEARANCE: 100% CONFLICT-FREE (CRIS AI VERIFIED)`, 20, 74);
    doc.line(20, 80, 190, 80);

    doc.setFont('courier', 'bold');
    doc.text(`PRIVATE NUMBER (SAFETY HANDSHAKE): ${ptw.privateNo}`, 20, 92);
    doc.text(`ISSUED AT: ${ptw.timestamp} | AUTHORIZING OFFICER: ${ptw.authorizedBy}`, 20, 100);
    doc.text(`STATUS: OFFICIALLY SANCTIONED - SAFE TO WORK`, 20, 108);

    doc.save(`IR_Form_T348M_${c.id}.pdf`);
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Inter-Department Conflict Resolution & Digital Permit-to-Work (Form T/348M)
          </h2>
          <p className="text-xs text-slate-400">
            Automated Conflict Rectification, Cryptographic Private Number Grant & Official IR Form Export
          </p>
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
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> PTW #{isPermitIssued.privateNo}
                    </div>
                    <button
                      onClick={() => handleDownloadMemo(c)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Download Official IR Form T/348M"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Export PDF
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => issuePTW(c.id)}
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