import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  } as never)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Power & Energy tab button when powerEnergyMonitor visible', () => {
    render(<PowerPanel />)
    expect(screen.getByRole('button', { name: /Power & Energy/i })).toBeInTheDocument()
  })

  it('renders node IDs (BOP-ALPHA-01)', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('renders all four power nodes', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/BOP-BETA-01/i)).toBeInTheDocument()
    expect(screen.getByText(/BOP-GAMMA-01/i)).toBeInTheDocument()
    expect(screen.getByText(/BOP-DELTA-01/i)).toBeInTheDocument()
  })

  it('shows Vehicle Health tab button when vehicleHealthMonitor visible', () => {
    render(<PowerPanel />)
    expect(screen.getByRole('button', { name: /Vehicle Health/i })).toBeInTheDocument()
  })

  it('shows vehicle callsign in vehicle tab', () => {
    render(<PowerPanel />)
    // Click Vehicle Health tab to show vehicle data
    fireEvent.click(screen.getByRole('button', { name: /Vehicle Health/i }))
    expect(screen.getByText(/Gypsy Alpha/i)).toBeInTheDocument()
  })

  it('renders solar power labels', () => {
    render(<PowerPanel />)
    expect(screen.getAllByText(/Solar/i).length).toBeGreaterThan(0)
  })

  it('renders battery percentage labels', () => {
    render(<PowerPanel />)
    expect(screen.getAllByText(/Battery/i).length).toBeGreaterThan(0)
  })
})
