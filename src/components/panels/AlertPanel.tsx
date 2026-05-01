// ============================================================
// IINVSYS SIS — AlertPanel.tsx
// Full alert management panel with filtering, sparkline, ack flow,
// bulk-acknowledge, CSV export, and server-load / pagination.
// ============================================================

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useAlertStore } from '@/store/alertStore'
import { AlertRow } from '@/components/widgets/AlertRow'
import type { ThreatLevel, SensorFamily } from '@/types/sensors'

// ── Threat level filter chips ─────────────────────────────────
const THREAT_LEVELS: (ThreatLevel | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const FAMILIES: (SensorFamily | 'ALL')[] = [
  'ALL', 'Seismic', 'Acoustic', 'Optical', 'Radar', 'Magnetic', 'Chemical',
]

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'var(--alert-critical)',
  HIGH:     'var(--alert-high)',
  MEDIUM:   'var(--alert-medium)',
  LOW:      'var(--alert-low)',
  ALL:      'var(--text-secondary)',
}

// ── Audio alert helper ────────────────────────────────────────
function playBeep() {
  try {
    const audioCtx = new AudioContext()
    const osc = audioCtx.createOscillator()
    osc.connect(audioCtx.destination)
    osc.frequency.value = 880
    osc.start()
    osc.stop(audioCtx.currentTime + 0.3)
  } catch {
    // AudioContext not available (e.g. test environment)
  }
}

// ── Alert rate sparkline (last 24 "buckets") ─────────────────
interface SparklineProps { data: number[] }

function AlertSparkline({ data }: SparklineProps) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const W = 120, H = 28
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - 2 - ((v / max) * (H - 4))
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--alert-high)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points={`0,${H} ${pts} ${W},${H}`}
        fill="var(--alert-high)"
        fillOpacity={0.12}
        stroke="none"
      />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────
