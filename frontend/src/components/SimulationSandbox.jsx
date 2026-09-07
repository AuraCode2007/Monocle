import React from 'react';
import { useRailwayStore } from '../store/useRailwayStore';
import { Flame, RefreshCw, AlertTriangle, ShieldCheck, Zap, Activity, Download, Route, FileCheck2 } from 'lucide-react';
import { canApprovePTW, canIssuePTW, ROLE_LABELS } from '../auth';
import { useLanguage } from '../i18n';
import jsPDF from 'jspdf';

export default function SimulationSandbox() {
  const { t } = useLanguage();
  const ui = t.ui;
  const {
    emergencyActive,
    currentIncident,
    emergencyResponse,
    emergencySolving,
    emergencyApproval,
    issuedPTW,
    authorizedRole,
    injectEmergencyDefect,
    runEmergencyResponse,
    approveEmergencyResponse,
    issuePTW,
    resetEmergency,
  } = useRailwayStore();
  const incidentPTW = currentIncident ? issuedPTW[currentIncident.incident_id] : null;
  const mayApprove = canApprovePTW(authorizedRole);
  const mayIssue = canIssuePTW(authorizedRole);

  const downloadIncidentReport = () => {
    if (!currentIncident || !emergencyResponse || !emergencyApproval) return;
    const doc = new jsPDF();
    const reportLines = [
      'RAILSYNC-AI - SIGNED EMERGENCY RESPONSE REPORT',
      `INCIDENT: ${currentIncident.incident_id}`,
      `TYPE: ${currentIncident.title}`,
      `LOCATION: KM ${currentIncident.affected_km} | ${currentIncident.section_id}`,
      `ISOLATION: ${emergencyResponse.incident.start_min} - ${emergencyResponse.incident.end_min} MINUTES`,
      `APPROVED BY: ${ROLE_LABELS[emergencyApproval.approvedBy] || emergencyApproval.approvedBy}`,
      `APPROVED AT: ${emergencyApproval.approvedAt}`,
      `PTW PRIVATE NUMBER: ${incidentPTW?.privateNo || 'PENDING'}`,
      '',
      'TRAIN IMPACT AND CP-SAT DECISIONS:',
      ...emergencyResponse.affected_trains.map((train) => `${train.train_number} ${train.name}: ${train.decision} | +${train.delay_minutes} min | ${train.reason}`),
      '',
      `PASSENGER TRAINS AFFECTED: ${emergencyResponse.passenger_trains_affected}`,
      `PASSENGER DELAY: ${emergencyResponse.passenger_delay_minutes} MINUTES`,
      '',
      'SIGNATURE: RAILSYNC CONTROL AUTHORITY',
    ];
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text(reportLines, 15, 18, { maxWidth: 180, lineHeightFactor: 1.55 });
    doc.save(`RailSync_Incident_Report_${currentIncident.incident_id}.pdf`);
  };

  const downloadEmergencyPtw = () => {
    if (!currentIncident || !emergencyResponse || !emergencyApproval || !incidentPTW) return;
    const doc = new jsPDF();
    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    doc.text('INDIAN RAILWAYS - FORM T/348M', 20, 20);
    doc.setFontSize(10);
    doc.text('EMERGENCY TRAFFIC / POWER BLOCK PERMIT', 20, 28);
    doc.line(20, 32, 190, 32);
    doc.setFont('courier', 'normal');
    doc.text(`INCIDENT: ${currentIncident.incident_id} | TYPE: ${currentIncident.type}`, 20, 42);
    doc.text(`LOCATION: KM ${currentIncident.affected_km} | SECTION: ${currentIncident.section_id}`, 20, 50);
    doc.text(`ISOLATION WINDOW: ${emergencyResponse.incident.start_min} - ${emergencyResponse.incident.end_min} MINUTES`, 20, 58);
    doc.text(`PRIVATE NUMBER: ${incidentPTW.privateNo}`, 20, 68);
    doc.text(`ISSUED BY ROLE: ${ROLE_LABELS[incidentPTW.issuedBy] || incidentPTW.issuedBy}`, 20, 76);
    doc.text(`APPROVED BY ROLE: ${ROLE_LABELS[emergencyApproval.approvedBy] || emergencyApproval.approvedBy}`, 20, 84);
    doc.text(`APPROVED AT: ${emergencyApproval.approvedAt}`, 20, 92);
    doc.text('STATUS: SANCTIONED FOR EMERGENCY PROTECTION WORK', 20, 104);
    doc.save(`IR_Form_T348M_${currentIncident.incident_id}.pdf`);
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            {ui.emergencyTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {ui.emergencySubtitle}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
          emergencyActive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
          <Activity className="w-3.5 h-3.5" /> {emergencyActive ? ui.crisisActive : ui.corridorNormal}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Scenario 1: Rail Fracture Injection */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
              <Flame className="w-4 h-4" />
              {ui.fractureScenario} at Tundla (Km 204)
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {ui.fractureScenario} adds a temporary isolation constraint while preserving the original corridor dataset.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {emergencyActive ? (
              <button
                onClick={resetEmergency}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> {ui.clearEmergency}
              </button>
            ) : (
              <button
                onClick={() => injectEmergencyDefect('RAIL_FRACTURE')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> {ui.injectFracture}
              </button>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1">
              <Zap className="w-4 h-4" /> {ui.oheScenario}
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {ui.oheScenario} creates a temporary traction isolation and runs the CP-SAT response chain.
            </p>
          </div>
          <button
            onClick={() => injectEmergencyDefect('OHE_FAILURE')}
            disabled={emergencyActive}
            className="self-start px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> {ui.injectOhe}
          </button>
        </div>

        {/* Scenario 2: Re-solve with Emergency */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <ShieldCheck className="w-4 h-4" />
              {ui.explainableOptimization} (OR-Tools)
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {ui.runDynamicResolve} under active emergency constraints to protect passenger services.
            </p>
          </div>

          <div>
            <button
              onClick={runEmergencyResponse}
              disabled={!emergencyActive || emergencySolving || Boolean(emergencyResponse)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {emergencySolving ? ui.runningCpsat : emergencyResponse ? ui.responseGenerated : ui.runDynamicResolve}
            </button>
          </div>
        </div>
      </div>

      {currentIncident && (
        <div className="border-t border-slate-800/80 pt-4 space-y-4 animate-fadeIn">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-300">{ui.activeIsolation}</div>
                <div className="mt-1 text-lg font-black text-white">{currentIncident.title} · Km {currentIncident.affected_km}</div>
                <div className="mt-1 text-xs text-slate-400">{currentIncident.section_id} · {currentIncident.section_name}</div>
              </div>
              <div className="rounded-lg border border-rose-500/30 px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-rose-200">{emergencyResponse?.incident?.status || 'Awaiting solve'}</div>
            </div>
          </div>

          {emergencyResponse && (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Affected trains</div><div className="mt-1 text-xl font-black text-white">{emergencyResponse.affected_trains.length}</div><div className="text-[11px] text-cyan-200">{emergencyResponse.rerouted_train_count} routed via loop line</div></div>
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"><div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Passenger impact</div><div className="mt-1 text-xl font-black text-white">{emergencyResponse.passenger_delay_minutes} min</div><div className="text-[11px] text-amber-200">{emergencyResponse.passenger_trains_affected} passenger services affected</div></div>
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4"><div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Authority state</div><div className="mt-1 text-xl font-black text-white">{emergencyApproval ? 'Approved' : 'Approval required'}</div><div className="text-[11px] text-emerald-200">{emergencyApproval ? ROLE_LABELS[emergencyApproval.approvedBy] : 'Control or Signal authority'}</div></div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><Route className="h-4 w-4 text-cyan-300" /> {ui.explainableDecisions}</div>
                <div className="space-y-2">
                  {emergencyResponse.affected_trains.map((train) => <div key={train.train_number} className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs md:flex-row md:items-center md:justify-between"><div><span className="font-mono font-bold text-white">{train.train_number}</span> <span className="text-slate-300">{train.name}</span><div className="mt-1 text-[11px] text-slate-400">{train.reason}</div></div><div className="text-left font-bold md:text-right"><div className={train.decision === 'REROUTE_VIA_LOOP_LINE' ? 'text-cyan-200' : 'text-amber-200'}>{train.decision.replaceAll('_', ' ')}</div><div className="text-[11px] text-slate-400">Estimated delay +{train.delay_minutes} min</div></div></div>)}
                </div>
                <div className="mt-3 space-y-1 border-t border-slate-800 pt-3 text-[11px] text-slate-300">{emergencyResponse.decision_reasons.map((reason) => <div key={reason}>• {reason}</div>)}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!emergencyApproval ? <button onClick={approveEmergencyResponse} disabled={!mayApprove} className={'rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 ' + (mayApprove ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed')} title={ui.approvalRequired}><ShieldCheck className="h-3.5 w-3.5" /> {mayApprove ? ui.approveResponse : ui.approvalRequired}</button> : <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200"><FileCheck2 className="mr-1 inline h-3.5 w-3.5" /> {ui.signedBy} {ROLE_LABELS[emergencyApproval.approvedBy]}</div>}
                {emergencyApproval && !incidentPTW && <button onClick={() => issuePTW(currentIncident.incident_id)} disabled={!mayIssue} className={'rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 ' + (mayIssue ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed')}><FileCheck2 className="h-3.5 w-3.5" /> {ui.issueEmergencyPtw}</button>}
                {emergencyApproval && incidentPTW && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-mono font-bold text-amber-200">PTW #{incidentPTW.privateNo} issued</div>}
                {emergencyApproval && incidentPTW && <button onClick={downloadEmergencyPtw} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-200"><Download className="mr-1 inline h-3.5 w-3.5" /> {ui.exportPtw}</button>}
                <button onClick={downloadIncidentReport} disabled={!emergencyApproval} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 disabled:cursor-not-allowed disabled:text-slate-600"><Download className="mr-1 inline h-3.5 w-3.5" /> {ui.exportIncident}</button>
              </div>
            </>
          )}
        </div>
      )}

      {(emergencyActive || emergencyResponse) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-800/80 pt-4 animate-fadeIn">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Incident impact</div>
            <div className="mt-1 text-xl font-black text-white">{emergencyActive ? '1 section isolated' : '0 sections isolated'}</div>
            <div className="mt-1 text-[11px] text-rose-300">{emergencyActive ? `${currentIncident?.section_id} protection block active` : 'No active disruption'}</div>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Passenger services</div>
            <div className="mt-1 text-xl font-black text-white">{emergencyResponse ? `${emergencyResponse.rerouted_train_count} rerouted` : 'Awaiting solve'}</div>
            <div className="mt-1 text-[11px] text-cyan-300">{emergencyResponse ? 'Loop line paths assigned' : 'Run CP-SAT response'}</div>
          </div>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rectifier status</div>
            <div className="mt-1 text-xl font-black text-white">{emergencyResponse ? 'Plan stabilized' : 'Awaiting solve'}</div>
            <div className="mt-1 text-[11px] text-emerald-300">{emergencyResponse ? 'Secondary delay spiral contained' : 'Run dynamic re-solve to protect traffic'}</div>
          </div>
        </div>
      )}
    </div>
  );
}