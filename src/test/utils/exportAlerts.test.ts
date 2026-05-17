import { describe, it, expect } from 'vitest'
import { exportAlertsCSV } from '@/utils/formatters'

function makeRow(overrides = {}) {
  return {
    id:             'alert-001',
    threat_level:   'HIGH',
    classification: 'INTRUSION',
    description:    'Seismic anomaly',
    timestamp:      '2026-05-01T10:00:00.000Z',
    acknowledged:   false,
    ...overrides,
  }
}

describe('exportAlertsCSV', () => {
  it('returns a CSV string with a header row', () => {
    const csv = exportAlertsCSV([])
    expect(csv).toMatch(/^id,severity,classification,description,timestamp,acknowledged/)
  })

  it('returns only the header when alerts array is empty', () => {
    const csv = exportAlertsCSV([])
    expect(csv.trim()).toBe('id,severity,classification,description,timestamp,acknowledged')
  })

  it('produces one data row for a single alert', () => {
    const csv = exportAlertsCSV([makeRow()])
    const lines = csv.trim().split('\n')
    expect(lines).toHaveLength(2)
  })

  it('includes alert id in the row', () => {
    const csv = exportAlertsCSV([makeRow({ id: 'a-123' })])
    expect(csv).toContain('"a-123"')
  })

  it('includes threat_level as severity', () => {
    const csv = exportAlertsCSV([makeRow({ threat_level: 'CRITICAL' })])
    expect(csv).toContain('"CRITICAL"')
  })

  it('includes description', () => {
    const csv = exportAlertsCSV([makeRow({ description: 'Test desc' })])
    expect(csv).toContain('"Test desc"')
  })

  it('includes timestamp', () => {
    const csv = exportAlertsCSV([makeRow({ timestamp: '2026-05-01T10:00:00.000Z' })])
    expect(csv).toContain('"2026-05-01T10:00:00.000Z"')
  })

  it('represents acknowledged=true as true', () => {
    const csv = exportAlertsCSV([makeRow({ acknowledged: true })])
    expect(csv).toContain('true')
  })

  it('represents acknowledged=false as false', () => {
    const csv = exportAlertsCSV([makeRow({ acknowledged: false })])
    expect(csv).toContain('false')
  })

  it('produces N+1 lines for N alerts (header + N data rows)', () => {
    const alerts = [makeRow({ id: 'a1' }), makeRow({ id: 'a2' }), makeRow({ id: 'a3' })]
    const csv = exportAlertsCSV(alerts)
    const lines = csv.trim().split('\n')
    expect(lines).toHaveLength(4)
  })

  it('escapes double quotes in description fields', () => {
    const csv = exportAlertsCSV([makeRow({ description: 'He said "hello"' })])
    expect(csv).toContain('"He said ""hello"""')
  })

  it('escapes double quotes in classification fields', () => {
    const csv = exportAlertsCSV([makeRow({ classification: 'Type "A" breach' })])
    expect(csv).toContain('"Type ""A"" breach"')
  })
})
