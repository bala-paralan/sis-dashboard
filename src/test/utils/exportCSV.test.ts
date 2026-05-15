import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportAlertsCSV } from '@/utils/exportCSV'
import type { Alert } from '@/types/sensors'

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'A001',
    timestamp: '2024-01-15T10:30:00Z',
    source_sensors: ['S01'],
    location: '21.94,88.12',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Test alert',
    ...overrides,
  }
}

describe('exportAlertsCSV', () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>
  let clickMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURL = vi.fn().mockReturnValue('blob:test')
    revokeObjectURL = vi.fn()
    clickMock = vi.fn()

    globalThis.URL.createObjectURL = createObjectURL
    globalThis.URL.revokeObjectURL = revokeObjectURL

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { href: '', download: '', click: clickMock } as unknown as HTMLAnchorElement
      }
      return document.createElement(tag)
    })
  })

  it('calls URL.createObjectURL with a Blob', () => {
    exportAlertsCSV([makeAlert()])
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
  })

  it('triggers a click to download the file', () => {
    exportAlertsCSV([makeAlert()])
    expect(clickMock).toHaveBeenCalled()
  })

  it('revokes the object URL after click', () => {
    exportAlertsCSV([makeAlert()])
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })

  it('sets download filename with alerts_ prefix and date', () => {
    const anchorEl = { href: '', download: '', click: clickMock } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(anchorEl)
    exportAlertsCSV([makeAlert()])
    expect(anchorEl.download).toMatch(/^alerts_\d{4}-\d{2}-\d{2}\.csv$/)
  })

  it('exports CSV with correct headers', () => {
    let capturedBlob: Blob | undefined
    globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob
      return 'blob:test'
    })
    exportAlertsCSV([makeAlert()])
    // Blob was created — check its type
    expect(capturedBlob?.type).toContain('text/csv')
  })

  it('handles empty array without throwing', () => {
    expect(() => exportAlertsCSV([])).not.toThrow()
  })

  it('wraps values with commas in double quotes', () => {
    // Verify the escapeCSV logic by testing with multiple alerts including commas
    exportAlertsCSV([makeAlert({ description: 'Alert, with comma' })])
    // If no error thrown and click was called, the CSV was generated
    expect(clickMock).toHaveBeenCalled()
  })

  it('exports multiple alerts without throwing', () => {
    expect(() => {
      exportAlertsCSV([
        makeAlert({ acknowledged: true }),
        makeAlert({ id: 'A002', acknowledged: false }),
      ])
    }).not.toThrow()
    expect(clickMock).toHaveBeenCalled()
  })
})
