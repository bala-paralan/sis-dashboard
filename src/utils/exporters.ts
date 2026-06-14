import type { Alert } from '@/types/sensors'
import type { Track } from '@/types/sensors'

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAlertsCSV(alerts: Alert[]): void {
  const header = 'id,timestamp,threat_level,classification,location,sensor_family,acknowledged'
  const rows = alerts.map((a) =>
    [
      a.id,
      a.timestamp,
      a.threat_level,
      a.classification,
      a.location,
      a.sensor_family ?? '',
      a.acknowledged ? 'true' : 'false',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )
  const csv = [header, ...rows].join('\n')
  triggerDownload(csv, `alerts-${Date.now()}.csv`, 'text/csv')
}

export function exportIncidentPDF(): void {
  window.print()
}

export function exportTracksKML(tracks: Track[]): void {
  const placemarks = tracks
    .map(
      (t) => `
  <Placemark>
    <name>${t.track_id}</name>
    <description>Class: ${t.class} | Confidence: ${t.confidence}% | Range: ${t.range_m}m</description>
    <Point>
      <coordinates>${t.lon},${t.lat},0</coordinates>
    </Point>
  </Placemark>`
    )
    .join('')

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>UAS Tracks Export</name>
    <description>Exported ${new Date().toISOString()}</description>${placemarks}
  </Document>
</kml>`

  triggerDownload(kml, `tracks-${Date.now()}.kml`, 'application/vnd.google-earth.kml+xml')
}
