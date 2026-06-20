export interface IncidentReport {
  reportId: string
  timestamp: string
  operator?: string
  node?: string
  activeAlerts: number
  nodesOnline: number
  nodesTotal: number
  threatLevel: string
  narrative: string
  metadata?: Record<string, unknown>
}

export const buildReportJSON = (report: IncidentReport): string =>
  JSON.stringify(report, null, 2)

export const exportIncidentReport = (report: IncidentReport, filename?: string): void => {
  const json = buildReportJSON(report)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const dateStr = new Date().toISOString().slice(0, 10)
  const name = filename ?? `sis-incident-${report.reportId}-${dateStr}.json`
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