export function AlertPanel() {
  const allAlerts             = useAlertStore((s) => s.alerts)
  const filter                = useAlertStore((s) => s.filter)
  const setFilter             = useAlertStore((s) => s.setFilter)
  const filteredAlerts        = useAlertStore((s) => s.filteredAlerts)
  const acknowledgeAlert      = useAlertStore((s) => s.acknowledgeAlert)
  const loading               = useAlertStore((s) => s.loading)
  const loadError             = useAlertStore((s) => s.loadError)
  const pagination            = useAlertStore((s) => s.pagination)
  const selectedIds           = useAlertStore((s) => s.selectedIds)
  const toggleSelected        = useAlertStore((s) => s.toggleSelected)
  const selectAll             = useAlertStore((s) => s.selectAll)
  const clearSelection        = useAlertStore((s) => s.clearSelection)
  const loadAlerts            = useAlertStore((s) => s.loadAlerts)
  const bulkAcknowledgeAlerts = useAlertStore((s) => s.bulkAcknowledgeAlerts)
  const exportAlerts          = useAlertStore((s) => s.exportAlerts)

  const prevCountRef = useRef(0)

  // Alert rate sparkline
  const [sparkData, setSparkData] = useState<number[]>(Array(24).fill(0))
  const tickRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    tickRef.current = setInterval(() => {
      const cnt = allAlerts.filter((a) => {
        const age = Date.now() - new Date(a.timestamp).getTime()
        return age < 1000
      }).length
      setSparkData((prev) => [...prev.slice(1), cnt])
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [allAlerts])

  // Audible alert on new CRITICAL/HIGH
  useEffect(() => {
    const critHigh = allAlerts.filter(
      (a) => !a.acknowledged && (a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH')
    ).length
    if (critHigh > prevCountRef.current) playBeep()
    prevCountRef.current = critHigh
  }, [allAlerts])

  // Auto-load from server on mount
  useEffect(() => {
    void loadAlerts({ page: 1, limit: 50 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayed = useMemo(() => filteredAlerts(), [filteredAlerts, filter, allAlerts])

  const handleAck = (id: string) => acknowledgeAlert(id, '')

  const critCount = allAlerts.filter(
    (a) => !a.acknowledged && a.threat_level === 'CRITICAL'
  ).length

  const allDisplayedSelected =
    displayed.length > 0 && displayed.every((a) => selectedIds.has(a.id))

  const handleSelectAllToggle = useCallback(() => {
    if (allDisplayedSelected) clearSelection()
    else selectAll(displayed.map((a) => a.id))
  }, [allDisplayedSelected, clearSelection, selectAll, displayed])

  const handleBulkAck = useCallback(() => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    void bulkAcknowledgeAlerts(ids)
  }, [selectedIds, bulkAcknowledgeAlerts])

  const handleExport = useCallback(() => {
    exportAlerts()
  }, [exportAlerts])

  const handlePageChange = useCallback((delta: number) => {
    const next = pagination.page + delta
    if (next < 1) return
    void loadAlerts({ page: next, limit: pagination.limit })
  }, [pagination, loadAlerts])

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit))

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header — sparkline + critical badge */}
      <div className="py-1 px-3 border-b border-border-color text-[13px] font-semibold text-text-secondary bg-panel-header-bg flex items-center justify-between shrink-0">
        <span className="flex items-center gap-2">
          {critCount > 0 && (
            <span
              className="badge badge-critical"
              style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
            >
              {critCount} CRITICAL
            </span>
          )}
          {loading && (
            <span className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin inline-block" />
          )}
        </span>
        <AlertSparkline data={sparkData} />
      </div>

      {/* Error banner */}
      {loadError && (
        <div
          data-testid="alert-load-error"
          className="text-[11px] px-3 py-1.5 text-[var(--alert-high)] bg-[rgba(239,68,68,0.08)] border-b border-border-color shrink-0"
        >
          {loadError}
        </div>
      )}

      {/* Bulk-action toolbar (visible when items are selected) */}
      {selectedIds.size > 0 && (
        <div
          data-testid="bulk-toolbar"
          className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(59,130,246,0.08)] border-b border-border-color shrink-0"
        >
          <span className="text-[11px] text-accent-blue font-semibold">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleBulkAck}
            className="text-[11px] px-2.5 h-6 rounded bg-accent-blue text-white border-none cursor-pointer hover:opacity-80 transition-opacity"
          >
            Ack Selected
          </button>
          <button
            onClick={clearSelection}
            className="text-[11px] px-2 h-6 rounded border border-border-color text-text-secondary bg-transparent cursor-pointer hover:bg-bg-hover transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="py-1.5 px-3 border-b border-border-color flex flex-wrap gap-1.5 items-center shrink-0 bg-bg-secondary">
        {/* Select-all checkbox */}
        <label className="flex items-center gap-1 text-[11px] text-text-secondary cursor-pointer mr-1">
          <input
            type="checkbox"
            checked={allDisplayedSelected}
            onChange={handleSelectAllToggle}
            className="w-3 h-3 cursor-pointer"
            aria-label="Select all visible alerts"
          />
        </label>

        {/* Threat level chips */}
        <div className="flex gap-1 flex-wrap">
          {THREAT_LEVELS.map((lvl) => {
            const active = filter.threatLevel === lvl
            const color = LEVEL_COLORS[lvl] ?? 'var(--text-secondary)'
            return (
              <button
                key={lvl}
                onClick={() => setFilter({ threatLevel: lvl })}
                className="text-[10px] font-bold px-[10px] h-7 rounded-full cursor-pointer tracking-[0.05em] transition-all duration-150 inline-flex items-center"
                style={{
                  border: `1px solid ${active ? color : 'var(--border-color)'}`,
                  background: active ? `${color}22` : 'transparent',
                  color: active ? color : 'var(--text-secondary)',
                }}
              >
                {lvl}
              </button>
            )
          })}
        </div>

        <div className="w-px h-[18px] bg-border-color shrink-0" />

        {/* Family dropdown */}
        <select
          value={filter.sensorFamily}
          onChange={(e) => setFilter({ sensorFamily: e.target.value as SensorFamily | 'ALL' })}
          className="text-[11px] px-1.5 h-7"
        >
          {FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {/* Ack status */}
        <select
          value={filter.acknowledged}
          onChange={(e) =>
            setFilter({ acknowledged: e.target.value as 'ALL' | 'UNACKED' | 'ACKED' })
          }
          className="text-[11px] px-1.5 h-7"
        >
          <option value="ALL">All</option>
          <option value="UNACKED">Unacknowledged</option>
          <option value="ACKED">Acknowledged</option>
        </select>

        {/* Refresh from server */}
        <button
          onClick={() => void loadAlerts({ page: pagination.page, limit: pagination.limit })}
          disabled={loading}
          title="Reload from server"
          className="text-[11px] px-2 h-7 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors disabled:opacity-40"
        >
          ↻
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExport}
          title="Export to CSV"
          data-testid="export-csv-btn"
          className="text-[11px] px-2 h-7 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors"
        >
          ⬇ CSV
        </button>

        <span className="ml-auto text-[10px] text-text-secondary">
          {displayed.length} shown
        </span>
      </div>

      {/* Alert list — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {displayed.length === 0 ? (
          <div className="no-data">
            <span className="no-data-icon">🔕</span>
            <span>No alerts match current filters</span>
          </div>
        ) : (
          displayed.map((alert) => (
            <div key={alert.id} className="flex items-start">
              <label className="pt-2 pl-2 pr-1 flex-shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.has(alert.id)}
                  onChange={() => toggleSelected(alert.id)}
                  className="w-3 h-3 cursor-pointer"
                  aria-label={`Select alert ${alert.id}`}
                />
              </label>
              <div className="flex-1 min-w-0">
                <AlertRow alert={alert} onAck={handleAck} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination footer */}
      {pagination.total > 0 && (
        <div
          data-testid="alert-pagination"
          className="flex items-center justify-between px-3 py-1.5 border-t border-border-color bg-panel-header-bg shrink-0"
        >
          <button
            onClick={() => handlePageChange(-1)}
            disabled={pagination.page <= 1 || loading}
            className="text-[11px] px-2 h-6 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors disabled:opacity-40"
          >
            ‹ Prev
          </button>
          <span className="text-[11px] text-text-secondary">
            Page {pagination.page} / {totalPages} — {pagination.total} total
          </span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.page >= totalPages || loading}
            className="text-[11px] px-2 h-6 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  )
}
