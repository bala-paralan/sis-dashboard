import type { Alert } from '@/types/sensors'

export const CSV_HEADERS = [
  'id',
  'timestamp',
  'threat_level',
  'classification',
  'sensor_family',
  'source_sensors',
  'location',
  'description',
  'acknowledged',
  'annotation',
  'escalated',
  'ai_model',
] as const

function escapeCell(value: string | number | boolean | undefined | null): string {
  if (value == null) return ''
  const str = String(value)
  // Wrap in quotes if the value contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function alertToRow(alert: Alert): string {
  return [
    alert.id,
    alert.timestamp,
    alert.threat_level,
    alert.classification,
    alert.sensor_family ?? '',
    alert.source_sensors.join(';'),
    alert.location,
    alert.description,
    alert.acknowledged,
    alert.annotation ?? '',
    alert.escalated ?? false,
    alert.ai_model ?? '',
  ]
    .map(escapeCell)
    .join(',')
}

export function buildAlertsCSV(alerts: Alert[]): string {
  const header = CSV_HEADERS.join(',')
  const rows = alerts.map(alertToRow)
  return [header, ...rows].join('\n')
}

export function exportAlertsToCSV(alerts: Alert[], filename?: string): void {
  if (alerts.length === 0) return

  const csv = buildAlertsCSV(alerts)
  const date = new Date().toISOString().slice(0, 10)
  const name = filename ?? `sis-alerts-${date}.csv`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
