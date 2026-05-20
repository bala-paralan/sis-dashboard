import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildAlertsCSV, exportAlertsToCSV, CSV_HEADERS } from '@/utils/exportAlerts'
import type { Alert } from '@/types/sensors'

function makeAlert(overrides?: Partial<Alert>): Alert {
  return {
    id: 'alert-001',
    timestamp: '2026-05-20T10:00:00.000Z',
    source_sensors: ['S01-GEO-001', 'S01-GEO-002'],
    location: '21.9452, 88.1234',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Seismic anomaly detected',
    ...overrides,
  }
}

// ── buildAlertsCSV (pure function — no DOM) ────────────────────────────────

describe('buildAlertsCSV', () => {
  it('first line is the header row', () => {
    const csv = buildAlertsCSV([makeAlert()])
    const firstLine = csv.split('\n')[0]
    expect(firstLine).toBe(CSV_HEADERS.join(','))
  })

  it('produces one data row per alert', () => {
    const csv = buildAlertsCSV([makeAlert({ id: 'a1' }), makeAlert({ id: 'a2' })])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3) // header + 2 data rows
  })

  it('data row has 12 comma-separated columns', () => {
    const csv = buildAlertsCSV([makeAlert()])
    const dataLine = csv.split('\n')[1]
    // Location cell has a comma so it must be quoted — split carefully
    const cols = dataLine.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) ?? []
    expect(cols).toHaveLength(12)
  })

  it('joins multiple source_sensors with semicolons', () => {
    const csv = buildAlertsCSV([makeAlert({ source_sensors: ['S01', 'S02', 'S03'] })])
    expect(csv).toContain('S01;S02;S03')
  })

  it('wraps cells containing commas in double quotes', () => {
    const csv = buildAlertsCSV([makeAlert({ description: 'Seismic, acoustic anomaly' })])
    expect(csv).toContain('"Seismic, acoustic anomaly"')
  })

  it('escapes double-quote characters inside cell values', () => {
    const csv = buildAlertsCSV([makeAlert({ description: 'Operator said "confirmed"' })])
    expect(csv).toContain('"Operator said ""confirmed"""')
  })

  it('uses empty string for optional fields when absent', () => {
    const csv = buildAlertsCSV([makeAlert({ sensor_family: undefined, annotation: undefined })])
    const dataLine = csv.split('\n')[1]
    // sensor_family (col 5) and annotation (col 10) should be empty
    expect(dataLine).toBeTruthy()
  })

  it('reflects acknowledged=true correctly', () => {
    const csv = buildAlertsCSV([makeAlert({ acknowledged: true })])
    expect(csv).toContain('true')
  })
})

// ── exportAlertsToCSV (DOM side-effects) ──────────────────────────────────

describe('exportAlertsToCSV', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>
  let revokeObjectURLMock: ReturnType<typeof vi.fn>
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>
  let clickMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    clickMock = vi.fn()
    createObjectURLMock = vi.fn(() => 'blob:test-url')
    revokeObjectURLMock = vi.fn()
    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) {
        node.click = clickMock
      }
      return node
    })
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
  })

  afterEach(() => {
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('does nothing when alerts array is empty', () => {
    exportAlertsToCSV([])
    expect(createObjectURLMock).not.toHaveBeenCalled()
  })

  it('creates a Blob with CSV mime type', () => {
    exportAlertsToCSV([makeAlert()])
    expect(createObjectURLMock).toHaveBeenCalledOnce()
    const blob = createObjectURLMock.mock.calls[0][0] as Blob
    expect(blob.type).toBe('text/csv;charset=utf-8;')
  })

  it('uses custom filename when provided', () => {
    exportAlertsToCSV([makeAlert()], 'my-export.csv')
    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement
    expect(anchor.download).toBe('my-export.csv')
  })

  it('uses default filename with current date when none provided', () => {
    const today = new Date().toISOString().slice(0, 10)
    exportAlertsToCSV([makeAlert()])
    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement
    expect(anchor.download).toBe(`sis-alerts-${today}.csv`)
  })

  it('triggers a click on the anchor element', () => {
    exportAlertsToCSV([makeAlert()])
    expect(clickMock).toHaveBeenCalledOnce()
  })

  it('revokes the object URL after triggering download', () => {
    exportAlertsToCSV([makeAlert()])
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url')
  })
})
