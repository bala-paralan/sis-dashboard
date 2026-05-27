import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  // Ensure both power widgets are visible
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      ['powerEnergyMonitor', 'vehicleHealthMonitor'].includes(w.id)
        ? { ...w, visible: true }
        : w
    ),
  }))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Power & Energy sub-tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Power & Energy/i)).toBeInTheDocument()
  })

  it('shows Vehicle Health sub-tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Vehicle Health/i)).toBeInTheDocument()
  })

  it('shows node IDs in the power tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('displays battery percentage indicators', () => {
    render(<PowerPanel />)
    const pctLabels = screen.getAllByText(/%/)
    expect(pctLabels.length).toBeGreaterThan(0)
  })

  it('switches to Vehicle tab on click', () => {
    render(<PowerPanel />)
    const vehicleTab = screen.getByText(/Vehicle Health/i)
    fireEvent.click(vehicleTab)
    // Vehicle tab content shows vehicle callsigns/fuel info
    expect(screen.getByText(/Gypsy Alpha/i)).toBeInTheDocument()
  })
})
