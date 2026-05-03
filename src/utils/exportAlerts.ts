import type { Alert } from '@/types/sensors'

const CSV_HEADERS = [
  'id', 'timestamp', 'classification', 'threat_level',
  'sensor_family', 'location', 'acknowledged',
]

function escapeCSV(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function alertsToCSV(alerts: Alert[]): string {
  const rows = alerts.map((a) => [
    a.id,
    a.timestamp,
    a.classification,
    a.threat_level,
    a.sensor_family ?? '',
    a.location ?? '',
    a.acknowledged ? 'true' : 'false',
  ].map(escapeCSV).join(','))

  return [CSV_HEADERS.join(','), ...rows].join('\n')
}

export function alertsToJSON(alerts: Alert[]): string {
  return JSON.stringify(alerts, null, 2)
}

function dateSuffix(): string {
  return new Date().toISOString().slice(0, 10)
}

export function downloadAlerts(alerts: Alert[], format: 'csv' | 'json'): void {
  const content = format === 'csv' ? alertsToCSV(alerts) : alertsToJSON(alerts)
  const mime = format === 'csv' ? 'text/csv' : 'application/json'
  const filename = `alerts_${dateSuffix()}.${format}`

  const blob = new Blob([content], { type: `${mime};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
