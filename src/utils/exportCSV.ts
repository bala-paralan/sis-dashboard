import type { Alert } from '@/types/sensors'

function escapeCsvField(value: string | boolean | number | null | undefined): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export const CSV_HEADERS = ['id', 'timestamp', 'threat_level', 'sensor_family', 'message', 'acknowledged']

export function buildAlertsCSV(alerts: Alert[]): string {
  const rows = alerts.map((a) => [
    escapeCsvField(a.id),
    escapeCsvField(a.timestamp),
    escapeCsvField(a.threat_level),
    escapeCsvField(a.sensor_family ?? ''),
    escapeCsvField(a.description ?? ''),
    escapeCsvField(a.acknowledged),
  ].join(','))
  return [CSV_HEADERS.join(','), ...rows].join('\n')
}

export function exportAlertsCSV(alerts: Alert[]): void {
  const csv = buildAlertsCSV(alerts)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `alerts_${date}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
