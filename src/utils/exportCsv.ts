import type { Alert } from '@/types/sensors'

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function alertsToCsv(alerts: Alert[]): string {
  const headers = ['timestamp', 'threat_level', 'classification', 'location', 'sensor_family', 'source_sensors', 'acknowledged', 'annotation', 'description']
  const rows = alerts.map((a) => [
    a.timestamp,
    a.threat_level,
    a.classification,
    a.location,
    a.sensor_family ?? '',
    a.source_sensors.join('; '),
    a.acknowledged ? 'YES' : 'NO',
    a.annotation ?? '',
    a.description,
  ].map(escapeCsv).join(','))
  return [headers.join(','), ...rows].join('\n')
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
