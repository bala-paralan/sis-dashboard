import type { Alert } from '@/types/sensors'

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function alertsToCSV(alerts: Alert[]): string {
  const header = ['Timestamp', 'Severity', 'Sensor', 'Classification', 'Location', 'Description', 'Status']
  const rows = alerts.map((a) => [
    a.timestamp,
    a.threat_level,
    a.source_sensors.join('; '),
    a.classification,
    a.location,
    a.description,
    a.acknowledged ? 'Acknowledged' : 'Unacknowledged',
  ].map(escapeCsvCell).join(','))
  return [header.join(','), ...rows].join('\n')
}

export function toJSON(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function formatExportTimestamp(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
}
