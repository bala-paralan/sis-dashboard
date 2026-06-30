import type { Alert } from '@/types/sensors'

export function alertsToCsv(alerts: Alert[]): string {
  const headers = ['ID', 'Timestamp', 'Threat Level', 'Classification', 'Location', 'Source Sensors', 'Acknowledged', 'Description']
  const rows = alerts.map((a) => [
    a.id,
    a.timestamp,
    a.threat_level,
    a.classification,
    a.location,
    a.source_sensors.join('; '),
    a.acknowledged ? 'Yes' : 'No',
    `"${a.description.replace(/"/g, '""')}"`,
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export interface IncidentReport {
  id: string
  timestamp: string
  title: string
  location: string
  severity: string
  reporter: string
  description: string
  actions: string
}

export function reportToText(report: IncidentReport): string {
  return [
    `INCIDENT REPORT — ${report.id}`,
    `Generated: ${report.timestamp}`,
    '',
    `Title:    ${report.title}`,
    `Location: ${report.location}`,
    `Severity: ${report.severity}`,
    `Reporter: ${report.reporter}`,
    '',
    'Description:',
    report.description,
    '',
    'Actions Taken:',
    report.actions,
  ].join('\n')
}

export function downloadText(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
