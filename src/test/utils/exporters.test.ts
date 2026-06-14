import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportAlertsCSV, exportTracksKML, exportIncidentPDF } from '@/utils/exporters'
import type { Alert } from '@/types/sensors'
import type { Track } from '@/types/sensors'

function makeAlert(overrides?: Partial<Alert>): Alert {
  return {
    id: 'a-001',
    timestamp: '2026-01-01T00:00:00Z',
    source_sensors: ['S01'],
    location: '21.94, 88.12',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Test alert',
    sensor_family: 'Seismic',
    ...overrides,
  }
}

function makeTrack(overrides?: Partial<Track>): Track {
  return {
    track_id: 'TRK-001',
    lat: 21.94,
    lon: 88.12,
    range_m: 500,
    velocity: 5.0,
    heading: 90,
    class: 'UNKNOWN',
    confidence: 85,
    age_frames: 10,
    ...overrides,
  }
}

// Captures content passed to Blob constructor and tracks anchor clicks
let capturedBlobContent = ''
let anchorClickCalled = false

beforeEach(() => {
  capturedBlobContent = ''
  anchorClickCalled = false

  // Override Blob to capture content
  const OrigBlob = globalThis.Blob
  vi.stubGlobal('Blob', class MockBlob extends OrigBlob {
    constructor(parts: BlobPart[], opts?: BlobPropertyBag) {
      super(parts, opts)
      capturedBlobContent = (parts as string[]).join('')
    }
  })

  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()

  // Mock anchor element click
  const originalCreate = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') {
      const el = originalCreate('a') as HTMLAnchorElement
      el.click = () => { anchorClickCalled = true }
      return el
    }
    return originalCreate(tag)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('exportAlertsCSV', () => {
  it('generates correct header row', () => {
    exportAlertsCSV([])
    const firstLine = capturedBlobContent.split('\n')[0]
    expect(firstLine).toBe('id,timestamp,threat_level,classification,location,sensor_family,acknowledged')
  })

  it('generates correct number of data rows', () => {
    const alerts = [makeAlert({ id: 'a-001' }), makeAlert({ id: 'a-002' }), makeAlert({ id: 'a-003' })]
    exportAlertsCSV(alerts)
    const lines = capturedBlobContent.split('\n').filter(Boolean)
    // 1 header + 3 data rows
    expect(lines).toHaveLength(4)
  })

  it('includes the alert id in the CSV row', () => {
    exportAlertsCSV([makeAlert({ id: 'test-id-xyz' })])
    expect(capturedBlobContent).toContain('test-id-xyz')
  })

  it('encodes acknowledged=true correctly', () => {
    exportAlertsCSV([makeAlert({ acknowledged: true })])
    expect(capturedBlobContent).toContain('true')
  })

  it('encodes threat level correctly', () => {
    exportAlertsCSV([makeAlert({ threat_level: 'CRITICAL' })])
    expect(capturedBlobContent).toContain('CRITICAL')
  })

  it('triggers a download by clicking an anchor element', () => {
    exportAlertsCSV([makeAlert()])
    expect(anchorClickCalled).toBe(true)
  })
})

describe('exportTracksKML', () => {
  it('output contains <kml tag', () => {
    exportTracksKML([makeTrack()])
    expect(capturedBlobContent).toContain('<kml')
  })

  it('output contains <Placemark tag for each track', () => {
    const tracks = [makeTrack({ track_id: 'T1' }), makeTrack({ track_id: 'T2' })]
    exportTracksKML(tracks)
    const matches = capturedBlobContent.match(/<Placemark>/g)
    expect(matches).toHaveLength(2)
  })

  it('includes track coordinates in KML output', () => {
    exportTracksKML([makeTrack({ lat: 21.94, lon: 88.12 })])
    expect(capturedBlobContent).toContain('88.12')
    expect(capturedBlobContent).toContain('21.94')
  })

  it('includes track_id in KML Placemark name', () => {
    exportTracksKML([makeTrack({ track_id: 'MY-TRACK-001' })])
    expect(capturedBlobContent).toContain('MY-TRACK-001')
  })

  it('handles empty tracks array without throwing', () => {
    expect(() => exportTracksKML([])).not.toThrow()
  })

  it('triggers a download by clicking an anchor element', () => {
    exportTracksKML([makeTrack()])
    expect(anchorClickCalled).toBe(true)
  })
})

describe('exportIncidentPDF', () => {
  it('calls window.print()', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    exportIncidentPDF()
    expect(printSpy).toHaveBeenCalledOnce()
  })
})
