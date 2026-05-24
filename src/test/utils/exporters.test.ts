import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildAlertsCSV, csvEscape, exportAlertsCSV } from '@/utils/exporters'
import type { Alert } from '@/types/sensors'

function makeAlert(id: string, overrides: Partial<Alert> = {}): Alert {
  return {
    id,
    timestamp: '2026-01-15T10:00:00.000Z',
    source_sensors: ['S01-GPR-001'],
    location: '21.9452, 88.1234',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Test alert description',
    ...overrides,
  }
}

// jsdom doesn't implement URL.createObjectURL / revokeObjectURL — define stubs
if (!URL.createObjectURL) {
  URL.createObjectURL = () => 'blob:stub'
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = () => undefined
}

describe('csvEscape', () => {
  it('returns plain strings unchanged', () => {
    expect(csvEscape('hello')).toBe('hello')
  })

  it('wraps values with commas in quotes', () => {
    expect(csvEscape('hello, world')).toBe('"hello, world"')
  })

  it('wraps values with double-quotes and escapes them', () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""')
  })

  it('wraps values with newlines in quotes', () => {
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"')
  })

  it('returns empty string for null', () => {
    expect(csvEscape(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(csvEscape(undefined)).toBe('')
  })
})

describe('buildAlertsCSV', () => {
  it('first line is the CSV header', () => {
    const csv = buildAlertsCSV([])
    const firstLine = csv.split('\n')[0]
    expect(firstLine).toBe('id,timestamp,threat_level,sensor_family,classification,location,acknowledged,description')
  })

  it('returns only the header line when alerts array is empty', () => {
    const csv = buildAlertsCSV([])
    expect(csv.trim().split('\n').length).toBe(1)
  })

  it('produces one data row per alert', () => {
    const csv = buildAlertsCSV([makeAlert('a1'), makeAlert('a2'), makeAlert('a3')])
    const lines = csv.trim().split('\n')
    expect(lines.length).toBe(4) // header + 3 rows
  })

  it('includes the alert id in the row', () => {
    const csv = buildAlertsCSV([makeAlert('alert-xyz-123')])
    expect(csv).toContain('alert-xyz-123')
  })

  it('includes the threat level in the row', () => {
    const csv = buildAlertsCSV([makeAlert('a1', { threat_level: 'CRITICAL' })])
    expect(csv).toContain('CRITICAL')
  })

  it('uses "true" for acknowledged alerts', () => {
    const csv = buildAlertsCSV([makeAlert('a1', { acknowledged: true })])
    expect(csv).toContain('true')
  })

  it('uses "false" for unacknowledged alerts', () => {
    const csv = buildAlertsCSV([makeAlert('a1', { acknowledged: false })])
    expect(csv).toContain('false')
  })

  it('includes the classification value', () => {
    const csv = buildAlertsCSV([makeAlert('a1', { classification: 'PERIMETER_BREACH' })])
    expect(csv).toContain('PERIMETER_BREACH')
  })

  it('handles missing sensor_family without throwing', () => {
    const alert = makeAlert('a1')
    delete (alert as Partial<Alert>).sensor_family
    expect(() => buildAlertsCSV([alert])).not.toThrow()
    const csv = buildAlertsCSV([alert])
    expect(csv).toContain('a1')
  })

  it('escapes commas in description', () => {
    const csv = buildAlertsCSV([makeAlert('a1', { description: 'Deploy QRT, sector 4' })])
    expect(csv).toContain('"Deploy QRT, sector 4"')
  })

  it('includes location value', () => {
    const csv = buildAlertsCSV([makeAlert('a1', { location: '21.94, 88.12' })])
    expect(csv).toContain('21.94')
  })
})

describe('exportAlertsCSV — DOM interaction', () => {
  let mockAnchorClick: ReturnType<typeof vi.fn>
  let mockAnchorElement: { href: string; download: string; style: { display: string }; click: ReturnType<typeof vi.fn> }
  let createdObjectUrl: string

  beforeEach(() => {
    mockAnchorClick = vi.fn()
    mockAnchorElement = { href: '', download: '', style: { display: '' }, click: mockAnchorClick }

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchorElement as unknown as HTMLElement
      return document.createElement.call(document, tag)
    })

    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)

    createdObjectUrl = 'blob:test-url-1234'
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(createdObjectUrl)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('triggers a download click', () => {
    exportAlertsCSV([makeAlert('a1')])
    expect(mockAnchorClick).toHaveBeenCalledOnce()
  })

  it('sets the anchor href to the object URL', () => {
    exportAlertsCSV([makeAlert('a1')])
    expect(mockAnchorElement.href).toBe(createdObjectUrl)
  })

  it('sets download filename with alerts- prefix', () => {
    exportAlertsCSV([makeAlert('a1')])
    expect(mockAnchorElement.download).toMatch(/^alerts-/)
  })

  it('revokes the object URL after download', () => {
    exportAlertsCSV([makeAlert('a1')])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(createdObjectUrl)
  })

  it('still triggers download with an empty alert array', () => {
    expect(() => exportAlertsCSV([])).not.toThrow()
    expect(mockAnchorClick).toHaveBeenCalledOnce()
  })
})
