import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { exportAlertsCSV } from '@/utils/exporters'
import type { Alert } from '@/types/sensors'

// jsdom doesn't implement URL.createObjectURL — define stubs
beforeAll(() => {
  if (!URL.createObjectURL) {
    Object.defineProperty(URL, 'createObjectURL', { writable: true, value: vi.fn(() => 'blob:mock-url') })
  }
  if (!URL.revokeObjectURL) {
    Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: vi.fn() })
  }
})

function makeAlert(overrides?: Partial<Alert>): Alert {
  return {
    id:             'alert-001',
    timestamp:      '2026-04-11T10:00:00.000Z',
    source_sensors: ['S02-GEO-001'],
    location:       '21.9452, 88.1234',
    classification: 'INTRUSION',
    threat_level:   'HIGH',
    acknowledged:   false,
    description:    'Seismic anomaly detected',
    sensor_family:  'Seismic',
    ...overrides,
  }
}

describe('exportAlertsCSV', () => {
  let clickSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a download link and clicks it', () => {
    exportAlertsCSV([makeAlert()])
    expect(clickSpy).toHaveBeenCalled()
  })

  it('sets the download filename to alerts-<timestamp>.csv', () => {
    const anchors: HTMLAnchorElement[] = []
    const origAppend = document.body.appendChild.bind(document.body)
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) anchors.push(node)
      return origAppend(node)
    })
    exportAlertsCSV([makeAlert()])
    expect(anchors[0]?.download).toMatch(/^alerts-.+\.csv$/)
  })

  it('appends and removes the link from the DOM', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    exportAlertsCSV([makeAlert()])
    expect(appendSpy).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalled()
  })

  it('creates a Blob URL and later revokes it', () => {
    exportAlertsCSV([makeAlert()])
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  function captureCSV(alerts: Alert[]): string {
    let blobParts: BlobPart[] = []
    const origBlob = globalThis.Blob
    const BlobSpy = vi.spyOn(globalThis, 'Blob').mockImplementation((parts, opts) => {
      blobParts = parts as BlobPart[]
      return new origBlob(parts, opts)
    })
    exportAlertsCSV(alerts)
    BlobSpy.mockRestore()
    return blobParts.join('')
  }

  it('produces a CSV with a header row containing all required columns', () => {
    const csv = captureCSV([makeAlert()])
    const header = csv.split('\n')[0]
    expect(header).toContain('id')
    expect(header).toContain('timestamp')
    expect(header).toContain('threat_level')
    expect(header).toContain('sensor_family')
    expect(header).toContain('classification')
    expect(header).toContain('location')
    expect(header).toContain('acknowledged')
    expect(header).toContain('description')
  })

  it('produces one data row per alert', () => {
    const csv = captureCSV([makeAlert({ id: 'a1' }), makeAlert({ id: 'a2' })])
    const lines = csv.split('\n').filter(Boolean)
    expect(lines).toHaveLength(3) // header + 2 data rows
  })

  it('includes alert id in the CSV row', () => {
    const csv = captureCSV([makeAlert({ id: 'my-alert-id' })])
    expect(csv).toContain('my-alert-id')
  })

  it('includes acknowledged status in the CSV row', () => {
    const csv = captureCSV([makeAlert({ acknowledged: true })])
    expect(csv).toContain('true')
  })

  it('escapes double quotes inside CSV values', () => {
    const csv = captureCSV([makeAlert({ description: 'Operator said "alert confirmed"' })])
    expect(csv).toContain('""alert confirmed""')
  })

  it('handles empty alert array without throwing', () => {
    expect(() => exportAlertsCSV([])).not.toThrow()
  })

  it('handles missing sensor_family gracefully', () => {
    const csv = captureCSV([makeAlert({ sensor_family: undefined })])
    expect(csv).not.toContain('undefined')
  })
})
