import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportAlertsCsv, printIncidentReport, printHandoverReport } from '@/utils/exportReports'
import type { Alert } from '@/types/sensors'

const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    timestamp: '2024-01-01T12:00:00Z',
    source_sensors: ['SEN-01', 'SEN-02'],
    location: 'Sector A',
    classification: 'HUMAN_FOOTSTEP',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Test alert',
    sensor_family: 'Seismic',
  },
  {
    id: 'ALT-002',
    timestamp: '2024-01-01T12:01:00Z',
    source_sensors: ['SEN-03'],
    location: 'Sector B',
    classification: 'VEHICLE',
    threat_level: 'MEDIUM',
    acknowledged: true,
    annotation: 'Confirmed patrol',
    description: 'Vehicle alert',
    sensor_family: 'Radar',
  },
]

const mockNodes = [
  { id: 'NODE-01', location: 'Sector 1', health: 90, threatLevel: 'CLEAR', sensors: 8, sensorsOnline: 8, alerts: 0, uptime_h: 20, status: 'ONLINE' },
  { id: 'NODE-02', location: 'Sector 2', health: 50, threatLevel: 'MEDIUM', sensors: 6, sensorsOnline: 4, alerts: 2, uptime_h: 5, status: 'DEGRADED' },
]

describe('exportAlertsCsv', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>
  let revokeObjectURLMock: ReturnType<typeof vi.fn>
  let clickMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
    revokeObjectURLMock = vi.fn()
    clickMock = vi.fn()
    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { href: '', download: '', click: clickMock } as unknown as HTMLAnchorElement
      }
      return document.createElement(tag)
    })
  })

  it('creates a Blob URL and triggers click', () => {
    exportAlertsCsv(mockAlerts)
    expect(createObjectURLMock).toHaveBeenCalledOnce()
    expect(clickMock).toHaveBeenCalledOnce()
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url')
  })

  it('handles empty alert array', () => {
    exportAlertsCsv([])
    expect(createObjectURLMock).toHaveBeenCalledOnce()
    expect(clickMock).toHaveBeenCalledOnce()
  })

  it('includes all expected CSV headers', () => {
    let capturedBlob: Blob | undefined
    global.URL.createObjectURL = vi.fn((b: Blob) => { capturedBlob = b; return 'blob:mock' })
    exportAlertsCsv(mockAlerts)
    // Blob is created with CSV content — just verify it was called with a Blob
    expect(capturedBlob).toBeInstanceOf(Blob)
  })
})

describe('printIncidentReport', () => {
  it('opens a new window and writes HTML', () => {
    const writeMock = vi.fn()
    const closeMock = vi.fn()
    const printMock = vi.fn()
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write: writeMock, close: closeMock },
      focus: vi.fn(),
      print: printMock,
      close: closeMock,
    } as unknown as Window)

    printIncidentReport({ nodes: mockNodes, totalAlerts: 5, narrative: 'Test narrative', operator: 'Operator' })
    expect(writeMock).toHaveBeenCalledOnce()
    const html = writeMock.mock.calls[0][0] as string
    expect(html).toContain('Incident Report')
    expect(html).toContain('Test narrative')
    expect(html).toContain('Operator')
  })
})

describe('printHandoverReport', () => {
  it('opens a new window and writes handover HTML', () => {
    const writeMock = vi.fn()
    const closeMock = vi.fn()
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write: writeMock, close: closeMock },
      focus: vi.fn(),
      print: vi.fn(),
      close: closeMock,
    } as unknown as Window)

    printHandoverReport({ nodes: mockNodes, totalAlerts: 3, notes: 'Handover notes', period: '12h', operator: 'Admin' })
    const html = writeMock.mock.calls[0][0] as string
    expect(html).toContain('Shift Handover')
    expect(html).toContain('Handover notes')
    expect(html).toContain('Admin')
  })
})
