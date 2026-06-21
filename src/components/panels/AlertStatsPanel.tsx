import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAlertStore } from '@/store/alertStore'
import { getThreatLevelColor } from '@/utils/formatters'
import type { ThreatLevel } from '@/types/sensors'

const SEVERITY_LEVELS: ThreatLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

const SEVERITY_BG: Record<ThreatLevel, string> = {
  CRITICAL: 'rgba(239,68,68,0.12)',
  HIGH:     'rgba(249,115,22,0.12)',
  MEDIUM:   'rgba(234,179,8,0.12)',
  LOW:      'rgba(34,197,94,0.12)',
}

const SENSOR_FAMILIES = ['Seismic', 'Acoustic', 'Optical', 'Radar', 'Magnetic', 'Chemical']

const FAMILY_COLORS: Record<string, string> = {
  Seismic:   '#6366f1',
  Acoustic:  '#06b6d4',
  Optical:   '#f59e0b',
  Radar:     '#10b981',
  Magnetic:  '#8b5cf6',
  Chemical:  '#ef4444',
}

export function AlertStatsPanel() {
  const alerts = useAlertStore((s) => s.alerts)

  const stats = useMemo(() => {
    const total = alerts.length
    const acked = alerts.filter((a) => a.acknowledged).length
    const unacked = total - acked
    const ackRate = total > 0 ? Math.round((acked / total) * 100) : 0

    const bySeverity: Record<ThreatLevel, number> = {
      CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0,
    }
    for (const a of alerts) {
      if (a.threat_level in bySeverity) bySeverity[a.threat_level as ThreatLevel]++
    }

    const byFamily: Record<string, number> = {}
    for (const f of SENSOR_FAMILIES) byFamily[f] = 0
    for (const a of alerts) {
      if (a.sensor_family && a.sensor_family in byFamily) byFamily[a.sensor_family]++
    }

    const familyData = SENSOR_FAMILIES.map((f) => ({ name: f, count: byFamily[f] })).filter((d) => d.count > 0)

    const recent = [...alerts].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5)

    return { total, acked, unacked, ackRate, bySeverity, familyData, recent }
  }, [alerts])

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {/* Severity cards */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
          By Severity
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {SEVERITY_LEVELS.map((level) => (
            <div
              key={level}
              data-testid={`severity-card-${level}`}
              style={{
                background: SEVERITY_BG[level],
                border: `1px solid ${getThreatLevelColor(level)}40`,
                borderRadius: 8,
                padding: '10px 8px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: getThreatLevelColor(level),
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                {stats.bySeverity[level]}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: getThreatLevelColor(level), marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {level}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acknowledgement rate */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>
          Acknowledgement Rate
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}
          >
            <div
              data-testid="ack-rate-bar"
              style={{
                height: '100%',
                width: `${stats.ackRate}%`,
                background: stats.ackRate > 75 ? 'var(--sensor-acoustic)' : stats.ackRate > 40 ? 'var(--alert-medium)' : 'var(--alert-critical)',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {stats.ackRate}%
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
            ({stats.acked}/{stats.total})
          </span>
        </div>
      </div>

      {/* Sensor family breakdown */}
      {stats.familyData.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
            By Sensor Family
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.familyData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={58} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.familyData.map((entry) => (
                    <Cell key={entry.name} fill={FAMILY_COLORS[entry.name] ?? '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent alerts */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>
          Recent Alerts
        </div>
        {stats.recent.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>No alerts yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stats.recent.map((a) => (
              <div
                key={a.id}
                data-testid={`recent-alert-${a.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 6,
                  borderLeft: `3px solid ${getThreatLevelColor(a.threat_level as ThreatLevel)}`,
                  opacity: a.acknowledged ? 0.5 : 1,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: getThreatLevelColor(a.threat_level as ThreatLevel),
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    flexShrink: 0,
                  }}
                >
                  {a.threat_level}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.description ?? a.sensor_family}
                </span>
                {a.acknowledged && (
                  <span style={{ fontSize: 9, color: 'var(--sensor-acoustic)', flexShrink: 0 }}>ACK</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
