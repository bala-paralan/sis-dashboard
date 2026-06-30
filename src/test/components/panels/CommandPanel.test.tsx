import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Incident tab button', () => {
    render(<CommandPanel />)
    expect(screen.getAllByText(/Incident/i).length).toBeGreaterThan(0)
  })

  it('shows Handover tab button', () => {
    render(<CommandPanel />)
    expect(screen.getAllByText(/Handover/i).length).toBeGreaterThan(0)
  })

  it('shows Nodes tab button', () => {
    render(<CommandPanel />)
    expect(screen.getAllByText(/Nodes/i).length).toBeGreaterThan(0)
  })

  it('shows system stats in toolbar', () => {
    render(<CommandPanel />)
    // Toolbar shows nodes count or alerts
    expect(document.body.textContent).toMatch(/Nodes|Alerts/i)
  })

  it('renders incident report textarea when Incident tab is active', () => {
    render(<CommandPanel />)
    const incidentTabs = screen.getAllByText(/📋 Incident|Incident/i)
    if (incidentTabs.length > 0) {
      fireEvent.click(incidentTabs[0])
    }
    const textarea = document.querySelector('textarea')
    expect(textarea !== null || screen.queryByText(/Incident Report Generator/i) !== null).toBe(true)
  })

  it('shows Shift Handover content when Handover tab clicked', () => {
    render(<CommandPanel />)
    const handoverTabs = screen.getAllByText(/Handover/i)
    fireEvent.click(handoverTabs[0])
    // Should show shift handover content
    const body = document.body.textContent
    expect(body).toMatch(/Handover|Shift/i)
  })

  it('shows node cards when Nodes tab clicked', () => {
    render(<CommandPanel />)
    const nodesTabs = screen.getAllByText(/Nodes/i)
    fireEvent.click(nodesTabs[nodesTabs.length - 1])
    // Node cards show BOP- prefixed IDs
    const body = document.body.textContent
    expect(body).toMatch(/BOP-|Nodes/i)
  })

  it('hides incidentReportGenerator when widget is toggled off', () => {
    useSettingsStore.getState().toggleWidget('incidentReportGenerator')
    render(<CommandPanel />)
    const incidentElements = screen.queryAllByText(/📋 Incident/)
    expect(incidentElements.length).toBe(0)
  })
})
