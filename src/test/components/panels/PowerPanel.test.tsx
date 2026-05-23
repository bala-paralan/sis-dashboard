import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({
      ...w,
      visible: true,
    })),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows node count in stats bar', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('shows Power & Energy tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Power & Energy/i)).toBeInTheDocument()
  })

  it('shows Vehicle Health tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Vehicle Health/i)).toBeInTheDocument()
  })

  it('shows BOP node IDs in power tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('renders radial gauge SVGs for power nodes', () => {
    render(<PowerPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows solar and battery info for nodes', () => {
    render(<PowerPanel />)
    expect(screen.getAllByText(/Solar/i).length).toBeGreaterThan(0)
  })

  it('switches to Vehicle Health tab on click', () => {
    render(<PowerPanel />)
    const vehicleTab = screen.getByText(/Vehicle Health/i)
    fireEvent.click(vehicleTab)
    // Should show vehicle callsigns (3 vehicles, multiple matches expected)
    expect(screen.getAllByText(/Gypsy Alpha|Stallion Bravo|Rover Charlie/).length).toBeGreaterThan(0)
  })

  it('shows vehicle status indicators', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    expect(screen.getAllByText(/OPERATIONAL|WARNING|FAULT/).length).toBeGreaterThan(0)
  })

  it('shows vehicle fault badge when vehicle has WARNING status', () => {
    render(<PowerPanel />)
    // Stallion Bravo is always WARNING
    expect(screen.getByText(/vehicle fault/i)).toBeInTheDocument()
  })

  it('hides power tab content when powerEnergyMonitor widget is disabled', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'powerEnergyMonitor' ? { ...w, visible: false } : w
      ),
    })
    render(<PowerPanel />)
    // Power tab should not render BOP nodes
    expect(screen.queryByText(/BOP-ALPHA-01/i)).not.toBeInTheDocument()
  })

  it('selects a vehicle for detail view on click', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    const vehicleSpan = screen.getByText(/Gypsy Alpha/)
    // The span is inside a button; click the button
    const vehicleBtn = vehicleSpan.closest('button')!
    fireEvent.click(vehicleBtn)
    // After selection, tyre pressure details should expand
    expect(screen.getByText(/Tyre pressure/i)).toBeInTheDocument()
  })
})
