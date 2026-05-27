import type { Alert } from '@/types/sensors'

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportAlerts(alerts: Alert[], format: 'csv' | 'json'): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `alerts_${timestamp}.${format}`

  let content: string
  let mimeType: string

  if (format === 'json') {
    content = JSON.stringify(alerts, null, 2)
    mimeType = 'application/json'
  } else {
    const headers = ['id', 'timestamp', 'threat_level', 'sensor_family', 'sensor_id', 'message', 'acknowledged']
    const rows = alerts.map((a) => [
      escapeCSV(a.id),
      escapeCSV(a.timestamp),
      escapeCSV(a.threat_level),
      escapeCSV(a.sensor_family ?? ''),
      escapeCSV(a.source_sensors.join(';')),
      escapeCSV(a.description),
      String(a.acknowledged),
    ])
    content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    mimeType = 'text/csv'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
