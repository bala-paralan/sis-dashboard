import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportAlerts } from '@/utils/exporters'
import type { Alert } from '@/types/sensors'

// Capture content passed to Blob constructor to avoid relying on Blob.text()
let capturedBlobContent = ''
let capturedBlobType = ''
let capturedDownloadAttr = ''
let capturedHref = ''
let revokedUrl = ''

const FAKE_URL = 'blob:http://localhost/test-url'

function mockAlert(id: string, overrides: Partial<Alert> = {}): Alert {
  return {
    id,
    timestamp: '2024-01-15T10:30:00.000Z',
    source_sensors: ['S01-RAD-001', 'S01-ACS-002'],
    location: '21.94, 88.12',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Alert detected',
    ...overrides,
  }
}

const OrigBlob = globalThis.Blob

beforeEach(() => {
  capturedBlobContent = ''
  capturedBlobType = ''
  capturedDownloadAttr = ''
  capturedHref = ''
  revokedUrl = ''

  // Spy on Blob constructor to capture content without relying on Blob.text()
  globalThis.Blob = class extends OrigBlob {
    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options)
      capturedBlobContent = String(parts?.[0] ?? '')
      capturedBlobType = options?.type ?? ''
    }
  } as unknown as typeof Blob

  globalThis.URL.createObjectURL = vi.fn(() => FAKE_URL)
  globalThis.URL.revokeObjectURL = vi.fn((url: string) => { revokedUrl = url })

  const origCreate = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') {
      const a = origCreate('a') as HTMLAnchorElement
      vi.spyOn(a, 'click').mockImplementation(() => {
        capturedDownloadAttr = a.download
        capturedHref = a.href
      })
      return a
    }
    return origCreate(tag)
  })
})

afterEach(() => {
  globalThis.Blob = OrigBlob
  vi.restoreAllMocks()
})

describe('exportAlerts', () => {
  // ── JSON export ───────────────────────────────────────────────

  it('triggers a download when exporting JSON', () => {
    exportAlerts([mockAlert('a1')], 'json')
    expect(capturedDownloadAttr).toMatch(/^alerts_.*\.json$/)
    expect(capturedHref).toBe(FAKE_URL)
  })

  it('JSON export content is valid JSON with all alerts', () => {
    const alerts = [mockAlert('a1'), mockAlert('a2', { threat_level: 'CRITICAL' })]
    exportAlerts(alerts, 'json')
    const parsed = JSON.parse(capturedBlobContent) as Alert[]
    expect(parsed).toHaveLength(2)
    expect(parsed[0].id).toBe('a1')
    expect(parsed[1].threat_level).toBe('CRITICAL')
  })

  it('JSON export uses application/json MIME type', () => {
    exportAlerts([mockAlert('a1')], 'json')
    expect(capturedBlobType).toBe('application/json')
  })

  it('revokes the object URL after download to prevent memory leaks', () => {
    exportAlerts([mockAlert('a1')], 'json')
    expect(revokedUrl).toBe(FAKE_URL)
  })

  // ── CSV export ────────────────────────────────────────────────

  it('triggers a download when exporting CSV', () => {
    exportAlerts([mockAlert('a1')], 'csv')
    expect(capturedDownloadAttr).toMatch(/^alerts_.*\.csv$/)
  })

  it('CSV export uses text/csv MIME type', () => {
    exportAlerts([mockAlert('a1')], 'csv')
    expect(capturedBlobType).toBe('text/csv')
  })

  it('CSV export includes a header row and one data row per alert', () => {
    exportAlerts([mockAlert('a1'), mockAlert('a2')], 'csv')
    const lines = capturedBlobContent.split('\n')
    expect(lines[0]).toContain('id')
    expect(lines[0]).toContain('threat_level')
    expect(lines[0]).toContain('acknowledged')
    expect(lines).toHaveLength(3) // header + 2 data rows
  })

  it('CSV properly quotes fields that contain commas', () => {
    const alert = mockAlert('a1', { description: 'Threat near Gate A, North Sector' })
    exportAlerts([alert], 'csv')
    expect(capturedBlobContent).toContain('"Threat near Gate A, North Sector"')
  })

  it('CSV properly escapes double-quotes inside field values', () => {
    const alert = mockAlert('a1', { description: 'Zone "Alpha" breach' })
    exportAlerts([alert], 'csv')
    expect(capturedBlobContent).toContain('"Zone ""Alpha"" breach"')
  })

  it('exports an empty array without crashing', () => {
    expect(() => exportAlerts([], 'csv')).not.toThrow()
    expect(() => exportAlerts([], 'json')).not.toThrow()
  })

  it('CSV sensor_id field joins multiple source_sensors with semicolons', () => {
    const alert = mockAlert('a1', { source_sensors: ['S01', 'S02', 'S03'] })
    exportAlerts([alert], 'csv')
    expect(capturedBlobContent).toContain('S01;S02;S03')
  })
})
