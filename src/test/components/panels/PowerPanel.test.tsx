import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the stats bar with Nodes count', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Nodes:/)).toBeInTheDocument()
  })

  it('renders Power & Energy tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/⚡ Power & Energy/)).toBeInTheDocument()
  })

  it('renders Vehicle Health tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/🚗 Vehicle Health/)).toBeInTheDocument()
  })

  it('renders all 4 BOP node IDs in the power tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/)).toBeInTheDocument()
    expect(screen.getByText(/BOP-BETA-01/)).toBeInTheDocument()
    expect(screen.getByText(/BOP-GAMMA-01/)).toBeInTheDocument()
    expect(screen.getByText(/BOP-DELTA-01/)).toBeInTheDocument()
  })

  it('shows Battery gauge labels in power tab', () => {
    render(<PowerPanel />)
    // RadialGauge renders "Battery" label per node
    const battLabels = screen.getAllByText('Battery')
    expect(battLabels.length).toBe(4)
  })

  it('shows Solar gauge labels in power tab', () => {
    render(<PowerPanel />)
    const solarLabels = screen.getAllByText('Solar')
    expect(solarLabels.length).toBe(4)
  })

  it('switches to vehicle tab and shows vehicle callsigns', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/🚗 Vehicle Health/))
    expect(screen.getByText('Gypsy Alpha')).toBeInTheDocument()
    expect(screen.getByText('Stallion Bravo')).toBeInTheDocument()
    expect(screen.getByText('Rover Charlie')).toBeInTheDocument()
  })

  it('shows vehicle OPERATIONAL status in vehicle tab', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/🚗 Vehicle Health/))
    expect(screen.getAllByText('OPERATIONAL').length).toBeGreaterThan(0)
  })

  it('shows vehicle WARNING status in vehicle tab', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/🚗 Vehicle Health/))
    expect(screen.getByText('WARNING')).toBeInTheDocument()
  })

  it('shows GEN state labels for power nodes', () => {
    render(<PowerPanel />)
    // Generator state shows as "GEN ON" or "GEN OFF"
    const genLabels = screen.queryAllByText(/GEN (ON|OFF)/)
    expect(genLabels.length).toBeGreaterThan(0)
  })
})
