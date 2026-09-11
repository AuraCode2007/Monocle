import React, { useState, useEffect } from 'react';
import {
  Radio, AlertTriangle, CheckCircle2, RefreshCw, Plus,
  Layers, Zap, Hammer, MapPin, X
} from 'lucide-react';
import { useLanguage } from '../i18n';

const WORK_CATEGORIES = [
  'Signal Aspect Failure',
  'Point Machine Replacement',
  'DAC (Digital Axle Counter) Reset',
  'EI / RRI Panel Fault',
  'Level Crossing Equipment',
  'Track Circuit Failure',
  'Telecom Cable Fault',
  'Signal Post Lamp Renewal',
  'Relay Room Maintenance',
  'Interlocking Verification',
];

const FAULT_LEVELS = ['Critical', 'High', 'Medium', 'Low', 'Routine'];

const DEMO_JOBS = [
  {
    signal_job_id: 'SMMS-001', station: 'NDLS', signal_number: 'DN-14',
    work_category: 'Signal Aspect Failure', fault_level: 'Critical',
    interlocking_panel: 'Panel-A', block_section: 'NDLS-TKD',
    required_duration_mins: 90, block_required: true,
    tms_collab_req: false, tdms_collab_req: false,
    reported_by: 'Debasish Roy (DSTE/Signal)',
    blockchain_hash: '0xA1B2C3D4E5F6...',
  },
  {
    signal_job_id: 'SMMS-002', station: 'GZB', signal_number: 'UP-07',
    work_category: 'Point Machine Replacement', fault_level: 'High',
    interlocking_panel: 'Panel-B', block_section: 'GZB-ALJN',
    required_duration_mins: 180, block_required: true,
    tms_collab_req: true, tdms_collab_req: false,
    reported_by: 'R. Nair (SSE/Signal)',
    blockchain_hash: '0xF7E8D9C0B1A2...',
  },
  {
    signal_job_id: 'SMMS-003', station: 'MGS', signal_number: 'DN-22',
    work_category: 'DAC (Digital Axle Counter) Reset', fault_level: 'Medium',
    interlocking_panel: 'Panel-A', block_section: 'MGS-CNB',
    required_duration_mins: 45, block_required: false,
    tms_collab_req: false, tdms_collab_req: false,
    reported_by: 'Debasish Roy (DSTE/Signal)',
    blockchain_hash: '0xC3D4E5F6A7B8...',
  },
];

