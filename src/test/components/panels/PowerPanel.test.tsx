import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      w.id === 'powerEnergyMonitor' || w.id === 'vehicleHealthMonitor'
        ? { ...w, visible: true }
        : w
    ),
  }))
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Nodes count in stats bar', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('shows vehicle fault indicator when a vehicle has non-OPERATIONAL status', () => {
    render(<PowerPanel />)
    // VH-02 Stallion Bravo has WARNING status → fault indicator should show
    expect(screen.getByText(/vehicle fault/i)).toBeInTheDocument()
  })

  it('renders Power and Vehicle sub-tabs when both widgets visible', () => {
    render(<PowerPanel />)
    expect(screen.getByRole('button', { name: /power/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vehicle/i })).toBeInTheDocument()
  })

  it('switches to vehicle tab and shows vehicle callsigns', () => {
    render(<PowerPanel />)
    const vehicleTab = screen.getByRole('button', { name: /vehicle/i })
    fireEvent.click(vehicleTab)
    expect(screen.getAllByText(/Gypsy Alpha|Stallion Bravo|Rover Charlie/i).length).toBeGreaterThan(0)
  })

  it('shows fault indicator badge on WARNING vehicle', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByRole('button', { name: /vehicle/i }))
    // Stallion Bravo has WARNING status with fault codes, so ⚠ 2 faults badge shows
    expect(screen.getByText(/2 faults/i)).toBeInTheDocument()
  })

  it('renders SVG radial gauges in power view', () => {
    render(<PowerPanel />)
    expect(document.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  it('shows BOP node IDs in power tab', () => {
    render(<PowerPanel />)
    expect(screen.getAllByText(/BOP-ALPHA-01|BOP-BETA-01/i).length).toBeGreaterThan(0)
  })

  it('hides power tab when powerEnergyMonitor is disabled', () => {
    useSettingsStore.setState((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === 'powerEnergyMonitor' ? { ...w, visible: false } : w
      ),
    }))
    render(<PowerPanel />)
    // Without power tab, only vehicle content should be visible
    expect(screen.queryByText(/BOP-ALPHA-01/i)).not.toBeInTheDocument()
  })
})
