import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    isWidgetVisible: () => true,
  })
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows node IDs from mock data', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/)).toBeInTheDocument()
  })

  it('shows solar wattage label', () => {
    render(<PowerPanel />)
    // "Solar" appears in each node's RadialGauge label (4 nodes)
    expect(screen.getAllByText(/Solar/i).length).toBeGreaterThan(0)
  })

  it('shows battery percentage label', () => {
    render(<PowerPanel />)
    // "Battery" appears in each node's RadialGauge label (4 nodes)
    expect(screen.getAllByText(/Battery/i).length).toBeGreaterThan(0)
  })

  it('shows generator status', () => {
    render(<PowerPanel />)
    // Generator shown as "GEN ON" or "GEN OFF"
    expect(screen.getAllByText(/GEN/i).length).toBeGreaterThan(0)
  })

  it('shows vehicle health tab label', () => {
    render(<PowerPanel />)
    // "Vehicle" appears in the "Vehicle Health" sub-tab button and stats bar
    expect(screen.getAllByText(/Vehicle/i).length).toBeGreaterThan(0)
  })

  it('shows fuel indicator in vehicle tab', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    // fuel shown as "⛽ n%" with no separate "Fuel" text label
    expect(screen.getAllByText(/⛽/).length).toBeGreaterThan(0)
  })

  it('shows load wattage label', () => {
    render(<PowerPanel />)
    // "Load" appears in each node's RadialGauge label (4 nodes)
    expect(screen.getAllByText(/Load/i).length).toBeGreaterThan(0)
  })
})
