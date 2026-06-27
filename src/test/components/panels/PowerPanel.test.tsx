import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

function enableBothWidgets() {
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) =>
      w.id === 'powerEnergyMonitor' || w.id === 'vehicleHealthMonitor'
        ? { ...w, visible: true }
        : w
    ),
  })
}

beforeEach(() => {
  enableBothWidgets()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows node count in stats bar', () => {
    render(<PowerPanel />)
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText(/Nodes/i)).toBeInTheDocument()
  })

  it('shows Power & Energy tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Power & Energy/i)).toBeInTheDocument()
  })

  it('shows Vehicle Health tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Vehicle Health/i)).toBeInTheDocument()
  })

  it('shows power node IDs', () => {
    render(<PowerPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-BETA-01')).toBeInTheDocument()
  })

  it('shows Battery, Solar, Load gauge labels for nodes', () => {
    render(<PowerPanel />)
    const batteryLabels = screen.getAllByText('Battery')
    expect(batteryLabels.length).toBeGreaterThan(0)
    const solarLabels = screen.getAllByText('Solar')
    expect(solarLabels.length).toBeGreaterThan(0)
  })

  it('switches to vehicle tab when clicked', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    expect(screen.getByText('Gypsy Alpha')).toBeInTheDocument()
  })

  it('shows vehicle callsigns on vehicle tab', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    expect(screen.getByText('Gypsy Alpha')).toBeInTheDocument()
    expect(screen.getByText('Stallion Bravo')).toBeInTheDocument()
    expect(screen.getByText('Rover Charlie')).toBeInTheDocument()
  })

  it('shows OPERATIONAL status for healthy vehicles', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    expect(screen.getAllByText('OPERATIONAL').length).toBeGreaterThan(0)
  })

  it('shows WARNING status for degraded vehicle', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    expect(screen.getByText('WARNING')).toBeInTheDocument()
  })

  it('shows fault codes when vehicle is expanded', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    // Click on Stallion Bravo (has fault codes)
    fireEvent.click(screen.getByText('Stallion Bravo'))
    expect(screen.getByText(/P0300/)).toBeInTheDocument()
  })

  it('shows Export Report button in expanded vehicle view', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    fireEvent.click(screen.getByText('Stallion Bravo'))
    expect(screen.getByText(/Export Report/i)).toBeInTheDocument()
  })
})
