import type { Alert } from '@/types/sensors'

const COLUMNS = ['id', 'timestamp', 'threat_level', 'sensor_family', 'message', 'acknowledged'] as const

function escape(value: string | boolean | undefined): string {
  const s = value === undefined ? '' : String(value)
  // Wrap in double-quotes if the value contains commas, newlines, or double-quotes
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportAlertsCSV(alerts: Alert[]): string {
  const header = COLUMNS.join(',')
  const rows = alerts.map((a) =>
    [
      escape(a.id),
      escape(a.timestamp),
      escape(a.threat_level),
      escape(a.sensor_family),
      escape(a.description),
      escape(a.acknowledged),
    ].join(',')
  )
  return [header, ...rows].join('\n')
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
