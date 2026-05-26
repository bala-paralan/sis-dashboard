import type { Alert } from '@/types/sensors'

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function exportAlertsCSV(alerts: Alert[]): void {
  const headers = ['id', 'timestamp', 'threat_level', 'sensor_family', 'classification', 'location', 'acknowledged', 'description']

  const rows = alerts.map((a) =>
    [
      a.id,
      a.timestamp,
      a.threat_level,
      a.sensor_family ?? '',
      a.classification,
      a.location,
      String(a.acknowledged),
      a.description,
    ].map((v) => csvEscape(String(v ?? '')))
     .join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `alerts-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