export default function SmmsDashboard({ user }) {
  const { t } = useLanguage();
  const smms = t.smms;

  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    station:                'NDLS',
    signal_number:          'DN-14',
    signal_type:            'Colour Light Signal',
    work_category:          'Signal Aspect Failure',
    fault_level:            'High',
    interlocking_panel:     'Panel-A',
    block_section:          'NDLS-TKD',
    required_duration_mins: 120,
    block_required:         true,
    tms_collab_req:         false,
    tdms_collab_req:        false,
    reported_by:            user?.name || 'Debasish Roy (DSTE/Signal)',
  });

  const fetchSmmsJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/departments/smms/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      } else {
        setJobs(DEMO_JOBS);
      }
    } catch {
      setJobs(DEMO_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSmmsJobs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/departments/smms/jobs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`${smms.jobSubmitted} ${data.job?.signal_job_id || 'SMMS-NEW'}`);
        setShowModal(false);
        await fetchSmmsJobs();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch {
      const localJob = {
        signal_job_id: `SMMS-${String(jobs.length + 1).padStart(3, '0')}`,
        ...formData,
        blockchain_hash: '0x' + Math.random().toString(16).slice(2, 14).toUpperCase() + '...',
      };
      setJobs((prev) => [localJob, ...prev]);
      setSuccessMsg('Signal job logged locally.');
      setShowModal(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const filteredJobs = jobs.filter((j) =>
    j.signal_job_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.work_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.station?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const inputCls = 'w-full px-3 py-2 rounded-xl text-sm focus:outline-none transition-all';
  const inputStyle = { background: 'rgba(245,248,255,0.85)', border: '1.5px solid var(--ff-border)', color: 'var(--ff-ink)' };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <div className="space-y-5">
      {/* ── Banner ── */}
      <div
        className="rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background:     'linear-gradient(135deg, rgba(2,132,199,0.10) 0%, rgba(245,248,255,0.95) 100%)',
          border:         '1px solid rgba(2,132,199,0.28)',
          backdropFilter: 'blur(20px)',
          boxShadow:      '0 4px 24px rgba(2,132,199,0.10)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(2,132,199,0.14)', border: '1.5px solid rgba(2,132,199,0.32)' }}>
            <Radio className="w-7 h-7" style={{ color: '#0284C7' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black" style={{ color: 'var(--ff-ink)' }}>{smms.title}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider"
                style={{ background: 'rgba(2,132,199,0.12)', color: '#0284C7', border: '1px solid rgba(2,132,199,0.25)' }}>
                {smms.dept}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--ff-muted)' }}>{smms.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchSmmsJobs}
            className="p-2 rounded-xl border transition-all"
            style={{ background: 'rgba(245,248,255,0.80)', border: '1px solid var(--ff-border)' }}
            title={smms.refresh}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: loading ? '#0284C7' : 'var(--ff-muted)' }} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all cursor-pointer"
            style={{ background: '#0284C7', boxShadow: '0 4px 16px rgba(2,132,199,0.28)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0369A1'}
            onMouseLeave={e => e.currentTarget.style.background = '#0284C7'}>
            <Plus className="w-4 h-4" /><span>{smms.submitDemand}</span>
          </button>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {successMsg && (
        <div className="p-3 rounded-xl flex items-center gap-2 text-sm"
          style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.28)', color: '#059669' }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#10B981' }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: smms.kpiTotal,    val: jobs.length,                                                              clr: '#0284C7', Icon: Layers,        bdr: 'rgba(2,132,199,0.20)' },
          { label: smms.kpiCritical, val: jobs.filter(j => j.fault_level?.toLowerCase() === 'critical').length, clr: '#EF4444', Icon: AlertTriangle, bdr: 'rgba(239,68,68,0.20)' },
          { label: smms.kpiTms,      val: jobs.filter(j => j.tms_collab_req).length,                                clr: '#EA580C', Icon: Hammer,        bdr: 'rgba(234,88,12,0.20)' },
          { label: smms.kpiTdms,     val: jobs.filter(j => j.tdms_collab_req).length,                               clr: '#9333EA', Icon: Zap,           bdr: 'rgba(147,51,234,0.20)' },
        ].map(({ label, val, clr, Icon, bdr }) => (
          <div key={label} className="p-4 rounded-2xl glass-card border" style={{ borderColor: bdr }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--ff-muted)' }}>{label}</span>
            <div className="text-3xl font-black mt-1" style={{ color: clr }}>{val}</div>
            <span className="text-[11px] mt-1 flex items-center gap-1" style={{ color: clr }}>
              <Icon className="w-3 h-3" />
            </span>
          </div>
        ))}
      </div>

      {/* ── Table of Signal Assets ── */}
      <div className="rounded-2xl glass-card border p-5" style={{ borderColor: 'var(--ff-border-light)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--ff-ink)' }}>
              {smms.tableTitle}
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-muted)', border: '1px solid var(--ff-border)' }}>
                smms_signal_assets
              </span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ff-muted)' }}>{smms.tableDesc}</p>
          </div>
          <input
            type="text"
            placeholder={smms.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl text-xs focus:outline-none transition-all"
            style={{ ...inputStyle, maxWidth: '220px' }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ color: 'var(--ff-ink-secondary)' }}>
            <thead>
              <tr className="border-b" style={{ background: 'var(--ff-surface-alt)', borderColor: 'var(--ff-border)' }}>
                {[smms.colJobId, smms.colStation, smms.colSignalNo, smms.colFaultLevel, smms.colCategory, smms.colDuration, smms.colColoc, smms.colReported, smms.colHash].map(h => (
                  <th key={h} className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--ff-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center" style={{ color: 'var(--ff-muted)' }}>
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" style={{ color: '#0284C7' }} />{smms.loading}
                </td></tr>
              ) : filteredJobs.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center" style={{ color: 'var(--ff-muted)' }}>{smms.noData}</td></tr>
              ) : filteredJobs.map(job => (
                <tr key={job.signal_job_id}
                  className="border-b transition-all"
                  style={{ borderColor: 'var(--ff-border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(2,132,199,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="py-3 px-3 font-mono font-bold" style={{ color: '#0284C7' }}>{job.signal_job_id}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--ff-ink)' }}>
                      <MapPin className="w-3 h-3" style={{ color: 'var(--ff-muted)' }} />{job.station}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono" style={{ color: 'var(--ff-muted)' }}>{job.signal_number}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      job.fault_level?.toLowerCase() === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : job.fault_level?.toLowerCase() === 'high'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {job.fault_level || 'Medium'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold" style={{ color: 'var(--ff-ink)' }}>{job.work_category}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-lg font-mono text-xs"
                      style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-ink-secondary)', border: '1px solid var(--ff-border)' }}>
                      {job.required_duration_mins}m
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {job.tms_collab_req && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: 'rgba(234,88,12,0.12)', color: '#EA580C', border: '1px solid rgba(234,88,12,0.25)' }}>TMS</span>
                      )}
                      {job.tdms_collab_req && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: 'rgba(147,51,234,0.12)', color: '#9333EA', border: '1px solid rgba(147,51,234,0.25)' }}>OHE</span>
                      )}
                      {!job.tms_collab_req && !job.tdms_collab_req && <span style={{ color: 'var(--ff-faint)' }}>—</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3" style={{ color: 'var(--ff-muted)' }}>{job.reported_by}</td>
                  <td className="py-3 px-3 font-mono text-[10px]" style={{ color: 'var(--ff-faint)' }}>{job.blockchain_hash || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Submit Signal Demand Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,31,58,0.55)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            style={{ background: 'var(--ff-surface)', border: '1px solid rgba(2,132,199,0.30)', boxShadow: '0 24px 80px rgba(2,132,199,0.15)' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--ff-border)' }}>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5" style={{ color: '#0284C7' }} />
                <h3 className="text-base font-black" style={{ color: 'var(--ff-ink)' }}>{smms.modalTitle}</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--ff-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{smms.fStation}</label>
                  <input type="text" value={formData.station}
                    onChange={(e) => handleChange('station', e.target.value)}
                    className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{smms.fSignalNo}</label>
                  <input type="text" value={formData.signal_number}
                    onChange={(e) => handleChange('signal_number', e.target.value)}
                    className={inputCls} style={inputStyle} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{smms.fCategory}</label>
                  <select value={formData.work_category}
                    onChange={(e) => handleChange('work_category', e.target.value)}
                    className={inputCls} style={selectStyle} required>
                    {WORK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{smms.fFaultLevel}</label>
                  <select value={formData.fault_level}
                    onChange={(e) => handleChange('fault_level', e.target.value)}
                    className={inputCls} style={selectStyle}>
                    {FAULT_LEVELS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{smms.fPanel}</label>
                  <input type="text" value={formData.interlocking_panel}
                    onChange={(e) => handleChange('interlocking_panel', e.target.value)}
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{smms.fBlock}</label>
                  <input type="text" value={formData.block_section}
                    onChange={(e) => handleChange('block_section', e.target.value)}
                    className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{smms.fDuration}</label>
                  <input type="number" min={15} max={480} value={formData.required_duration_mins}
                    onChange={(e) => handleChange('required_duration_mins', parseInt(e.target.value))}
                    className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{smms.fReported}</label>
                  <input type="text" value={formData.reported_by}
                    onChange={(e) => handleChange('reported_by', e.target.value)}
                    className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="rounded-xl p-3 space-y-2"
                style={{ background: 'var(--ff-surface-alt)', border: '1px solid var(--ff-border)' }}>
                {[
                  { field: 'block_required',  label: smms.fBlockReq },
                  { field: 'tms_collab_req',  label: smms.fTmsColoc },
                  { field: 'tdms_collab_req', label: smms.fTdmsColoc },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--ff-ink-secondary)' }}>
                    <input type="checkbox" checked={formData[field]}
                      onChange={(e) => handleChange(field, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--ff-border)' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-muted)', border: '1px solid var(--ff-border)' }}>
                  {smms.cancel}
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all"
                  style={{ background: submitting ? '#0369A1' : '#0284C7', boxShadow: '0 4px 16px rgba(2,132,199,0.25)' }}>
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{submitting ? smms.submitting : smms.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
