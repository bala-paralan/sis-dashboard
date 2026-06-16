import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) => {
      const ids = ['multiNodeOverview', 'incidentReportGenerator', 'shiftHandoverSummary', 'cibmsNatgridFeedMonitor']
      return ids.includes(w.id) ? { ...w, visible: true } : w
    }),
  }))
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Nodes count in stats bar', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('renders Nodes, Incident, and Handover sub-tabs', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /Nodes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Incident/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Handover/i })).toBeInTheDocument()
  })

  it('shows BOP node IDs in nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('shows sort buttons in nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /threat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /alerts/i })).toBeInTheDocument()
  })

  it('switches to Incident tab and shows Export PDF button', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Incident/i }))
    expect(screen.getByRole('button', { name: /Export PDF/i })).toBeInTheDocument()
  })

  it('shows Auto-populated label in incident tab', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Incident/i }))
    expect(screen.getByText(/Auto-populated from live data/i)).toBeInTheDocument()
  })

  it('switches to Handover tab and shows Sign & Export button', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Handover/i }))
    expect(screen.getByRole('button', { name: /Sign.*Export/i })).toBeInTheDocument()
  })

  it('shows OFFLINE node in the list', () => {
    render(<CommandPanel />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('shows CIBMS link status when cibmsNatgridFeedMonitor is visible', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/CIBMS LINK ACTIVE/i)).toBeInTheDocument()
  })
})
