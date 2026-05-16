import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportAlertsToCSV, downloadAlertsCSV } from '@/utils/exportAlerts'
import type { Alert } from '@/types/sensors'

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id:              'a1',
    timestamp:       '2024-01-15T10:30:00Z',
    source_sensors:  ['S01-GEO-001'],
    location:        '21.94,88.12',
    classification:  'INTRUSION',
    threat_level:    'HIGH',
    acknowledged:    false,
    description:     'Movement detected',
    ...overrides,
  }
}

describe('exportAlertsToCSV', () => {
  it('returns CSV string with header row', () => {
    const csv = exportAlertsToCSV([])
    expect(csv).toContain('id,timestamp,threat_level')
  })

  it('header has all required columns', () => {
    const header = exportAlertsToCSV([]).split('\n')[0]
    const cols = header.split(',')
    expect(cols).toContain('id')
    expect(cols).toContain('timestamp')
    expect(cols).toContain('threat_level')
    expect(cols).toContain('classification')
    expect(cols).toContain('location')
    expect(cols).toContain('source_sensors')
    expect(cols).toContain('acknowledged')
    expect(cols).toContain('description')
  })

  it('returns only header row for empty alerts array', () => {
    const csv = exportAlertsToCSV([])
    expect(csv.split('\n')).toHaveLength(1)
  })

  it('produces one data row per alert', () => {
    const csv = exportAlertsToCSV([makeAlert(), makeAlert({ id: 'a2' })])
    expect(csv.split('\n')).toHaveLength(3) // header + 2 rows
  })

  it('includes alert id in output', () => {
    const csv = exportAlertsToCSV([makeAlert({ id: 'alert-xyz' })])
    expect(csv).toContain('alert-xyz')
  })

  it('includes threat_level in output', () => {
    const csv = exportAlertsToCSV([makeAlert({ threat_level: 'CRITICAL' })])
    expect(csv).toContain('CRITICAL')
  })

  it('joins multiple source_sensors with semicolon', () => {
    const csv = exportAlertsToCSV([makeAlert({ source_sensors: ['S01', 'S02', 'S03'] })])
    expect(csv).toContain('S01;S02;S03')
  })

  it('handles acknowledged=true correctly', () => {
    const csv = exportAlertsToCSV([makeAlert({ acknowledged: true })])
    expect(csv).toContain('true')
  })

  it('wraps cell with comma in double quotes', () => {
    const csv = exportAlertsToCSV([makeAlert({ description: 'foo, bar' })])
    expect(csv).toContain('"foo, bar"')
  })

  it('escapes double quotes inside cell value', () => {
    const csv = exportAlertsToCSV([makeAlert({ description: 'say "hello"' })])
    expect(csv).toContain('"say ""hello"""')
  })

  it('handles null location gracefully (empty string)', () => {
    const csv = exportAlertsToCSV([makeAlert({ location: undefined as unknown as string })])
    expect(csv).not.toContain('undefined')
  })
})

describe('downloadAlertsCSV', () => {
  beforeEach(() => {
    const mockURL = { createObjectURL: vi.fn(() => 'blob:url'), revokeObjectURL: vi.fn() }
    vi.stubGlobal('URL', mockURL)

    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement)
  })

  it('creates an anchor element and triggers click', () => {
    downloadAlertsCSV([makeAlert()])
    expect(document.createElement).toHaveBeenCalledWith('a')
  })

  it('sets download filename with date prefix', () => {
    const link = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValue(link as unknown as HTMLAnchorElement)
    downloadAlertsCSV([makeAlert()])
    expect(link.download).toMatch(/^alerts_\d{4}-\d{2}-\d{2}\.csv$/)
  })
})
