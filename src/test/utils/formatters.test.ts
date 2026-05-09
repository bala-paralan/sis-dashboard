import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatTimestamp,
  formatRelativeTime,
  formatQualityScore,
  getThreatLevelColor,
  getSensorFamilyColor,
  formatCoords,
  alertsToCSV,
  alertExportFilename,
  type AlertCSVRow,
} from '@/utils/formatters'

// ---------------------------------------------------------------------------
// formatTimestamp
// ---------------------------------------------------------------------------
describe('formatTimestamp', () => {
  it('returns HH:mm:ss UTC format for a valid ISO string', () => {
    expect(formatTimestamp('2026-04-11T10:30:45.000Z')).toBe('10:30:45 UTC')
  })

  it('handles midnight correctly — returns 00:00:00 UTC', () => {
    expect(formatTimestamp('2026-04-11T00:00:00.000Z')).toBe('00:00:00 UTC')
  })

  it('returns a UTC-suffixed string for an invalid input', () => {
    // The implementation does not throw for invalid strings — it produces
    // NaN-based segments. We verify the result contains "UTC" to confirm the
    // function always returns a string in the expected shape.
    const result = formatTimestamp('')
    expect(result).toContain('UTC')
  })
})

// ---------------------------------------------------------------------------
// formatRelativeTime
// ---------------------------------------------------------------------------
describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-11T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Xs ago" for a timestamp less than 60 seconds ago', () => {
    const ts = new Date(Date.now() - 30 * 1000).toISOString()
    expect(formatRelativeTime(ts)).toBe('30s ago')
  })

  it('returns "Xm ago" for a timestamp less than 1 hour ago', () => {
    const ts = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    expect(formatRelativeTime(ts)).toBe('15m ago')
  })

  it('returns "Xh ago" for a timestamp less than 24 hours ago', () => {
    const ts = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(ts)).toBe('3h ago')
  })

  it('returns "Xd ago" for a timestamp more than 24 hours ago', () => {
    const ts = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(ts)).toBe('2d ago')
  })
})

// ---------------------------------------------------------------------------
// formatQualityScore
// ---------------------------------------------------------------------------
describe('formatQualityScore', () => {
  it('1.0 returns "100%"', () => {
    expect(formatQualityScore(1.0)).toBe('100%')
  })

  it('0.5 returns "50%"', () => {
    expect(formatQualityScore(0.5)).toBe('50%')
  })

  it('0.842 returns "84%"', () => {
    expect(formatQualityScore(0.842)).toBe('84%')
  })

  it('0.0 returns "0%"', () => {
    expect(formatQualityScore(0.0)).toBe('0%')
  })
})

