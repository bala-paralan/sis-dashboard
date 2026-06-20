import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildReportJSON, exportIncidentReport } from '@/utils/exportReport'
import type { IncidentReport } from '@/utils/exportReport'

function makeReport(overrides?: Partial<IncidentReport>): IncidentReport {
  return {
    reportId: 'RPT-001',
    timestamp: '2026-05-20T10:00:00.000Z',
    operator: 'Test Operator',
    node: 'BOP-ALPHA-01',
    activeAlerts: 3,
    nodesOnline: 4,
    nodesTotal: 5,
    threatLevel: 'LOW',
    narrative: 'No significant activity.',
    ...overrides,
  }
}

// ── buildReportJSON (pure) ────────────────────────────────────────────────────

describe('buildReportJSON', () => {
  it('returns valid JSON', () => {
    expect(() => JSON.parse(buildReportJSON(makeReport()))).not.toThrow()
  })

  it('serialises all required fields', () => {
    const report = makeReport()
    const parsed = JSON.parse(buildReportJSON(report)) as IncidentReport
    expect(parsed.reportId).toBe('RPT-001')
    expect(parsed.timestamp).toBe('2026-05-20T10:00:00.000Z')
    expect(parsed.activeAlerts).toBe(3)
    expect(parsed.nodesOnline).toBe(4)
    expect(parsed.nodesTotal).toBe(5)
    expect(parsed.threatLevel).toBe('LOW')
    expect(parsed.narrative).toBe('No significant activity.')
  })

  it('includes optional metadata when present', () => {
    const report = makeReport({ metadata: { type: 'SHIFT_HANDOVER', period: '12h' } })
    const parsed = JSON.parse(buildReportJSON(report)) as IncidentReport
    expect(parsed.metadata).toEqual({ type: 'SHIFT_HANDOVER', period: '12h' })
  })

  it('omits metadata key when not provided', () => {
    const report = makeReport({ metadata: undefined })
    const parsed = JSON.parse(buildReportJSON(report)) as IncidentReport
    expect(parsed.metadata).toBeUndefined()
  })

  it('produces pretty-printed JSON (indented)', () => {
    const json = buildReportJSON(makeReport())
    expect(json).toContain('\n')
    expect(json).toContain('  ')
  })
})

// ── exportIncidentReport (DOM side-effects) ───────────────────────────────────

describe('exportIncidentReport', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>
  let revokeObjectURLMock: ReturnType<typeof vi.fn>
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>
  let clickMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    clickMock = vi.fn()
    createObjectURLMock = vi.fn(() => 'blob:test-url')
    revokeObjectURLMock = vi.fn()
    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) {
        node.click = clickMock
      }
      return node
    })
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
  })

  afterEach(() => {
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('creates a Blob with JSON mime type', () => {
    exportIncidentReport(makeReport())
    expect(createObjectURLMock).toHaveBeenCalledOnce()
    const blob = createObjectURLMock.mock.calls[0][0] as Blob
    expect(blob.type).toBe('application/json;charset=utf-8;')
  })

  it('uses default filename with reportId and current date', () => {
    const today = new Date().toISOString().slice(0, 10)
    exportIncidentReport(makeReport({ reportId: 'RPT-001' }))
    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement
    expect(anchor.download).toBe(`sis-incident-RPT-001-${today}.json`)
  })

  it('uses custom filename when provided', () => {
    exportIncidentReport(makeReport(), 'my-report.json')
    const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement
    expect(anchor.download).toBe('my-report.json')
  })

  it('triggers a click on the anchor element', () => {
    exportIncidentReport(makeReport())
    expect(clickMock).toHaveBeenCalledOnce()
  })

  it('revokes the object URL after triggering download', () => {
    exportIncidentReport(makeReport())
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url')
  })

  it('appends and removes the anchor element', () => {
    exportIncidentReport(makeReport())
    expect(appendChildSpy).toHaveBeenCalledOnce()
    expect(removeChildSpy).toHaveBeenCalledOnce()
  })
})
