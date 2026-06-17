import type { Alert } from '@/types/sensors'

function escapeCsv(value: string | boolean | undefined): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const CSV_HEADER = 'id,timestamp,threat_level,sensor_family,location,classification,description,acknowledged'

export function buildAlertsCsv(alerts: Alert[]): string {
  const rows = alerts.map((a) => [
    escapeCsv(a.id),
    escapeCsv(a.timestamp),
    escapeCsv(a.threat_level),
    escapeCsv(a.sensor_family),
    escapeCsv(a.location),
    escapeCsv(a.classification),
    escapeCsv(a.description),
    escapeCsv(String(a.acknowledged)),
  ].join(','))
  return [CSV_HEADER, ...rows].join('\n')
}

export function downloadAlertsCsv(alerts: Alert[]): void {
  const csv = buildAlertsCsv(alerts)
  const date = new Date().toISOString().slice(0, 10)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `alerts-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
