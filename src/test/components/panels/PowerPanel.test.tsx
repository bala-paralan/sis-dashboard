import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    expect(() => render(<PowerPanel />)).not.toThrow()
  })

  it('shows power node IDs', () => {
    render(<PowerPanel />)
    expect(screen.getAllByText(/BOP-ALPHA-01/i).length).toBeGreaterThan(0)
  })

  it('shows solar power readings', () => {
    render(<PowerPanel />)
    expect(document.body.textContent).toMatch(/solar|W/i)
  })

  it('shows battery percentage', () => {
    render(<PowerPanel />)
    expect(document.body.textContent).toMatch(/%/)
  })

  it('shows vehicle section', () => {
    render(<PowerPanel />)
    expect(document.body.textContent).toMatch(/vehicle|fuel|battery/i)
  })

  it('renders without crash when widget is hidden', () => {
    useSettingsStore.getState().toggleWidget('powerEnergyMonitor')
    expect(() => render(<PowerPanel />)).not.toThrow()
  })
})
