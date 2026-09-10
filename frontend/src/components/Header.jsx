import React from 'react';
import { Train, Zap, ShieldCheck, RefreshCw, UserCheck, Bot, MapPin } from 'lucide-react';
import { LANGUAGES } from '../i18n';
import { useRailwayStore } from '../store/useRailwayStore';

export default function Header({
  isOptimized, onToggleOptimize, isSolving,
  activeRole, onRoleChange,
  isApiConnected, onOpenAssistant,
  language, labels, onChangeLanguage,
}) {
  const { activeCorridorKey, setCorridor } = useRailwayStore();

  /* ── shared control pill style (frosted glass) ── */
  const pillBase = {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '0.375rem',
    padding:        '0.375rem 0.875rem',
    borderRadius:   '0.625rem',
    border:         '1px solid #D1DEFF',
    background:     'rgba(245, 248, 255, 0.70)',
    backdropFilter: 'blur(15px)',
    color:          '#3D4561',
    fontSize:       '0.75rem',
    fontWeight:     '600',
    whiteSpace:     'nowrap',
    cursor:         'default',
  };

  const selectStyle = {
    background:  'transparent',
    color:       '#1A1F3A',
    outline:     'none',
    cursor:      'pointer',
    fontWeight:  '600',
    fontSize:    '0.75rem',
    border:      'none',
  };

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

      {/* ── Brand ── */}
      <div className="flex items-center gap-3 w-full xl:w-auto">
        {/* Logo icon — bright blue with glow */}
        <div
          className="p-2.5 rounded-xl flex-shrink-0"
          style={{
            background:   'rgba(91, 127, 255, 0.20)',
            border:       '1px solid #7A96FF',
            boxShadow:    '0 4px 16px rgba(91, 127, 255, 0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Train className="w-5 h-5" style={{ color: '#5B7FFF' }} />
        </div>

        {/* Name + badges */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: '#1A1F3A' }}>
              Monocle{' '}
              <span
                className="text-sm font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(91, 127, 255, 0.15)',
                  color:      '#5B7FFF',
                  border:     '1px solid #7A96FF',
                  backdropFilter: 'blur(10px)',
                }}
              >
                RailSync
              </span>
            </h1>
            <span
              className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color:      '#10B981',
                border:     '1px solid rgba(16, 185, 129, 0.30)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ShieldCheck className="w-3 h-3" />
              {labels.compliant}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#6B7480' }}>{labels.brandSubtitle}</p>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center flex-wrap gap-2 w-full xl:w-auto justify-start xl:justify-end">

        {/* Language selector */}
        <label style={pillBase} aria-label={labels.language}>
          <span className="sr-only">{labels.language}</span>
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            aria-label={labels.language}
            style={selectStyle}
          >
            {LANGUAGES.map((opt) => (
              <option key={opt.code} value={opt.code}
                style={{ background: '#F5F8FF', color: '#1A1F3A' }}>
                {opt.nativeLabel} · {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* Corridor selector */}
        <div style={pillBase}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#5B7FFF' }} />
          <select
            value={activeCorridorKey}
            onChange={(e) => setCorridor(e.target.value)}
            style={selectStyle}
          >
            <option value="NDLS_CNB" style={{ background: '#F5F8FF', color: '#1A1F3A' }}>NDLS-CNB (NCR - 440 KM)</option>
            <option value="MMCT_ADI" style={{ background: '#F5F8FF', color: '#1A1F3A' }}>MMCT-ADI (WR - 492 KM)</option>
            <option value="HWH_DDU" style={{ background: '#F5F8FF', color: '#1A1F3A' }}>HWH-DDU (ER - 675 KM)</option>
            <option value="MAS_SBC" style={{ background: '#F5F8FF', color: '#1A1F3A' }}>MAS-SBC (SR - 360 KM)</option>
          </select>
        </div>

        {/* AI Assistant */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
          style={{
            background:  'rgba(245, 248, 255, 0.70)',
            backdropFilter: 'blur(15px)',
            border:      '1px solid #D1DEFF',
            color:       '#3D4561',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background    = 'rgba(91, 127, 255, 0.15)';
            e.currentTarget.style.borderColor   = '#7A96FF';
            e.currentTarget.style.color         = '#5B7FFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background    = 'rgba(245, 248, 255, 0.70)';
            e.currentTarget.style.borderColor   = '#D1DEFF';
            e.currentTarget.style.color         = '#3D4561';
          }}
        >
          <Bot className="w-3.5 h-3.5" style={{ color: '#5B7FFF' }} />
          <span className="hidden sm:inline">{labels.askAi}</span>
        </button>

        {/* Demo role selector */}
        <label
          style={{ ...pillBase, borderColor: '#7A96FF', background: 'rgba(91, 127, 255, 0.15)' }}
          title="Changes the demo view only; permissions remain tied to the signed-in account."
        >
          <UserCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#5B7FFF' }} />
          <span
            className="text-[9px] font-black uppercase tracking-wider"
            style={{ color: '#5B7FFF' }}
          >
            Demo role
          </span>
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value)}
            style={{ ...selectStyle, color: '#4A6FFF' }}
          >
            <option value="SECTION_CONTROLLER" style={{ background: '#F5F8FF', color: '#1A1F3A' }}>Section Controller</option>
            <option value="TRACK_ENGINEER"     style={{ background: '#F5F8FF', color: '#1A1F3A' }}>Sr. DEN (Track)</option>
            <option value="TRACTION_CONTROLLER"style={{ background: '#F5F8FF', color: '#1A1F3A' }}>TPC (Traction)</option>
            <option value="SIGNAL_INCHARGE"    style={{ background: '#F5F8FF', color: '#1A1F3A' }}>DSTE (Signal)</option>
          </select>
        </label>

        {/* Optimize / Reset button */}
        <button
          onClick={onToggleOptimize}
          disabled={isSolving}
          className="px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
          style={isOptimized
            ? {
                background:  'rgba(245, 248, 255, 0.70)',
                backdropFilter: 'blur(15px)',
                border:      '1px solid #D1DEFF',
                color:       '#3D4561',
              }
            : {
                background:  '#5B7FFF',
                border:      '1px solid #4A6FFF',
                color:       '#FFFFFF',
                boxShadow:   '0 4px 16px rgba(91,127,255,0.25)',
              }
          }
          onMouseEnter={(e) => {
            if (!isSolving) {
              e.currentTarget.style.background = isOptimized
                ? 'rgba(245, 248, 255, 0.90)'
                : '#4A6FFF';
              e.currentTarget.style.boxShadow = isOptimized
                ? 'none'
                : '0 6px 24px rgba(91,127,255,0.35)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isOptimized
              ? 'rgba(245, 248, 255, 0.70)'
              : '#5B7FFF';
            e.currentTarget.style.boxShadow = isOptimized
              ? 'none'
              : '0 4px 16px rgba(91,127,255,0.25)';
          }}
        >
          {isSolving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{labels.solving}</span>
            </>
          ) : isOptimized ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" style={{ color: '#6B7480' }} />
              <span>{labels.reset}</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{labels.optimizer}</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
