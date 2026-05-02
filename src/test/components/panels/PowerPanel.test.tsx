import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Nodes stat in header bar', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('shows power tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Power & Energy/i)).toBeInTheDocument()
  })

  it('shows vehicle health tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Vehicle Health/i)).toBeInTheDocument()
  })

  it('shows node IDs in power tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
  })

  it('renders radial gauge SVGs', () => {
    render(<PowerPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows Battery label in gauges', () => {
    render(<PowerPanel />)
    const batteryLabels = screen.getAllByText('Battery')
    expect(batteryLabels.length).toBeGreaterThan(0)
  })

  it('shows Solar label in gauges', () => {
    render(<PowerPanel />)
    const solarLabels = screen.getAllByText('Solar')
    expect(solarLabels.length).toBeGreaterThan(0)
  })
})
