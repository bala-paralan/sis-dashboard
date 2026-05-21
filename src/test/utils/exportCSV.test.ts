import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportAlertsCSV } from '@/utils/exportCSV'
import type { Alert } from '@/types/sensors'

function mockAlert(overrides?: Partial<Alert>): Alert {
  return {
    id: 'alert-001',
    timestamp: '2026-05-01T10:00:00.000Z',
    source_sensors: ['S01'],
    location: '21.9452, 88.1234',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Test alert',
    sensor_family: 'Seismic',
    ...overrides,
  }
}

describe('exportAlertsCSV', () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>
  let clickSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:http://localhost/test')
    revokeObjectURL = vi.fn()
    global.URL.createObjectURL = createObjectURL
    global.URL.revokeObjectURL = revokeObjectURL

    clickSpy = vi.fn()
    const originalCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag)
      if (tag === 'a') {
        el.click = clickSpy
      }
      return el
    })
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((n) => n)
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((n) => n)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a Blob and triggers a download', () => {
    exportAlertsCSV([mockAlert()])
    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test')
  })

  it('sets download filename with ISO date', () => {
    let capturedAnchor: HTMLAnchorElement | null = null
    const originalCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag)
      if (tag === 'a') {
        el.click = clickSpy
        capturedAnchor = el as HTMLAnchorElement
      }
      return el
    })
    exportAlertsCSV([mockAlert()])
    expect(capturedAnchor?.download).toMatch(/^alerts_\d{4}-\d{2}-\d{2}\.csv$/)
  })

  it('includes CSV header row', () => {
    let blobContent = ''
    const OrigBlob = global.Blob
    global.Blob = vi.fn((parts) => {
      blobContent = (parts as string[]).join('')
      return new OrigBlob(parts)
    }) as unknown as typeof Blob
    exportAlertsCSV([mockAlert()])
    expect(blobContent).toContain('id,timestamp,threat_level')
    global.Blob = OrigBlob
  })

  it('includes alert data in CSV row', () => {
    let blobContent = ''
    const OrigBlob = global.Blob
    global.Blob = vi.fn((parts) => {
      blobContent = (parts as string[]).join('')
      return new OrigBlob(parts)
    }) as unknown as typeof Blob
    exportAlertsCSV([mockAlert({ id: 'a-123', threat_level: 'CRITICAL' })])
    expect(blobContent).toContain('a-123')
    expect(blobContent).toContain('CRITICAL')
    global.Blob = OrigBlob
  })

  it('escapes values containing commas', () => {
    let blobContent = ''
    const OrigBlob = global.Blob
    global.Blob = vi.fn((parts) => {
      blobContent = (parts as string[]).join('')
      return new OrigBlob(parts)
    }) as unknown as typeof Blob
    exportAlertsCSV([mockAlert({ description: 'Alert, with comma' })])
    expect(blobContent).toContain('"Alert, with comma"')
    global.Blob = OrigBlob
  })

  it('appends and removes anchor from body', () => {
    exportAlertsCSV([mockAlert()])
    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
  })

  it('handles empty alert array', () => {
    expect(() => exportAlertsCSV([])).not.toThrow()
    expect(clickSpy).toHaveBeenCalled()
  })

  it('handles acknowledged: true correctly', () => {
    let blobContent = ''
    const OrigBlob = global.Blob
    global.Blob = vi.fn((parts) => {
      blobContent = (parts as string[]).join('')
      return new OrigBlob(parts)
    }) as unknown as typeof Blob
    exportAlertsCSV([mockAlert({ acknowledged: true })])
    expect(blobContent).toContain('true')
    global.Blob = OrigBlob
  })
})
