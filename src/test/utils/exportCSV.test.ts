import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildAlertsCSV, exportAlertsCSV, CSV_HEADERS } from '@/utils/exportCSV'
import type { Alert } from '@/types/sensors'

function makeAlert(overrides?: Partial<Alert>): Alert {
  return {
    id: 'alert-001',
    timestamp: '2026-05-06T10:00:00.000Z',
    source_sensors: ['S01'],
    location: '21.9,88.1',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Test alert',
    ...overrides,
  }
}

// ── buildAlertsCSV (pure function) ────────────────────────────────────────────

describe('buildAlertsCSV', () => {
  it('first row is the header line', () => {
    const csv = buildAlertsCSV([])
    expect(csv.split('\n')[0]).toBe(CSV_HEADERS.join(','))
  })

  it('header contains all required columns', () => {
    const csv = buildAlertsCSV([])
    const header = csv.split('\n')[0]
    for (const col of CSV_HEADERS) {
      expect(header).toContain(col)
    }
  })

  it('includes one data row per alert', () => {
    const csv = buildAlertsCSV([makeAlert(), makeAlert({ id: 'a2' })])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('empty list produces only a header row', () => {
    const csv = buildAlertsCSV([])
    expect(csv.split('\n')).toHaveLength(1)
  })

  it('includes alert id in the row', () => {
    const csv = buildAlertsCSV([makeAlert({ id: 'alert-xyz' })])
    expect(csv).toContain('alert-xyz')
  })

  it('includes threat_level in the row', () => {
    const csv = buildAlertsCSV([makeAlert({ threat_level: 'CRITICAL' })])
    expect(csv).toContain('CRITICAL')
  })

  it('escapes commas in field values', () => {
    const csv = buildAlertsCSV([makeAlert({ description: 'Alert, with, commas' })])
    expect(csv).toContain('"Alert, with, commas"')
  })

  it('escapes double-quotes in field values', () => {
    const csv = buildAlertsCSV([makeAlert({ description: 'Alert "quoted"' })])
    expect(csv).toContain('"Alert ""quoted"""')
  })

  it('includes acknowledged as true/false string', () => {
    const csv = buildAlertsCSV([makeAlert({ acknowledged: true })])
    expect(csv).toContain('true')
  })
})

// ── exportAlertsCSV (side-effect / download trigger) ─────────────────────────

describe('exportAlertsCSV', () => {
  let clickSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock')
    global.URL.revokeObjectURL = vi.fn()
    clickSpy = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickSpy)
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
    vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('triggers a download anchor click', () => {
    exportAlertsCSV([makeAlert()])
    expect(clickSpy).toHaveBeenCalled()
  })

  it('sets download filename with ISO date prefix', () => {
    let download = ''
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => {
      download = (el as HTMLAnchorElement).download
      return el
    })
    exportAlertsCSV([makeAlert()])
    expect(download).toMatch(/^alerts_\d{4}-\d{2}-\d{2}\.csv$/)
  })

  it('revokes the object URL after download', () => {
    exportAlertsCSV([makeAlert()])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })
})
