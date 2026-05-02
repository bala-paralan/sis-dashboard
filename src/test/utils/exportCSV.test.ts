import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildAlertsCSV, exportAlertsCSV } from '@/utils/exportCSV'
import type { Alert } from '@/types/sensors'

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id:             'alert-001',
    timestamp:      '2026-01-01T10:00:00Z',
    source_sensors: ['S01'],
    location:       '21.94,88.12',
    classification: 'INTRUSION',
    threat_level:   'HIGH',
    acknowledged:   false,
    description:    'Test alert',
    sensor_family:  'Seismic',
    ...overrides,
  }
}

describe('buildAlertsCSV', () => {
  it('returns CSV with header row for empty array', () => {
    const csv = buildAlertsCSV([])
    expect(csv.split('\n')[0]).toContain('id')
    expect(csv.split('\n')[0]).toContain('timestamp')
    expect(csv.split('\n')[0]).toContain('threat_level')
    expect(csv.split('\n')[0]).toContain('acknowledged')
  })

  it('includes one data row per alert', () => {
    const csv = buildAlertsCSV([makeAlert(), makeAlert({ id: 'a2' })])
    const lines = csv.trim().split('\n')
    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('includes alert id in output', () => {
    const csv = buildAlertsCSV([makeAlert({ id: 'my-alert-99' })])
    expect(csv).toContain('my-alert-99')
  })

  it('includes threat_level in output', () => {
    const csv = buildAlertsCSV([makeAlert({ threat_level: 'CRITICAL' })])
    expect(csv).toContain('CRITICAL')
  })

  it('includes sensor_family in output', () => {
    const csv = buildAlertsCSV([makeAlert({ sensor_family: 'Radar' })])
    expect(csv).toContain('Radar')
  })

  it('includes acknowledged field as string', () => {
    const csv = buildAlertsCSV([makeAlert({ acknowledged: true })])
    expect(csv).toContain('true')
  })

  it('wraps description containing comma in double quotes', () => {
    const csv = buildAlertsCSV([makeAlert({ description: 'Alert, with comma' })])
    expect(csv).toContain('"Alert, with comma"')
  })

  it('escapes double quotes in description', () => {
    const csv = buildAlertsCSV([makeAlert({ description: 'She said "hello"' })])
    expect(csv).toContain('"She said ""hello"""')
  })

  it('handles missing sensor_family as empty string', () => {
    const csv = buildAlertsCSV([makeAlert({ sensor_family: undefined })])
    expect(csv).not.toContain('undefined')
  })
})

describe('exportAlertsCSV', () => {
  let downloadFilename = ''

  beforeEach(() => {
    downloadFilename = ''
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()

    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const a = origCreate('a')
        a.click = vi.fn()
        Object.defineProperty(a, 'download', {
          set(v: string) { downloadFilename = v },
          get() { return downloadFilename },
          configurable: true,
        })
        return a
      }
      return origCreate(tag)
    })
  })

  it('does not throw with empty array', () => {
    expect(() => exportAlertsCSV([])).not.toThrow()
  })

  it('triggers download with ISO date filename', () => {
    exportAlertsCSV([makeAlert()])
    expect(downloadFilename).toMatch(/^alerts_\d{4}-\d{2}-\d{2}\.csv$/)
  })

  it('calls URL.createObjectURL', () => {
    exportAlertsCSV([makeAlert()])
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('calls URL.revokeObjectURL after download', () => {
    exportAlertsCSV([makeAlert()])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })
})
