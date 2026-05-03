import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { alertsToCSV, alertsToJSON, downloadAlerts } from '@/utils/exportAlerts'
import type { Alert } from '@/types/sensors'

function mockAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'alert-001',
    timestamp: '2026-05-03T10:00:00Z',
    source_sensors: ['S01-GEO-001'],
    location: '21.94, 88.12',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    sensor_family: 'Seismic',
    acknowledged: false,
    description: 'Test alert description',
    ...overrides,
  }
}

describe('alertsToCSV', () => {
  it('produces a header row as the first line', () => {
    const csv = alertsToCSV([])
    expect(csv.split('\n')[0]).toBe(
      'id,timestamp,classification,threat_level,sensor_family,location,acknowledged'
    )
  })

  it('produces one data row per alert', () => {
    const csv = alertsToCSV([mockAlert(), mockAlert({ id: 'alert-002' })])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3) // header + 2 data rows
  })

  it('includes all field values in the correct columns', () => {
    const csv = alertsToCSV([mockAlert()])
    const row = csv.split('\n')[1]
    expect(row).toContain('alert-001')
    expect(row).toContain('INTRUSION')
    expect(row).toContain('HIGH')
    expect(row).toContain('Seismic')
    expect(row).toContain('false')
  })

  it('renders acknowledged=true correctly', () => {
    const csv = alertsToCSV([mockAlert({ acknowledged: true })])
    expect(csv.split('\n')[1]).toContain('true')
  })

  it('handles null sensor_family with empty string', () => {
    const csv = alertsToCSV([mockAlert({ sensor_family: undefined })])
    const row = csv.split('\n')[1]
    // sensor_family column (index 4) should be empty
    const cols = row.split(',')
    expect(cols[4]).toBe('')
  })

  it('handles null location with empty string', () => {
    const csv = alertsToCSV([mockAlert({ location: undefined })])
    const row = csv.split('\n')[1]
    const cols = row.split(',')
    expect(cols[5]).toBe('')
  })

  it('escapes values that contain commas', () => {
    const csv = alertsToCSV([mockAlert({ classification: 'INTRUSION, BREACH' })])
    expect(csv).toContain('"INTRUSION, BREACH"')
  })

  it('escapes values that contain double-quotes', () => {
    const csv = alertsToCSV([mockAlert({ classification: 'Say "hello"' })])
    expect(csv).toContain('"Say ""hello"""')
  })

  it('returns only the header row for an empty array', () => {
    const csv = alertsToCSV([])
    expect(csv.split('\n')).toHaveLength(1)
  })
})

describe('alertsToJSON', () => {
  it('returns a valid JSON string', () => {
    const json = alertsToJSON([mockAlert()])
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('round-trips the alert data', () => {
    const alerts = [mockAlert(), mockAlert({ id: 'alert-002', threat_level: 'CRITICAL' })]
    const parsed = JSON.parse(alertsToJSON(alerts)) as Alert[]
    expect(parsed).toHaveLength(2)
    expect(parsed[1].id).toBe('alert-002')
    expect(parsed[1].threat_level).toBe('CRITICAL')
  })

  it('produces pretty-printed output (2-space indent)', () => {
    const json = alertsToJSON([mockAlert()])
    expect(json).toContain('\n  ')
  })

  it('returns "[]" for an empty array', () => {
    expect(alertsToJSON([])).toBe('[]')
  })
})

describe('downloadAlerts', () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>
  let clickSpy: ReturnType<typeof vi.fn>
  let appendChildSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    revokeObjectURL = vi.fn()
    clickSpy = vi.fn()
    appendChildSpy = vi.fn()
    window.URL.createObjectURL = createObjectURL
    window.URL.revokeObjectURL = revokeObjectURL

    // Spy on createElement to capture the <a> link
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const a = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement
        return a
      }
      return document.createElement(tag)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls URL.createObjectURL with a Blob', () => {
    downloadAlerts([mockAlert()], 'csv')
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(createObjectURL.mock.calls[0][0]).toBeInstanceOf(Blob)
  })

  it('triggers a click on the anchor element', () => {
    downloadAlerts([mockAlert()], 'csv')
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('uses .csv extension for CSV format', () => {
    const a = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(a)
    downloadAlerts([mockAlert()], 'csv')
    expect(a.download).toMatch(/\.csv$/)
  })

  it('uses .json extension for JSON format', () => {
    const a = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(a)
    downloadAlerts([mockAlert()], 'json')
    expect(a.download).toMatch(/\.json$/)
  })

  it('filename includes a date suffix in YYYY-MM-DD format', () => {
    const a = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(a)
    downloadAlerts([mockAlert()], 'csv')
    expect(a.download).toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('calls URL.revokeObjectURL after clicking', () => {
    downloadAlerts([mockAlert()], 'json')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
