import React, { useState, useEffect } from 'react';
import { 
  Zap, AlertTriangle, CheckCircle2, RefreshCw, Plus, 
  Layers, Radio, Hammer, X
} from 'lucide-react';
import { useLanguage } from '../i18n';

export default function TdmsDashboard({ user }) {
  const { t } = useLanguage();
  const tdms = t.tdms;

  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    line_section:           'HWH-DEL',
    line_direction:         'UP',
    source_mast_no:         '102/14',
    target_mast_no:         '102/22',
    power_isolation_needed: true,
    work_category:          'Contact Wire Replacement',
    required_duration_mins: 180,
    tms_collab_req:         true,
    smms_collab_req:        false,
    reported_by:            user?.name || 'K. Srinivasan (DEE/TRD)',
  });

  const fetchTdmsJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/departments/tdms/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Failed to fetch TDMS jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTdmsJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/departments/tdms/jobs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`${tdms.jobSubmitted} ${data.job.power_job_id}`);
        setShowModal(false);
        await fetchTdmsJobs();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error('Error creating TDMS job:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.power_job_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.work_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.line_section?.toLowerCase().includes(searchTerm.toLowerCase())
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
          background:     'linear-gradient(135deg, rgba(147,51,234,0.10) 0%, rgba(245,248,255,0.95) 100%)',
          border:         '1px solid rgba(147,51,234,0.28)',
          backdropFilter: 'blur(20px)',
          boxShadow:      '0 4px 24px rgba(147,51,234,0.10)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(147,51,234,0.14)', border: '1.5px solid rgba(147,51,234,0.32)' }}>
            <Zap className="w-7 h-7" style={{ color: '#9333EA' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black" style={{ color: 'var(--ff-ink)' }}>{tdms.title}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider"
                style={{ background: 'rgba(147,51,234,0.12)', color: '#9333EA', border: '1px solid rgba(147,51,234,0.25)' }}>
                {tdms.dept}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--ff-muted)' }}>{tdms.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTdmsJobs}
            className="p-2 rounded-xl border transition-all"
            style={{ background: 'rgba(245,248,255,0.80)', border: '1px solid var(--ff-border)' }}
            title={tdms.refresh}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: loading ? '#9333EA' : 'var(--ff-muted)' }} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all cursor-pointer"
            style={{ background: '#9333EA', boxShadow: '0 4px 16px rgba(147,51,234,0.28)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#7E22CE'}
            onMouseLeave={e => e.currentTarget.style.background = '#9333EA'}>
            <Plus className="w-4 h-4" /><span>{tdms.submitDemand}</span>
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
          { label: tdms.kpiTotal,  val: jobs.length,                                             clr: '#9333EA', Icon: Zap,           bdr: 'rgba(147,51,234,0.20)' },
          { label: tdms.kpiCutoff, val: jobs.filter(j => j.power_isolation_needed).length,        clr: '#EF4444', Icon: AlertTriangle, bdr: 'rgba(239,68,68,0.20)' },
          { label: tdms.kpiTms,    val: jobs.filter(j => j.tms_collab_req).length,               clr: '#EA580C', Icon: Hammer,        bdr: 'rgba(234,88,12,0.20)' },
          { label: tdms.kpiSmms,   val: jobs.filter(j => j.smms_collab_req).length,              clr: '#3B82F6', Icon: Radio,         bdr: 'rgba(59,130,246,0.20)' },
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

      {/* ── Table of Power Assets ── */}
      <div className="rounded-2xl glass-card border p-5" style={{ borderColor: 'var(--ff-border-light)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--ff-ink)' }}>
              {tdms.tableTitle}
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-muted)', border: '1px solid var(--ff-border)' }}>
                tdms_power_assets
              </span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ff-muted)' }}>{tdms.tableDesc}</p>
          </div>
          <input
            type="text"
            placeholder={tdms.searchPlaceholder}
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
                {[tdms.colJobId, tdms.colSection, tdms.colMast, tdms.colIsolation, tdms.colCategory, tdms.colDuration, tdms.colColoc, tdms.colReported, tdms.colHash].map(h => (
                  <th key={h} className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--ff-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center" style={{ color: 'var(--ff-muted)' }}>
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" style={{ color: '#9333EA' }} />{tdms.loading}
                </td></tr>
              ) : filteredJobs.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center" style={{ color: 'var(--ff-muted)' }}>{tdms.noData}</td></tr>
              ) : filteredJobs.map(job => (
                <tr key={job.power_job_id || job.sl_no}
                  className="border-b transition-all"
                  style={{ borderColor: 'var(--ff-border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(147,51,234,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="py-3 px-3 font-mono font-bold" style={{ color: '#9333EA' }}>{job.power_job_id}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold" style={{ color: 'var(--ff-ink)' }}>{job.line_section}</span>{' '}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${job.line_direction === 'UP' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      {job.line_direction}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono" style={{ color: 'var(--ff-muted)' }}>
                    Mast {job.source_mast_no} ➔ {job.target_mast_no}
                  </td>
                  <td className="py-3 px-3">
                    {job.power_isolation_needed ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                        {tdms.cutoffReq}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                        style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-muted)' }}>
                        {tdms.liveLine}
                      </span>
                    )}
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
                      {job.smms_collab_req && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>S&T</span>
                      )}
                      {!job.tms_collab_req && !job.smms_collab_req && <span style={{ color: 'var(--ff-faint)' }}>—</span>}
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
            style={{ background: 'var(--ff-surface)', border: '1px solid rgba(147,51,234,0.30)', boxShadow: '0 24px 80px rgba(147,51,234,0.15)' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--ff-border)' }}>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: '#9333EA' }} />
                <h3 className="text-base font-black" style={{ color: 'var(--ff-ink)' }}>{tdms.modalTitle}</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--ff-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tdms.fSection}</label>
                  <input type="text" value={formData.line_section}
                    onChange={e => setFormData({ ...formData, line_section: e.target.value })}
                    className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tdms.fDirection}</label>
                  <select value={formData.line_direction}
                    onChange={e => setFormData({ ...formData, line_direction: e.target.value })}
                    className={inputCls} style={selectStyle}>
                    <option value="UP">{tdms.fUp}</option>
                    <option value="DN">{tdms.fDn}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tdms.fSourceMast}</label>
                  <input type="text" value={formData.source_mast_no}
                    onChange={e => setFormData({ ...formData, source_mast_no: e.target.value })}
                    className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tdms.fTargetMast}</label>
                  <input type="text" value={formData.target_mast_no}
                    onChange={e => setFormData({ ...formData, target_mast_no: e.target.value })}
                    className={inputCls} style={inputStyle} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tdms.fDuration}</label>
                  <input type="number" value={formData.required_duration_mins}
                    onChange={e => setFormData({ ...formData, required_duration_mins: parseInt(e.target.value) })}
                    className={inputCls} style={inputStyle} required />
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold" style={{ color: 'var(--ff-ink-secondary)' }}>
                    <input type="checkbox" checked={formData.power_isolation_needed}
                      onChange={e => setFormData({ ...formData, power_isolation_needed: e.target.checked })} />
                    <span>{tdms.fIsolation}</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tdms.fCategory}</label>
                <input type="text" value={formData.work_category}
                  onChange={e => setFormData({ ...formData, work_category: e.target.value })}
                  placeholder="e.g. Contact Wire Replacement"
                  className={inputCls} style={inputStyle} required />
              </div>
              <div className="rounded-xl p-3 space-y-2"
                style={{ background: 'var(--ff-surface-alt)', border: '1px solid var(--ff-border)' }}>
                <span className="block font-bold text-xs" style={{ color: 'var(--ff-ink-secondary)' }}>{tdms.fColoc}</span>
                {[
                  { key: 'tms_collab_req', label: tdms.fTmsColoc },
                  { key: 'smms_collab_req', label: tdms.fSmmsColoc },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--ff-ink-secondary)' }}>
                    <input type="checkbox" checked={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>
              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--ff-ink-secondary)' }}>{tdms.fReported}</label>
                <input type="text" value={formData.reported_by}
                  onChange={e => setFormData({ ...formData, reported_by: e.target.value })}
                  className={inputCls} style={inputStyle} required />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--ff-border)' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'var(--ff-surface-alt)', color: 'var(--ff-muted)', border: '1px solid var(--ff-border)' }}>
                  {tdms.cancel}
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all"
                  style={{ background: submitting ? '#7E22CE' : '#9333EA', boxShadow: '0 4px 16px rgba(147,51,234,0.25)' }}>
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{tdms.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