// ---------------------------------------------------------------------------
// getThreatLevelColor
// ---------------------------------------------------------------------------
describe('getThreatLevelColor', () => {
  it('"CRITICAL" returns "var(--alert-critical)"', () => {
    expect(getThreatLevelColor('CRITICAL')).toBe('var(--alert-critical)')
  })

  it('"HIGH" returns "var(--alert-high)"', () => {
    expect(getThreatLevelColor('HIGH')).toBe('var(--alert-high)')
  })

  it('"MEDIUM" returns "var(--alert-medium)"', () => {
    expect(getThreatLevelColor('MEDIUM')).toBe('var(--alert-medium)')
  })

  it('"LOW" returns "var(--alert-low)"', () => {
    expect(getThreatLevelColor('LOW')).toBe('var(--alert-low)')
  })

  it('"CLEAR" returns a defined non-empty string', () => {
    const result = getThreatLevelColor('CLEAR')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('an unknown input returns "var(--text-secondary)"', () => {
    expect(getThreatLevelColor('UNKNOWN_LEVEL')).toBe('var(--text-secondary)')
  })

  it('is case-insensitive — "critical" matches "CRITICAL"', () => {
    expect(getThreatLevelColor('critical')).toBe(getThreatLevelColor('CRITICAL'))
  })
})

// ---------------------------------------------------------------------------
// getSensorFamilyColor
// ---------------------------------------------------------------------------
describe('getSensorFamilyColor', () => {
  it('"Seismic" returns "var(--sensor-seismic)"', () => {
    expect(getSensorFamilyColor('Seismic')).toBe('var(--sensor-seismic)')
  })

  it('"Acoustic" returns "var(--sensor-acoustic)"', () => {
    expect(getSensorFamilyColor('Acoustic')).toBe('var(--sensor-acoustic)')
  })

  it('"Optical" returns "var(--sensor-optical)"', () => {
    expect(getSensorFamilyColor('Optical')).toBe('var(--sensor-optical)')
  })

  it('"Radar" returns "var(--sensor-radar)"', () => {
    expect(getSensorFamilyColor('Radar')).toBe('var(--sensor-radar)')
  })

  it('"Magnetic" returns "var(--sensor-magnetic)"', () => {
    expect(getSensorFamilyColor('Magnetic')).toBe('var(--sensor-magnetic)')
  })

  it('"Chemical" returns "var(--sensor-chemical)"', () => {
    expect(getSensorFamilyColor('Chemical')).toBe('var(--sensor-chemical)')
  })

  it('an unknown family returns "var(--text-secondary)"', () => {
    expect(getSensorFamilyColor('Unknown')).toBe('var(--text-secondary)')
  })
})

// ---------------------------------------------------------------------------
// formatCoords
// ---------------------------------------------------------------------------
describe('formatCoords', () => {
  it('positive lat and lon produce "N" and "E" direction suffixes', () => {
    const result = formatCoords(21.9452, 88.1234)
    expect(result).toContain('N')
    expect(result).toContain('E')
  })

  it('negative lat and lon produce "S" and "W" direction suffixes', () => {
    const result = formatCoords(-33.8688, -70.6693)
    expect(result).toContain('S')
    expect(result).toContain('W')
  })

  it('formats coordinates to 4 decimal places', () => {
    const result = formatCoords(21.9452, 88.1234)
    // Each coordinate segment should have exactly 4 decimal digits
    const parts = result.split(', ')
    expect(parts[0]).toMatch(/\d+\.\d{4}°[NS]/)
    expect(parts[1]).toMatch(/\d+\.\d{4}°[EW]/)
  })

  it('(21.9452, 88.1234) formats to "21.9452°N, 88.1234°E"', () => {
    expect(formatCoords(21.9452, 88.1234)).toBe('21.9452°N, 88.1234°E')
  })
})

// ---------------------------------------------------------------------------
// alertsToCSV
// ---------------------------------------------------------------------------
const sampleAlerts: AlertCSVRow[] = [
  {
    id: 'ALT-001',
    timestamp: '2026-05-09T10:30:00.000Z',
    classification: 'INTRUSION_DETECTED',
    threat_level: 'HIGH',
    sensor_family: 'Seismic',
    location: 'Sector 4 SW',
    acknowledged: false,
  },
  {
    id: 'ALT-002',
    timestamp: '2026-05-09T10:31:00.000Z',
    classification: 'ANIMAL_CROSSING',
    threat_level: 'LOW',
    sensor_family: 'Acoustic',
    location: 'Sector 1 NW',
    acknowledged: true,
  },
]

describe('alertsToCSV', () => {
  it('includes a header row as the first line', () => {
    const csv = alertsToCSV(sampleAlerts)
    const firstLine = csv.split('\n')[0]
    expect(firstLine).toBe('id,timestamp,classification,threat_level,sensor_family,location,acknowledged')
  })

  it('produces N+1 lines (header + one row per alert)', () => {
    const csv = alertsToCSV(sampleAlerts)
    const lines = csv.split('\n')
    expect(lines).toHaveLength(sampleAlerts.length + 1)
  })

  it('encodes the alert id in the correct column', () => {
    const csv = alertsToCSV(sampleAlerts)
    const dataRow = csv.split('\n')[1]
    expect(dataRow.startsWith('ALT-001,')).toBe(true)
  })

  it('encodes the acknowledged boolean as a string', () => {
    const csv = alertsToCSV(sampleAlerts)
    const rows = csv.split('\n').slice(1)
    expect(rows[0]).toContain('false')
    expect(rows[1]).toContain('true')
  })

  it('escapes values that contain commas with double-quotes', () => {
    const withComma: AlertCSVRow[] = [
      {
        id: 'ALT-003',
        timestamp: '2026-05-09T10:32:00.000Z',
        classification: 'EVENT, CRITICAL',
        threat_level: 'CRITICAL',
        sensor_family: 'Optical',
        location: 'Gate, NW',
        acknowledged: false,
      },
    ]
    const csv = alertsToCSV(withComma)
    const row = csv.split('\n')[1]
    expect(row).toContain('"EVENT, CRITICAL"')
    expect(row).toContain('"Gate, NW"')
  })

  it('returns only a header row when alerts array is empty', () => {
    const csv = alertsToCSV([])
    const lines = csv.split('\n').filter(Boolean)
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('id')
  })
})

// ---------------------------------------------------------------------------
// alertExportFilename
// ---------------------------------------------------------------------------
describe('alertExportFilename', () => {
  it('returns a string starting with "sis-alerts-"', () => {
    expect(alertExportFilename()).toMatch(/^sis-alerts-/)
  })

  it('returns a filename ending with ".csv"', () => {
    expect(alertExportFilename()).toMatch(/\.csv$/)
  })

  it('embeds the current date in YYYY-MM-DD format', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(alertExportFilename()).toContain(today)
  })
})
