import type { Alert } from '@/types/sensors'

function escapeField(val: string | number | boolean): string {
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildAlertsCSV(alerts: Alert[]): string {
  const headers = ['id', 'timestamp', 'threat_level', 'sensor_family', 'message', 'acknowledged']
  const rows = alerts.map((a) => [
    escapeField(a.id),
    escapeField(a.timestamp),
    escapeField(a.threat_level),
    escapeField(a.sensor_family ?? ''),
    escapeField(a.description),
    escapeField(a.acknowledged),
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function exportAlertsCSV(alerts: Alert[]): void {
  const csv = buildAlertsCSV(alerts)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `alerts_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
