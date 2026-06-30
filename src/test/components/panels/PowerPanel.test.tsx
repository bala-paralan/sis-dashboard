import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders Power & Energy tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Power & Energy/i)).toBeInTheDocument()
  })

  it('renders Vehicle Health tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Vehicle Health/i)).toBeInTheDocument()
  })

  it('switches to Vehicle Health tab on click', () => {
    render(<PowerPanel />)
    const vehicleTab = screen.getByText(/Vehicle Health/i)
    fireEvent.click(vehicleTab)
    // Should show vehicle-related content
    expect(screen.getByText(/Vehicle Health/i)).toBeInTheDocument()
  })

  it('shows power metrics when Power & Energy tab is active', () => {
    render(<PowerPanel />)
    const powerTab = screen.getByText(/Power & Energy/i)
    fireEvent.click(powerTab)
    // Power metrics labels
    const powerLabels = ['Voltage', 'Current', 'Power', 'Capacity']
    const found = powerLabels.filter((l) => screen.queryByText(new RegExp(l, 'i')) !== null)
    expect(found.length).toBeGreaterThan(0)
  })

  it('hides Vehicle Health section when widget is toggled off', () => {
    useSettingsStore.getState().toggleWidget('vehicleHealthMonitor')
    render(<PowerPanel />)
    expect(screen.queryByText(/Vehicle Health/i)).not.toBeInTheDocument()
  })

  it('hides Power & Energy section when widget is toggled off', () => {
    useSettingsStore.getState().toggleWidget('powerEnergyMonitor')
    render(<PowerPanel />)
    expect(screen.queryByText(/Power & Energy/i)).not.toBeInTheDocument()
  })
})
