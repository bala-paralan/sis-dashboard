import type { Alert } from '@/types/sensors'

function escapeCSV(value: string | boolean | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportAlertsCSV(alerts: Alert[]): void {
  const headers = ['id', 'timestamp', 'threat_level', 'sensor_family', 'message', 'acknowledged']
  const rows = alerts.map((a) => [
    escapeCSV(a.id),
    escapeCSV(a.timestamp),
    escapeCSV(a.threat_level),
    escapeCSV(a.sensor_family ?? ''),
    escapeCSV(a.description),
    escapeCSV(a.acknowledged),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `alerts_${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
