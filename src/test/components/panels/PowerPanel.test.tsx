import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows nodes count in stats bar', () => {
    render(<PowerPanel />)
    expect(screen.getByText('Nodes:')).toBeInTheDocument()
    expect(screen.getByText('4', { selector: 'strong' })).toBeInTheDocument()
  })

  it('renders BOP node names in power view', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
    expect(screen.getByText(/BOP-BETA-01/i)).toBeInTheDocument()
    expect(screen.getByText(/BOP-GAMMA-01/i)).toBeInTheDocument()
    expect(screen.getByText(/BOP-DELTA-01/i)).toBeInTheDocument()
  })

  it('shows radial gauge SVGs for power nodes', () => {
    render(<PowerPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows Battery, Solar, Load gauge labels', () => {
    render(<PowerPanel />)
    expect(screen.getAllByText('Battery').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Solar').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Load').length).toBeGreaterThan(0)
  })

  it('shows sub-tabs for Power & Energy and Vehicle Health when both visible', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Power & Energy/i)).toBeInTheDocument()
    expect(screen.getByText(/Vehicle Health/i)).toBeInTheDocument()
  })

  it('switches to vehicle tab and shows vehicle callsigns', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    expect(screen.getByText(/Gypsy Alpha/i)).toBeInTheDocument()
    expect(screen.getByText(/Stallion Bravo/i)).toBeInTheDocument()
    expect(screen.getByText(/Rover Charlie/i)).toBeInTheDocument()
  })

  it('shows vehicle fault indicator for WARNING vehicles', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    // "vehicle fault" appears in stats bar, per-vehicle fault count in the list
    expect(screen.getAllByText(/fault/i).length).toBeGreaterThan(0)
  })

  it('shows vehicle status labels (OPERATIONAL, WARNING)', () => {
    render(<PowerPanel />)
    fireEvent.click(screen.getByText(/Vehicle Health/i))
    expect(screen.getAllByText('OPERATIONAL').length).toBeGreaterThan(0)
    expect(screen.getByText('WARNING')).toBeInTheDocument()
  })

  it('shows only power tab when vehicleHealthMonitor is disabled', () => {
    useSettingsStore.getState().toggleWidget('vehicleHealthMonitor')
    render(<PowerPanel />)
    expect(screen.queryByText(/Vehicle Health/i)).not.toBeInTheDocument()
    // BOP nodes still shown
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })
})
