import type { Alert } from '@/types/sensors'

export function csvEscape(value: string | undefined | null): string {
  const s = value == null ? '' : String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function buildAlertsCSV(alerts: Alert[]): string {
  const header = ['id', 'timestamp', 'threat_level', 'sensor_family', 'classification', 'location', 'acknowledged', 'description']
  const rows = alerts.map((a) => [
    a.id,
    a.timestamp,
    a.threat_level,
    a.sensor_family ?? '',
    a.classification,
    a.location,
    a.acknowledged ? 'true' : 'false',
    a.description,
  ].map(csvEscape).join(','))
  return [header.join(','), ...rows].join('\n')
}

export function exportAlertsCSV(alerts: Alert[]): void {
  const csv = buildAlertsCSV(alerts)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const a = document.createElement('a')
  a.href = url
  a.download = `alerts-${ts}.csv`
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
