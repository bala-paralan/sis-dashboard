import { describe, it, expect, vi, beforeEach } from 'vitest'
import { alertsToCSV, toJSON, downloadFile, formatExportTimestamp } from '@/lib/exportUtils'
import type { Alert } from '@/types/sensors'

function makeAlert(id: string, override: Partial<Alert> = {}): Alert {
  return {
    id,
    timestamp: '2026-07-03T10:00:00.000Z',
    source_sensors: ['S01-GEO-001'],
    location: '21.94, 88.12',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Test alert',
    ...override,
  }
}

describe('alertsToCSV', () => {
  it('returns a string with a header row', () => {
    const csv = alertsToCSV([])
    expect(csv).toMatch(/Timestamp,Severity,Sensor/)
  })

  it('returns one data row per alert', () => {
    const csv = alertsToCSV([makeAlert('a1'), makeAlert('a2')])
    const lines = csv.trim().split('\n')
    expect(lines.length).toBe(3) // header + 2 rows
  })

  it('includes the threat level in each row', () => {
    const csv = alertsToCSV([makeAlert('a1', { threat_level: 'CRITICAL' })])
    expect(csv).toMatch(/CRITICAL/)
  })

  it('includes acknowledged status as text', () => {
    const ackedCsv = alertsToCSV([makeAlert('a1', { acknowledged: true })])
    expect(ackedCsv).toMatch(/Acknowledged/)
    const unackedCsv = alertsToCSV([makeAlert('a2', { acknowledged: false })])
    expect(unackedCsv).toMatch(/Unacknowledged/)
  })

  it('joins multiple sensors with semicolon', () => {
    const csv = alertsToCSV([makeAlert('a1', { source_sensors: ['S01', 'S02'] })])
    expect(csv).toMatch(/S01; S02/)
  })

  it('escapes cells containing commas', () => {
    const csv = alertsToCSV([makeAlert('a1', { location: '12.3, 45.6' })])
    expect(csv).toMatch(/"12.3, 45.6"/)
  })

  it('escapes cells containing double quotes', () => {
    const csv = alertsToCSV([makeAlert('a1', { description: 'Say "hi"' })])
    expect(csv).toMatch(/""hi""/)
  })
})

describe('toJSON', () => {
  it('serialises an object to pretty-printed JSON', () => {
    const obj = { foo: 1, bar: [1, 2] }
    const result = toJSON(obj)
    expect(JSON.parse(result)).toEqual(obj)
    expect(result).toMatch(/\n/)  // pretty-printed
  })
})

describe('downloadFile', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:test'),
      revokeObjectURL: vi.fn(),
    })
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
    return () => { appendSpy.mockRestore(); removeSpy.mockRestore() }
  })

  it('creates a hidden anchor and clicks it', () => {
    const clickSpy = vi.fn()
    const createElementOrig = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = createElementOrig(tag)
      if (tag === 'a') el.click = clickSpy
      return el
    })

    downloadFile('hello', 'test.csv', 'text/csv')

    expect(clickSpy).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})

describe('formatExportTimestamp', () => {
  it('returns a string without colons or dots', () => {
    const ts = formatExportTimestamp()
    expect(ts).not.toMatch(/[:.]/
    )
  })

  it('returns a 19-character string', () => {
    expect(formatExportTimestamp().length).toBe(19)
  })
})
