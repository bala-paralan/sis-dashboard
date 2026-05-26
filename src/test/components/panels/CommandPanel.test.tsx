import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => {
      if (['multiNodeOverview', 'incidentReportGenerator', 'shiftHandoverSummary', 'cibmsNatgridFeedMonitor'].includes(w.id)) {
        return { ...w, visible: true }
      }
      return w
    }),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CommandPanel', () => {
  it('renders without throwing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Nodes tab button', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /Nodes/i })).toBeInTheDocument()
  })

  it('shows Incident tab button when incidentReportGenerator is visible', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /Incident/i })).toBeInTheDocument()
  })

  it('renders all five node IDs in the Nodes tab (default)', () => {
    render(<CommandPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-BETA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-GAMMA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-DELTA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-ECHO-01')).toBeInTheDocument()
  })

  it('shows node location labels', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Sector 1 NW/i)).toBeInTheDocument()
  })

  it('shows ONLINE status for healthy nodes', () => {
    render(<CommandPanel />)
    const onlineEls = screen.getAllByText('ONLINE')
    expect(onlineEls.length).toBeGreaterThan(0)
  })

  it('shows OFFLINE status for downed node', () => {
    render(<CommandPanel />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('shows DEGRADED status', () => {
    render(<CommandPanel />)
    const degraded = screen.getAllByText('DEGRADED')
    expect(degraded.length).toBeGreaterThan(0)
  })

  it('hides Nodes tab when multiNodeOverview widget is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'multiNodeOverview' ? { ...w, visible: false } : w
      ),
    })
    render(<CommandPanel />)
    expect(screen.queryByRole('button', { name: /Nodes/i })).not.toBeInTheDocument()
  })

  it('shows node count in stats bar', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })
})
