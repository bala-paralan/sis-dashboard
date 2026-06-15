import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useAlertStore } from '@/store/alertStore'
import { useSettingsStore } from '@/store/settingsStore'
import { AlertRow } from '@/components/widgets/AlertRow'
import { exportAlertsCSV } from '@/utils/exporters'
import type { ThreatLevel, SensorFamily } from '@/types/sensors'

const THREAT_LEVELS: (ThreatLevel | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const FAMILIES: (SensorFamily | 'ALL')[] = [
  'ALL', 'Seismic', 'Acoustic', 'Optical', 'Radar', 'Magnetic', 'Chemical',
]
const TIME_RANGES = [
  { value: '1h',  label: 'Last 1h'  },
  { value: '6h',  label: 'Last 6h'  },
  { value: '24h', label: 'Last 24h' },
  { value: 'ALL', label: 'All time' },
] as const

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'var(--alert-critical)',
  HIGH:     'var(--alert-high)',
  MEDIUM:   'var(--alert-medium)',
  LOW:      'var(--alert-low)',
  ALL:      'var(--text-secondary)',
}

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
      <polyline points={pts} fill="none" stroke="var(--alert-high)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${H} ${pts} ${W},${H}`} fill="var(--alert-high)" fillOpacity={0.12} stroke="none" />
    </svg>
  )
}

export function AlertPanel() {
  const allAlerts = useAlertStore((s) => s.alerts)
  const filter = useAlertStore((s) => s.filter)
  const setFilter = useAlertStore((s) => s.setFilter)
  const filteredAlerts = useAlertStore((s) => s.filteredAlerts)
  const acknowledgeAlert = useAlertStore((s) => s.acknowledgeAlert)
  const acknowledgeAll = useAlertStore((s) => s.acknowledgeAll)
  const maxAlerts = useSettingsStore((s) => s.panelSettings.alertPanel.maxAlerts)

  const prevCountRef = useRef(0)
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

  useEffect(() => {
    const critHigh = allAlerts.filter(
      (a) => !a.acknowledged && (a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH')
    ).length
    if (critHigh > prevCountRef.current) playBeep()
    prevCountRef.current = critHigh
  }, [allAlerts])

  const displayed = useMemo(
    () => filteredAlerts().slice(0, maxAlerts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredAlerts, filter, allAlerts, maxAlerts]
  )

  const handleAck = (id: string) => acknowledgeAlert(id, '')

  const critCount = allAlerts.filter((a) => !a.acknowledged && a.threat_level === 'CRITICAL').length
  const unackedVisible = displayed.filter((a) => !a.acknowledged).length

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="py-1 px-3 border-b border-border-color text-[13px] font-semibold text-text-secondary bg-panel-header-bg flex items-center justify-between shrink-0">
        <span className="flex items-center gap-2">
          {critCount > 0 && (
            <span className="badge badge-critical" style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}>
              {critCount} CRITICAL
            </span>
          )}
        </span>
        <AlertSparkline data={sparkData} />
      </div>

      {/* Filter bar */}
      <div className="py-1.5 px-3 border-b border-border-color flex flex-wrap gap-1.5 items-center shrink-0 bg-bg-secondary">
        {/* Threat level chips */}
        <div className="flex gap-1 flex-wrap" role="group" aria-label="Filter by threat level">
          {THREAT_LEVELS.map((lvl) => {
            const active = filter.threatLevel === lvl
            const color = LEVEL_COLORS[lvl] ?? 'var(--text-secondary)'
            return (
              <button
                key={lvl}
                onClick={() => setFilter({ threatLevel: lvl })}
                aria-pressed={active}
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
          aria-label="Filter by sensor family"
          className="text-[11px] px-1.5 h-7"
        >
          {FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Ack status */}
        <select
          value={filter.acknowledged}
          onChange={(e) => setFilter({ acknowledged: e.target.value as 'ALL' | 'UNACKED' | 'ACKED' })}
          aria-label="Filter by acknowledgement status"
          className="text-[11px] px-1.5 h-7"
        >
          <option value="ALL">All</option>
          <option value="UNACKED">Unacknowledged</option>
          <option value="ACKED">Acknowledged</option>
        </select>

        {/* Time range */}
        <select
          value={filter.timeRange}
          onChange={(e) => setFilter({ timeRange: e.target.value as '1h' | '6h' | '24h' | 'ALL' })}
          aria-label="Filter by time range"
          className="text-[11px] px-1.5 h-7"
        >
          {TIME_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        {/* Ack All */}
        {unackedVisible > 0 && (
          <button
            onClick={acknowledgeAll}
            aria-label={`Acknowledge all ${unackedVisible} visible alerts`}
            className="text-[10px] font-bold px-[10px] h-7 rounded cursor-pointer transition-all duration-150 inline-flex items-center"
            style={{
              border: '1px solid var(--alert-medium)',
              background: 'rgba(245,158,11,0.1)',
              color: 'var(--alert-medium)',
            }}
          >
            Ack All ({unackedVisible})
          </button>
        )}

        {/* Export CSV */}
        <button
          onClick={() => exportAlertsCSV(displayed)}
          disabled={displayed.length === 0}
          aria-label="Export visible alerts as CSV"
          className="text-[10px] font-bold px-[10px] h-7 rounded cursor-pointer transition-all duration-150 inline-flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--text-secondary)',
          }}
        >
          ↓ Export CSV
        </button>

        <span className="ml-auto text-[10px] text-text-secondary">
          {displayed.length} shown
        </span>
      </div>

      {/* Alert list */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {displayed.length === 0 ? (
          <div className="no-data">
            <span className="no-data-icon">🔕</span>
            <span>No alerts match current filters</span>
          </div>
        ) : (
          displayed.map((alert) => (
            <AlertRow key={alert.id} alert={alert} onAck={handleAck} />
          ))
        )}
      </div>
    </div>
  )
}
