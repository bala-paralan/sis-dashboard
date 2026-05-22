import type { Alert } from '@/types/sensors'

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCsv(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportAlertsCsv(alerts: Alert[]): void {
  const headers = [
    'timestamp',
    'threat_level',
    'classification',
    'sensor_family',
    'description',
    'location',
    'source_sensors',
    'acknowledged',
    'acknowledged_by',
    'annotation',
  ]

  const rows = alerts.map((a) => [
    escapeCsv(a.timestamp),
    escapeCsv(a.threat_level),
    escapeCsv(a.classification),
    escapeCsv(a.sensor_family),
    escapeCsv(a.description),
    escapeCsv(a.location),
    escapeCsv(a.source_sensors.join('; ')),
    escapeCsv(a.acknowledged),
    escapeCsv(a.acknowledged_by),
    escapeCsv(a.annotation),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  downloadFile(csv, `sis-alerts-${timestamp}.csv`, 'text/csv;charset=utf-8;')
}

export function exportIncidentReport(alerts: Alert[], operator: string): void {
  const now = new Date()
  const utcStr = now.toUTCString()

  const byLevel: Record<string, number> = {}
  for (const a of alerts) {
    byLevel[a.threat_level] = (byLevel[a.threat_level] ?? 0) + 1
  }

  const sensorCounts: Record<string, number> = {}
  for (const a of alerts) {
    for (const s of a.source_sensors) {
      sensorCounts[s] = (sensorCounts[s] ?? 0) + 1
    }
  }
  const topSensors = Object.entries(sensorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const lines = [
    '='.repeat(60),
    'IINVSYS SIS — INCIDENT REPORT',
    '='.repeat(60),
    '',
    `Generated:     ${utcStr}`,
    `Operator:      ${operator}`,
    `Total Alerts:  ${alerts.length}`,
    '',
    '-'.repeat(40),
    'ALERT SUMMARY BY THREAT LEVEL',
    '-'.repeat(40),
    ...['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'].map(
      (lvl) => `  ${lvl.padEnd(10)} ${byLevel[lvl] ?? 0}`
    ),
    '',
    '-'.repeat(40),
    'TOP SENSORS TRIGGERED',
    '-'.repeat(40),
    ...topSensors.map(([sensor, count]) => `  ${sensor.padEnd(24)} ${count} alerts`),
    '',
    '-'.repeat(40),
    'ALERT LOG',
    '-'.repeat(40),
    ...alerts.map(
      (a) =>
        `  [${a.threat_level.padEnd(8)}] ${a.timestamp.slice(0, 19)}Z  ${a.classification}  ${a.description ?? ''}`
    ),
    '',
    '='.repeat(60),
    'END OF REPORT',
    '='.repeat(60),
  ]

  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  downloadFile(lines.join('\n'), `sis-incident-report-${timestamp}.txt`, 'text/plain;charset=utf-8;')
}
