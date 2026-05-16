import type { Alert } from '@/types/sensors'

const CSV_HEADERS = [
  'id', 'timestamp', 'threat_level', 'classification',
  'location', 'source_sensors', 'acknowledged', 'description',
]

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportAlertsToCSV(alerts: Alert[]): string {
  const rows = alerts.map((a) => [
    a.id,
    a.timestamp,
    a.threat_level,
    a.classification,
    a.location ?? '',
    a.source_sensors.join(';'),
    String(a.acknowledged),
    a.description ?? '',
  ].map(escapeCell).join(','))

  return [CSV_HEADERS.join(','), ...rows].join('\n')
}

export function downloadAlertsCSV(alerts: Alert[]): void {
  const csv = exportAlertsToCSV(alerts)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `alerts_${date}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
