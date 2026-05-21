import type { Alert } from '@/types/sensors'

function escapeCsv(value: string | boolean | undefined | null): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportAlertsCSV(alerts: Alert[]): void {
  const header = ['id', 'timestamp', 'threat_level', 'sensor_family', 'message', 'acknowledged']
  const rows = alerts.map((a) => [
    escapeCsv(a.id),
    escapeCsv(a.timestamp),
    escapeCsv(a.threat_level),
    escapeCsv(a.sensor_family),
    escapeCsv(a.description),
    escapeCsv(a.acknowledged),
  ])

  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
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
