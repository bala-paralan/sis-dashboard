import type { Alert } from '@/types/sensors'

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
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
      `"${a.classification.replace(/"/g, '""')}"`,
      `"${a.location.replace(/"/g, '""')}"`,
      a.sensor_family ?? '',
      a.acknowledged ? 'true' : 'false',
    ].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  triggerDownload(csv, `sis-alerts-${ts}.csv`, 'text/csv;charset=utf-8')
}

export function exportIncidentPDF(incidentTitle: string, body: string): void {
  const win = window.open('', '_blank', 'width=800,height=600')
  if (!win) return
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${incidentTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20mm; color: #000; }
    h1 { font-size: 16px; border-bottom: 2px solid #000; padding-bottom: 4px; }
    h2 { font-size: 13px; margin-top: 12px; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 11px; }
    .footer { margin-top: 20px; font-size: 10px; color: #555; border-top: 1px solid #ccc; padding-top: 6px; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <h1>IINVSYS SIS — Incident Report</h1>
  <h2>${incidentTitle}</h2>
  <pre>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  <div class="footer">
    Generated: ${new Date().toUTCString()} | Classification: RESTRICTED
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`)
  win.document.close()
}

interface KMLTrack {
  id: string
  bearing: number
  ts: number
  lat?: number
  lon?: number
}

export function exportTracksKML(tracks: KMLTrack[]): void {
  const placemarks = tracks
    .map((t) => {
      const lat = t.lat ?? 0
      const lon = t.lon ?? 0
      const time = new Date(t.ts).toISOString()
      return `    <Placemark>
      <name>UAS-${t.id}</name>
      <description>Bearing: ${t.bearing.toFixed(1)}° | Time: ${time}</description>
      <TimeStamp><when>${time}</when></TimeStamp>
      <Point><coordinates>${lon},${lat},0</coordinates></Point>
    </Placemark>`
    })
    .join('\n')

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>SIS UAS Track Export</name>
    <description>Exported ${new Date().toUTCString()}</description>
${placemarks}
  </Document>
</kml>`
  const ts = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  triggerDownload(kml, `sis-tracks-${ts}.kml`, 'application/vnd.google-earth.kml+xml')
}
