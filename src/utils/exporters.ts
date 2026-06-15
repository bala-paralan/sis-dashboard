import type { Alert } from '@/types/sensors'
import type { SensorPayload } from '@/types/sensors'

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeCSV(value: unknown): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportAlertsCSV(alerts: Alert[]): void {
  const isoDate = new Date().toISOString().slice(0, 10)
  const headers = ['timestamp', 'id', 'threat_level', 'sensor_family', 'description', 'acknowledged', 'annotation']
  const rows = alerts.map((a) =>
    [
      a.timestamp,
      a.id,
      a.threat_level,
      a.sensor_family ?? '',
      a.description ?? '',
      a.acknowledged ? 'true' : 'false',
      a.annotation ?? '',
    ].map(escapeCSV).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  downloadFile(csv, `alerts_${isoDate}.csv`, 'text/csv')
}

export function exportSensorHistoryJSON(sensorId: string, history: SensorPayload[]): void {
  const isoDate = new Date().toISOString().slice(0, 10)
  const json = JSON.stringify({ sensor_id: sensorId, exported_at: new Date().toISOString(), history }, null, 2)
  downloadFile(json, `sensor_${sensorId}_${isoDate}.json`, 'application/json')
}
