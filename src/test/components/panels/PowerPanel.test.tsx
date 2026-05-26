import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => {
      if (['powerEnergyMonitor', 'vehicleHealthMonitor'].includes(w.id)) {
        return { ...w, visible: true }
      }
      return w
    }),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PowerPanel', () => {
  it('renders without throwing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Power & Energy tab button when both widgets are visible', () => {
    render(<PowerPanel />)
    expect(screen.getByRole('button', { name: /Power & Energy/i })).toBeInTheDocument()
  })

  it('shows Vehicle Health tab button when both widgets are visible', () => {
    render(<PowerPanel />)
    expect(screen.getByRole('button', { name: /Vehicle Health/i })).toBeInTheDocument()
  })

  it('shows all four BOP node IDs in the power tab (default)', () => {
    render(<PowerPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-BETA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-GAMMA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-DELTA-01')).toBeInTheDocument()
  })

  it('shows Solar metric labels in power tab', () => {
    render(<PowerPanel />)
    const solarLabels = screen.getAllByText(/Solar/i)
    expect(solarLabels.length).toBeGreaterThan(0)
  })

  it('shows Battery metric labels in power tab', () => {
    render(<PowerPanel />)
    const batteryLabels = screen.getAllByText(/Battery/i)
    expect(batteryLabels.length).toBeGreaterThan(0)
  })

  it('shows only power section (no tab) when vehicleHealthMonitor is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'vehicleHealthMonitor' ? { ...w, visible: false } : w
      ),
    })
    render(<PowerPanel />)
    // No tab buttons when only one section is visible
    expect(screen.queryByRole('button', { name: /Vehicle Health/i })).not.toBeInTheDocument()
    // But node IDs are still visible
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
  })

  it('shows only vehicle section (no tab) when powerEnergyMonitor is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'powerEnergyMonitor' ? { ...w, visible: false } : w
      ),
    })
    render(<PowerPanel />)
    expect(screen.queryByRole('button', { name: /Power & Energy/i })).not.toBeInTheDocument()
  })

  it('hides all sections when both widgets are hidden', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        ['powerEnergyMonitor', 'vehicleHealthMonitor'].includes(w.id) ? { ...w, visible: false } : w
      ),
    })
    render(<PowerPanel />)
    expect(screen.queryByText('BOP-ALPHA-01')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Power & Energy/i })).not.toBeInTheDocument()
  })
})
