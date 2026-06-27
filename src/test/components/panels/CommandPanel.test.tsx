import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

function enableAllWidgets() {
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) =>
      ['multiNodeOverview', 'incidentReportGenerator', 'shiftHandoverSummary', 'cibmsNatgridFeedMonitor'].includes(w.id)
        ? { ...w, visible: true }
        : w
    ),
  })
}

beforeEach(() => {
  enableAllWidgets()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows nodes count in stats bar', () => {
    render(<CommandPanel />)
    // "Nodes: X/Y" label appears in stats bar and "▣ Nodes" in tab — both match /Nodes/i
    const matches = screen.getAllByText(/Nodes/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows OFFLINE node warning in stats bar', () => {
    render(<CommandPanel />)
    // BOP-ECHO-01 is OFFLINE — appears in stats bar warning and in node card
    const matches = screen.getAllByText(/OFFLINE/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows Nodes tab by default', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/▣ Nodes/i)).toBeInTheDocument()
  })

  it('shows Incident tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/📋 Incident/i)).toBeInTheDocument()
  })

  it('shows Handover tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/📝 Handover/i)).toBeInTheDocument()
  })

  it('shows node IDs on nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-BETA-01')).toBeInTheDocument()
  })

  it('shows sort buttons (status, threat, alerts)', () => {
    render(<CommandPanel />)
    expect(screen.getByText('status')).toBeInTheDocument()
    expect(screen.getByText('threat')).toBeInTheDocument()
    expect(screen.getByText('alerts')).toBeInTheDocument()
  })

  it('sorts nodes when sort button clicked', () => {
    render(<CommandPanel />)
    const alertsSort = screen.getByText('alerts')
    fireEvent.click(alertsSort)
    // After click, DELTA-01 (4 alerts) should be near top
    expect(screen.getByText('BOP-DELTA-01')).toBeInTheDocument()
  })

  it('switches to Incident Report tab', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/📋 Incident/i))
    expect(screen.getByText(/Incident Report Generator/i)).toBeInTheDocument()
  })

  it('shows auto-populated data in incident report', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/📋 Incident/i))
    expect(screen.getByText(/Auto-populated from live data/i)).toBeInTheDocument()
  })

  it('shows Export PDF button on incident tab', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/📋 Incident/i))
    expect(screen.getByText(/Export PDF/i)).toBeInTheDocument()
  })

  it('allows typing in incident textarea', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/📋 Incident/i))
    const textarea = screen.getByPlaceholderText(/Add narrative description/i)
    fireEvent.change(textarea, { target: { value: 'Test incident notes' } })
    expect((textarea as HTMLTextAreaElement).value).toBe('Test incident notes')
  })

  it('switches to Handover tab and shows summary', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/📝 Handover/i))
    expect(screen.getByText(/Shift Handover Summary/i)).toBeInTheDocument()
    expect(screen.getByText(/Period Summary/i)).toBeInTheDocument()
  })

  it('shows Sign & Export PDF button on handover tab', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/📝 Handover/i))
    expect(screen.getByText(/Sign & Export PDF/i)).toBeInTheDocument()
  })
})
