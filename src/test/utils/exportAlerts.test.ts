import { describe, it, expect } from 'vitest'
import { buildAlertsCsv } from '@/utils/exportAlerts'
import type { Alert } from '@/types/sensors'

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'ALT-001',
    timestamp: '2026-06-17T10:00:00.000Z',
    threat_level: 'HIGH',
    sensor_family: 'Seismic',
    source_sensors: ['SEIS-01'],
    location: 'Sector-7',
    classification: 'HUMAN',
    description: 'Ground motion detected',
    acknowledged: false,
    ...overrides,
  }
}

describe('buildAlertsCsv', () => {
  it('returns only header row for an empty alert list', () => {
    const csv = buildAlertsCsv([])
    expect(csv).toBe('id,timestamp,threat_level,sensor_family,location,classification,description,acknowledged')
  })

  it('includes one data row per alert', () => {
    const alerts = [makeAlert(), makeAlert({ id: 'ALT-002', threat_level: 'CRITICAL' })]
    const lines = buildAlertsCsv(alerts).split('\n')
    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('maps all fields correctly', () => {
    const alert = makeAlert({ acknowledged: true })
    const lines = buildAlertsCsv([alert]).split('\n')
    const dataRow = lines[1]
    expect(dataRow).toContain('ALT-001')
    expect(dataRow).toContain('2026-06-17T10:00:00.000Z')
    expect(dataRow).toContain('HIGH')
    expect(dataRow).toContain('Seismic')
    expect(dataRow).toContain('Sector-7')
    expect(dataRow).toContain('HUMAN')
    expect(dataRow).toContain('Ground motion detected')
    expect(dataRow).toContain('true')
  })

  it('escapes commas in description field with double-quotes', () => {
    const alert = makeAlert({ description: 'Sensor A, Sensor B detected' })
    const csv = buildAlertsCsv([alert])
    expect(csv).toContain('"Sensor A, Sensor B detected"')
  })

  it('escapes double-quotes inside field values', () => {
    const alert = makeAlert({ description: 'Alert "critical" zone' })
    const csv = buildAlertsCsv([alert])
    expect(csv).toContain('"Alert ""critical"" zone"')
  })

  it('produces correct CSV column order', () => {
    const header = buildAlertsCsv([]).split('\n')[0]
    expect(header).toBe('id,timestamp,threat_level,sensor_family,location,classification,description,acknowledged')
  })

  it('uses "false" string for unacknowledged alerts', () => {
    const alert = makeAlert({ acknowledged: false })
    const line = buildAlertsCsv([alert]).split('\n')[1]
    expect(line).toContain('false')
  })
})
