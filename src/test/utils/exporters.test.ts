import { describe, it, expect, vi, beforeEach } from 'vitest'
import { alertsToCsv, reportToText, downloadText, copyToClipboard } from '@/utils/exporters'
import type { Alert } from '@/types/sensors'
import type { IncidentReport } from '@/utils/exporters'

const mockAlert: Alert = {
  id: 'ALT-001',
  timestamp: '2024-01-15T10:30:00Z',
  source_sensors: ['S01-GPR-001', 'S02-GEO-001'],
  location: 'BOP-ALPHA, Sector 3',
  classification: 'Tunnel Activity',
  threat_level: 'HIGH',
  acknowledged: false,
  description: 'Seismic anomaly detected',
}

const mockAckedAlert: Alert = {
  id: 'ALT-002',
  timestamp: '2024-01-15T11:00:00Z',
  source_sensors: ['S07-THR-001'],
  location: 'BOP-BETA, Sector 1',
  classification: 'Human Presence',
  threat_level: 'MEDIUM',
  acknowledged: true,
  description: 'Thermal signature "detected"',
}

const mockReport: IncidentReport = {
  id: 'RPT-001',
  timestamp: '2024-01-15T12:00:00Z',
  title: 'Perimeter breach detected',
  location: 'BOP-ALPHA, North Gate',
  severity: 'HIGH',
  reporter: 'Operator Alpha',
  description: 'Multiple sensors triggered simultaneously.',
  actions: 'QRT dispatched. Area secured.',
}

describe('alertsToCsv', () => {
  it('returns a header row as the first line', () => {
    const csv = alertsToCsv([mockAlert])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('ID,Timestamp,Threat Level,Classification,Location,Source Sensors,Acknowledged,Description')
  })

  it('returns one data row per alert', () => {
    const csv = alertsToCsv([mockAlert, mockAckedAlert])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('includes alert ID in the data row', () => {
    const csv = alertsToCsv([mockAlert])
    expect(csv).toContain('ALT-001')
  })

  it('joins multiple source sensors with semicolon', () => {
    const csv = alertsToCsv([mockAlert])
    expect(csv).toContain('S01-GPR-001; S02-GEO-001')
  })

  it('marks acknowledged alerts as Yes', () => {
    const csv = alertsToCsv([mockAckedAlert])
    expect(csv).toContain('Yes')
  })

  it('marks unacknowledged alerts as No', () => {
    const csv = alertsToCsv([mockAlert])
    expect(csv).toContain('No')
  })

  it('escapes double quotes in description', () => {
    const csv = alertsToCsv([mockAckedAlert])
    expect(csv).toContain('""detected""')
  })

  it('returns only header for empty array', () => {
    const csv = alertsToCsv([])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('ID')
  })
})

describe('reportToText', () => {
  it('includes the report ID in the header', () => {
    const text = reportToText(mockReport)
    expect(text).toContain('RPT-001')
  })

  it('includes the title', () => {
    const text = reportToText(mockReport)
    expect(text).toContain('Perimeter breach detected')
  })

  it('includes location', () => {
    const text = reportToText(mockReport)
    expect(text).toContain('BOP-ALPHA, North Gate')
  })

  it('includes severity', () => {
    const text = reportToText(mockReport)
    expect(text).toContain('HIGH')
  })

  it('includes reporter name', () => {
    const text = reportToText(mockReport)
    expect(text).toContain('Operator Alpha')
  })

  it('includes description body', () => {
    const text = reportToText(mockReport)
    expect(text).toContain('Multiple sensors triggered simultaneously.')
  })

  it('includes actions taken', () => {
    const text = reportToText(mockReport)
    expect(text).toContain('QRT dispatched. Area secured.')
  })

  it('has INCIDENT REPORT as the first line', () => {
    const text = reportToText(mockReport)
    expect(text.startsWith('INCIDENT REPORT')).toBe(true)
  })
})

describe('downloadText', () => {
  beforeEach(() => {
    const clickSpy = vi.fn()
    const anchor = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
    URL.revokeObjectURL = vi.fn()
  })

  it('calls URL.createObjectURL', () => {
    downloadText('report.txt', 'hello')
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('calls URL.revokeObjectURL after click', () => {
    downloadText('report.txt', 'hello')
    expect(URL.revokeObjectURL).toHaveBeenCalled()
  })
})

describe('copyToClipboard', () => {
  it('calls navigator.clipboard.writeText', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, writable: true, configurable: true })
    await copyToClipboard('test text')
    expect(writeText).toHaveBeenCalledWith('test text')
  })
})
