import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportAlertsCSV, exportTracksKML, exportIncidentPDF } from '@/utils/exporters'
import type { Alert } from '@/types/sensors'

let lastBlobContent = ''
const OriginalBlob = globalThis.Blob

function setupDownloadMocks() {
  const clickMock = vi.fn()
  const anchor = { href: '', download: '', click: clickMock }
  vi.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLElement)
  // URL.createObjectURL exists (added in setup.tsx)
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  vi.spyOn(globalThis, 'Blob').mockImplementation((parts?: BlobPart[], opts?: BlobPropertyBag) => {
    if (parts && typeof parts[0] === 'string') lastBlobContent = parts[0] as string
    return new OriginalBlob(parts, opts)
  })
  return { clickMock, anchor }
}

const makeAlert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'A001',
  timestamp: '2024-01-01T00:00:00Z',
  source_sensors: ['S01'],
  location: '21.94, 88.12',
  classification: 'Intrusion',
  threat_level: 'HIGH',
  acknowledged: false,
  description: 'Test alert',
  sensor_family: 'Seismic',
  ...overrides,
})

beforeEach(() => {
  lastBlobContent = ''
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('exportAlertsCSV', () => {
  it('includes the CSV header row', () => {
    setupDownloadMocks()
    exportAlertsCSV([makeAlert()])
    expect(lastBlobContent).toContain('id,timestamp,threat_level')
  })

  it('triggers an anchor click (download)', () => {
    const { clickMock } = setupDownloadMocks()
    exportAlertsCSV([makeAlert()])
    expect(clickMock).toHaveBeenCalledTimes(1)
  })

  it('produces one data row per alert', () => {
    setupDownloadMocks()
    exportAlertsCSV([makeAlert({ id: 'X1' }), makeAlert({ id: 'X2' })])
    const lines = lastBlobContent.split('\n').filter(Boolean)
    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('handles empty alert list — only header', () => {
    setupDownloadMocks()
    exportAlertsCSV([])
    const lines = lastBlobContent.split('\n').filter(Boolean)
    expect(lines).toHaveLength(1)
  })

  it('escapes double-quotes in classification', () => {
    setupDownloadMocks()
    exportAlertsCSV([makeAlert({ classification: 'Test "quoted"' })])
    expect(lastBlobContent).toContain('""quoted""')
  })

  it('sets the correct MIME type (text/csv)', () => {
    const blobSpy = vi.spyOn(globalThis, 'Blob').mockImplementation((parts, opts) => {
      if (parts && typeof parts[0] === 'string') lastBlobContent = parts[0] as string
      return new OriginalBlob(parts, opts)
    })
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() } as unknown as HTMLElement)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)

    exportAlertsCSV([makeAlert()])
    expect(blobSpy.mock.calls[0][1]).toMatchObject({ type: expect.stringContaining('text/csv') })
  })
})

describe('exportTracksKML', () => {
  it('generates KML root element', () => {
    setupDownloadMocks()
    exportTracksKML([{ id: 'T01', bearing: 45, ts: Date.now(), lat: 21.94, lon: 88.12 }])
    expect(lastBlobContent).toContain('<kml ')
  })

  it('includes one Placemark per track', () => {
    setupDownloadMocks()
    exportTracksKML([
      { id: 'T01', bearing: 10, ts: Date.now() },
      { id: 'T02', bearing: 20, ts: Date.now() },
    ])
    const count = (lastBlobContent.match(/<Placemark>/g) ?? []).length
    expect(count).toBe(2)
  })

  it('handles empty tracks array without throwing', () => {
    setupDownloadMocks()
    expect(() => exportTracksKML([])).not.toThrow()
    expect(lastBlobContent).toContain('<kml ')
  })

  it('includes lat/lon coordinates in output', () => {
    setupDownloadMocks()
    exportTracksKML([{ id: 'T01', bearing: 0, ts: Date.now(), lat: 21.94, lon: 88.12 }])
    expect(lastBlobContent).toContain('88.12,21.94')
  })
})

describe('exportIncidentPDF', () => {
  it('opens a new window', () => {
    const mockWin = { document: { write: vi.fn(), close: vi.fn() } }
    vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window)
    exportIncidentPDF('Test Incident', 'Narrative text')
    expect(window.open).toHaveBeenCalled()
  })

  it('writes the incident title into the document', () => {
    const mockWin = { document: { write: vi.fn(), close: vi.fn() } }
    vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window)
    exportIncidentPDF('My Incident Title', 'some narrative')
    const written: string = mockWin.document.write.mock.calls[0][0] as string
    expect(written).toContain('My Incident Title')
  })

  it('does nothing when window.open returns null', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    expect(() => exportIncidentPDF('T', 'B')).not.toThrow()
  })

  it('escapes HTML special characters in body', () => {
    const mockWin = { document: { write: vi.fn(), close: vi.fn() } }
    vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window)
    exportIncidentPDF('T', '<script>alert(1)</script>')
    const written: string = mockWin.document.write.mock.calls[0][0] as string
    expect(written).toContain('&lt;script&gt;')
  })
})
