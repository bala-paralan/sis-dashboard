import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      ['multiNodeOverview', 'incidentReportGenerator', 'shiftHandoverSummary', 'cibmsNatgridFeedMonitor'].includes(w.id)
        ? { ...w, enabled: true }
        : w,
    ),
  }))
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the stats bar with node count', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('renders BOP node IDs in the nodes tab', () => {
    render(<CommandPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/BOP-ALPHA-01|BOP-BETA-01|BOP-GAMMA-01/)
  })

  it('renders node status badges (ONLINE/DEGRADED/OFFLINE)', () => {
    render(<CommandPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/ONLINE|DEGRADED|OFFLINE/)
  })

  it('renders sort buttons in nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /threat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /alerts/i })).toBeInTheDocument()
  })

  it('switches to Incident tab when clicked', () => {
    render(<CommandPanel />)
    const incidentTab = screen.getByRole('button', { name: /Incident/i })
    fireEvent.click(incidentTab)
    expect(screen.getByText(/Incident Report Generator/i)).toBeInTheDocument()
  })

  it('shows auto-populated data in incident tab', () => {
    render(<CommandPanel />)
    const incidentTab = screen.getByRole('button', { name: /Incident/i })
    fireEvent.click(incidentTab)
    expect(screen.getByText(/Auto-populated from live data/i)).toBeInTheDocument()
  })

  it('renders Export PDF button in incident tab', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Incident/i }))
    expect(screen.getByRole('button', { name: /Export PDF/i })).toBeInTheDocument()
  })

  it('switches to Handover tab when clicked', () => {
    render(<CommandPanel />)
    const handoverTab = screen.getByRole('button', { name: /Handover/i })
    fireEvent.click(handoverTab)
    expect(screen.getByText(/Shift Handover Summary/i)).toBeInTheDocument()
  })

  it('renders period range buttons in handover tab', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Handover/i }))
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/8h|12h|24h/)
  })

  it('shows CIBMS status section when widget is enabled', () => {
    render(<CommandPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/CIBMS/)
  })
})
