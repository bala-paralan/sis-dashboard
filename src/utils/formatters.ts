export function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    const hh = String(d.getUTCHours()).padStart(2, '0')
    const mm = String(d.getUTCMinutes()).padStart(2, '0')
    const ss = String(d.getUTCSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss} UTC`
  } catch {
    return '--:--:-- UTC'
  }
}

export function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const secs = Math.floor(diff / 1000)
    if (secs < 60) return `${secs}s ago`
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  } catch {
    return 'unknown'
  }
}

export function formatQualityScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

export function getThreatLevelColor(level: string): string {
  switch (level.toUpperCase()) {
    case 'CRITICAL':
      return 'var(--alert-critical)'
    case 'HIGH':
      return 'var(--alert-high)'
    case 'MEDIUM':
      return 'var(--alert-medium)'
    case 'LOW':
      return 'var(--alert-low)'
    case 'CLEAR':
      return 'var(--sensor-acoustic)'
    default:
      return 'var(--text-secondary)'
  }
}

export function getSensorFamilyColor(family: string): string {
  switch (family) {
    case 'Seismic':
      return 'var(--sensor-seismic)'
    case 'Acoustic':
      return 'var(--sensor-acoustic)'
    case 'Optical':
      return 'var(--sensor-optical)'
    case 'Radar':
      return 'var(--sensor-radar)'
    case 'Magnetic':
      return 'var(--sensor-magnetic)'
    case 'Chemical':
      return 'var(--sensor-chemical)'
    default:
      return 'var(--text-secondary)'
  }
}

export function formatCoords(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`
}

// ── CSV export ────────────────────────────────────────────────────────────────

export interface AlertCSVRow {
  id: string
  timestamp: string
  classification: string
  threat_level: string
  sensor_family: string
  location: string
  acknowledged: boolean
}

export function alertsToCSV(alerts: AlertCSVRow[]): string {
  const HEADERS = ['id', 'timestamp', 'classification', 'threat_level', 'sensor_family', 'location', 'acknowledged']
  const escape = (v: string | boolean) => {
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = alerts.map((a) =>
    [a.id, a.timestamp, a.classification, a.threat_level, a.sensor_family, a.location, a.acknowledged]
      .map(escape)
      .join(',')
  )
  return [HEADERS.join(','), ...rows].join('\n')
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function alertExportFilename(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const hhmm = now.toTimeString().slice(0, 5).replace(':', '')
  return `sis-alerts-${date}_${hhmm}.csv`
}
