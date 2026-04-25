import { describe, it, expect } from 'vitest'
import { exportAlertsCSV } from '@/utils/exportCSV'
import type { Alert } from '@/types/sensors'

function makeAlert(overrides?: Partial<Alert>): Alert {
  return {
    id:              'alert-001',
    timestamp:       '2024-06-15T12:00:00Z',
    source_sensors:  ['S01-GEO-001'],
    location:        '21.94, 88.12',
    classification:  'INTRUSION',
    threat_level:    'HIGH',
    acknowledged:    false,
    description:     'Seismic activity detected',
    sensor_family:   'Seismic',
    ...overrides,
  }
}

describe('exportAlertsCSV', () => {
  it('returns a CSV string with a header row', () => {
    const csv = exportAlertsCSV([])
    const [header] = csv.split('\n')
    expect(header).toBe('id,timestamp,threat_level,sensor_family,message,acknowledged')
  })

  it('returns only the header for an empty array', () => {
    const csv = exportAlertsCSV([])
    expect(csv.split('\n')).toHaveLength(1)
  })

  it('produces one data row per alert', () => {
    const alerts = [makeAlert(), makeAlert({ id: 'alert-002' })]
    const rows   = exportAlertsCSV(alerts).split('\n')
    expect(rows).toHaveLength(3) // header + 2 data rows
  })

  it('includes the correct values in a data row', () => {
    const alert = makeAlert()
    const csv   = exportAlertsCSV([alert])
    const dataRow = csv.split('\n')[1]
    expect(dataRow).toContain('alert-001')
    expect(dataRow).toContain('2024-06-15T12:00:00Z')
    expect(dataRow).toContain('HIGH')
    expect(dataRow).toContain('Seismic')
    expect(dataRow).toContain('Seismic activity detected')
    expect(dataRow).toContain('false')
  })

  it('wraps fields containing commas in double-quotes', () => {
    const alert = makeAlert({ description: 'Alpha, Beta' })
    const csv   = exportAlertsCSV([alert])
    expect(csv).toContain('"Alpha, Beta"')
  })

  it('escapes internal double-quotes by doubling them', () => {
    const alert = makeAlert({ description: 'He said "alert"' })
    const csv   = exportAlertsCSV([alert])
    expect(csv).toContain('"He said ""alert"""')
  })

  it('handles missing optional sensor_family (outputs empty string)', () => {
    const alert = makeAlert({ sensor_family: undefined })
    const csv   = exportAlertsCSV([alert])
    const dataRow = csv.split('\n')[1]
    const cols = dataRow.split(',')
    expect(cols[3]).toBe('')
  })

  it('serialises acknowledged=true as "true"', () => {
    const alert = makeAlert({ acknowledged: true })
    const csv   = exportAlertsCSV([alert])
    expect(csv).toContain('true')
  })

  it('handles fields with newlines inside double-quotes', () => {
    const alert = makeAlert({ description: 'Line1\nLine2' })
    const csv   = exportAlertsCSV([alert])
    expect(csv).toContain('"Line1\nLine2"')
  })
})
