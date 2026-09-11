import React, { useState, useEffect } from 'react';
import {
  Hammer, AlertTriangle, CheckCircle2, RefreshCw, Plus,
  Layers, Zap, Radio, X
} from 'lucide-react';
import { useLanguage } from '../i18n';

export default function TmsDashboard({ user }) {
  const { t } = useLanguage();
  const tms = t.tms;

  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    line_section:           'HWH-DEL',
    line_direction:         'UP',
    start_km:               102.5,
    end_km:                 103.2,
    structure_type:         'Ballast Bed',
    work_category:          'Deep Screening',
    required_duration_mins: 180,
    tdms_collab_req:        true,
    smms_collab_req:        false,
    reported_by:            user?.name || 'A. K. Sharma (Sr. DEN/Track)',
  });

  const fetchTmsJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/departments/tms/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Failed to fetch TMS jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTmsJobs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/departments/tms/jobs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`${tms.jobSubmitted} ${data.job.track_job_id}`);
        setShowModal(false);
        await fetchTmsJobs();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error('Error creating TMS job:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(j =>
    j.track_job_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.work_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.line_section?.toLowerCase().includes(searchTerm.toLowerCase()),
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
          background:     'linear-gradient(135deg, rgba(234,88,12,0.10) 0%, rgba(245,248,255,0.95) 100%)',
          border:         '1px solid rgba(234,88,12,0.28)',
          backdropFilter: 'blur(20px)',
          boxShadow:      '0 4px 24px rgba(234,88,12,0.10)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(234,88,12,0.14)', border: '1.5px solid rgba(234,88,12,0.32)' }}>
            <Hammer className="w-7 h-7" style={{ color: '#EA580C' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black" style={{ color: 'var(--ff-ink)' }}>{tms.title}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider"
                style={{ background: 'rgba(234,88,12,0.12)', color: '#EA580C', border: '1px solid rgba(234,88,12,0.25)' }}>
                {tms.dept}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--ff-muted)' }}>{tms.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTmsJobs}
            className="p-2 rounded-xl border transition-all"
            style={{ background: 'rgba(245,248,255,0.80)', border: '1px solid var(--ff-border)' }}
            title={tms.refresh}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: loading ? '#EA580C' : 'var(--ff-muted)' }} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all"
            style={{ background: '#EA580C', boxShadow: '0 4px 16px rgba(234,88,12,0.28)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#C2410C'}
            onMouseLeave={e => e.currentTarget.style.background = '#EA580C'}>
            <Plus className="w-4 h-4" /><span>{tms.submitDemand}</span>
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
          { label: tms.kpiTotal,  val: jobs.length,                                                                                   clr: '#EA580C', Icon: Layers,        bdr: 'rgba(234,88,12,0.20)' },
          { label: tms.kpiUsfd,   val: jobs.filter(j => (j.work_category||'').includes('USFD') || j.required_duration_mins >= 200).length, clr: '#EF4444', Icon: AlertTriangle, bdr: 'rgba(239,68,68,0.20)' },
          { label: tms.kpiOhe,    val: jobs.filter(j => j.tdms_collab_req).length,                                                    clr: '#8B5CF6', Icon: Zap,           bdr: 'rgba(139,92,246,0.20)' },
          { label: tms.kpiSt,     val: jobs.filter(j => j.smms_collab_req).length,                                                    clr: '#3B82F6', Icon: Radio,         bdr: 'rgba(59,130,246,0.20)' },
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

      {/* ── Asset Table ── */}
      <div className="rounded-2xl glass-card border p-5" style={{ borderColor: 'var(--ff-border-light)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--ff-ink)' }}>
              {tms.tableTitle}
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-muted)', border: '1px solid var(--ff-border)' }}>
                tms_track_assets
              </span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ff-muted)' }}>{tms.tableDesc}</p>
          </div>
          <input type="text" placeholder={tms.searchPlaceholder} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl text-xs focus:outline-none transition-all"
            style={{ ...inputStyle, maxWidth: '220px' }} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ color: 'var(--ff-ink-secondary)' }}>
            <thead>
              <tr className="border-b" style={{ background: 'var(--ff-surface-alt)', borderColor: 'var(--ff-border)' }}>
                {[tms.colJobId, tms.colSection, tms.colKm, tms.colStructure, tms.colCategory, tms.colDuration, tms.colColoc, tms.colReported, tms.colHash].map(h => (
                  <th key={h} className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--ff-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center" style={{ color: 'var(--ff-muted)' }}>
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" style={{ color: '#EA580C' }} />{tms.loading}
                </td></tr>
              ) : filteredJobs.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center" style={{ color: 'var(--ff-muted)' }}>{tms.noData}</td></tr>
              ) : filteredJobs.map(job => (
                <tr key={job.track_job_id || job.sl_no}
                  className="border-b transition-all"
                  style={{ borderColor: 'var(--ff-border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,88,12,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="py-3 px-3 font-mono font-bold" style={{ color: '#EA580C' }}>{job.track_job_id}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold" style={{ color: 'var(--ff-ink)' }}>{job.line_section}</span>{' '}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${job.line_direction === 'UP' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      {job.line_direction}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono" style={{ color: 'var(--ff-muted)' }}>
                    KM {parseFloat(job.start_km).toFixed(2)} – {parseFloat(job.end_km).toFixed(2)}
                  </td>
                  <td className="py-3 px-3" style={{ color: 'var(--ff-ink-secondary)' }}>{job.structure_type}</td>
                  <td className="py-3 px-3 font-semibold" style={{ color: 'var(--ff-ink)' }}>{job.work_category}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-lg font-mono text-xs"
                      style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-ink-secondary)', border: '1px solid var(--ff-border)' }}>
                      {job.required_duration_mins}m
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {job.tdms_collab_req && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}>OHE</span>
                      )}
                      {job.smms_collab_req && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>S&T</span>
                      )}
                      {!job.tdms_collab_req && !job.smms_collab_req && <span style={{ color: 'var(--ff-faint)' }}>—</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3" style={{ color: 'var(--ff-muted)' }}>{job.reported_by}</td>
                  <td className="py-3 px-3 font-mono text-[10px]" style={{ color: 'var(--ff-faint)' }} title={job.blockchain_tx_hash}>
                    {job.blockchain_tx_hash ? `${job.blockchain_tx_hash.slice(0, 10)}…` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Submit Demand Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,31,58,0.55)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            style={{ background: 'var(--ff-surface)', border: '1px solid rgba(234,88,12,0.30)', boxShadow: '0 24px 80px rgba(234,88,12,0.15)' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--ff-border)' }}>
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5" style={{ color: '#EA580C' }} />
                <h3 className="text-base font-black" style={{ color: 'var(--ff-ink)' }}>{tms.modalTitle}</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--ff-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fSection}</label>
                  <input type="text" value={formData.line_section}
                    onChange={e => setFormData({ ...formData, line_section: e.target.value })}
                    className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fDirection}</label>
                  <select value={formData.line_direction}
                    onChange={e => setFormData({ ...formData, line_direction: e.target.value })}
                    className={inputCls} style={selectStyle}>
                    <option value="UP">{tms.fUp}</option>
                    <option value="DN">{tms.fDn}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fStartKm}</label>
                  <input type="number" step="0.001" value={formData.start_km}
                    onChange={e => setFormData({ ...formData, start_km: parseFloat(e.target.value) })}
                    className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fEndKm}</label>
                  <input type="number" step="0.001" value={formData.end_km}
                    onChange={e => setFormData({ ...formData, end_km: parseFloat(e.target.value) })}
                    className={inputCls} style={inputStyle} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fStructure}</label>
                  <select value={formData.structure_type}
                    onChange={e => setFormData({ ...formData, structure_type: e.target.value })}
                    className={inputCls} style={selectStyle}>
                    {['Ballast Bed','Turnout Points','Embankment','Level Crossing','Bridge Approach','Main Line Track'].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fDuration}</label>
                  <input type="number" value={formData.required_duration_mins}
                    onChange={e => setFormData({ ...formData, required_duration_mins: parseInt(e.target.value) })}
                    className={inputCls} style={inputStyle} required />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fCategory}</label>
                <input type="text" value={formData.work_category}
                  onChange={e => setFormData({ ...formData, work_category: e.target.value })}
                  placeholder="e.g. Deep Screening of Ballast"
                  className={inputCls} style={inputStyle} required />
              </div>
              <div className="rounded-xl p-3 space-y-2"
                style={{ background: 'var(--ff-surface-alt)', border: '1px solid var(--ff-border)' }}>
                <span className="block font-bold text-xs" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fColoc}</span>
                {[
                  { key: 'tdms_collab_req', label: tms.fTdmsColoc },
                  { key: 'smms_collab_req', label: tms.fSmmsColoc },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--ff-ink-secondary)' }}>
                    <input type="checkbox" checked={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>
              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tms.fReported}</label>
                <input type="text" value={formData.reported_by}
                  onChange={e => setFormData({ ...formData, reported_by: e.target.value })}
                  className={inputCls} style={inputStyle} required />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--ff-border)' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-muted)', border: '1px solid var(--ff-border)' }}>
                  {tms.cancel}
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all"
                  style={{ background: submitting ? '#C2410C' : '#EA580C', boxShadow: '0 4px 16px rgba(234,88,12,0.25)' }}>
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{tms.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
