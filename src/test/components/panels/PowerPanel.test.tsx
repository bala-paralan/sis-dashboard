import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      ['powerEnergyMonitor', 'vehicleHealthMonitor'].includes(w.id)
        ? { ...w, visible: true }
        : w,
    ),
  }))
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders BOP node IDs', () => {
    render(<PowerPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/BOP-ALPHA-01|BOP-BETA-01|BOP-GAMMA-01|BOP-DELTA-01/)
  })

  it('renders solar power readings', () => {
    render(<PowerPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Solar/i)
  })

  it('renders battery percentage', () => {
    render(<PowerPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/%/)
  })

  it('renders load wattage information', () => {
    render(<PowerPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Load/i)
  })

  it('renders Power tab button when both tabs exist', () => {
    render(<PowerPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Power|Vehicle/i)
  })

  it('renders Vehicle tab and shows vehicle data when clicked', () => {
    render(<PowerPanel />)
    // If there are two tabs, click Vehicle tab to show vehicle data
    const vehicleTab = screen.queryByRole('button', { name: /Vehicle/i })
    if (vehicleTab) {
      fireEvent.click(vehicleTab)
    }
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Gypsy Alpha|Stallion Bravo|Rover Charlie/i)
  })

  it('renders vehicle fuel percentage for vehicles', () => {
    render(<PowerPanel />)
    const vehicleTab = screen.queryByRole('button', { name: /Vehicle/i })
    if (vehicleTab) fireEvent.click(vehicleTab)
    const body = document.body.textContent ?? ''
    // Fuel shown as ⛽ emoji with percentage
    expect(body).toMatch(/⛽/)
  })

  it('renders vehicle status badges (OPERATIONAL/WARNING)', () => {
    render(<PowerPanel />)
    const vehicleTab = screen.queryByRole('button', { name: /Vehicle/i })
    if (vehicleTab) fireEvent.click(vehicleTab)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/OPERATIONAL|WARNING|FAULT/)
  })

  it('renders export report button when a vehicle card is expanded', () => {
    render(<PowerPanel />)
    const vehicleTab = screen.queryByRole('button', { name: /Vehicle/i })
    if (vehicleTab) fireEvent.click(vehicleTab)
    // Click a vehicle card to expand it
    const gypsyBtn = screen.queryByRole('button', { name: /Gypsy Alpha/i })
    if (gypsyBtn) fireEvent.click(gypsyBtn)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Export Report/i)
  })
})
