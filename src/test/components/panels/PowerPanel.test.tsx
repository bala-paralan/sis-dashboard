import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the BOP node identifiers', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('renders battery percentage values', () => {
    render(<PowerPanel />)
    // Battery values formatted as "XX%" should appear
    const pctEls = screen.queryAllByText(/%/)
    expect(pctEls.length).toBeGreaterThan(0)
  })

  it('renders solar wattage values', () => {
    render(<PowerPanel />)
    // Solar panels produce watts — look for "W" unit label
    const wattEls = screen.queryAllByText(/W/)
    expect(wattEls.length).toBeGreaterThan(0)
  })

  it('renders generator status (ON or OFF)', () => {
    render(<PowerPanel />)
    const genStatus = screen.queryAllByText(/ON|OFF/)
    expect(genStatus.length).toBeGreaterThan(0)
  })

  it('renders tab buttons for vehicles vs power nodes', () => {
    render(<PowerPanel />)
    const tabs = document.querySelectorAll('button')
    expect(tabs.length).toBeGreaterThan(0)
  })

  it('does not crash when powerEnergyMonitor widget is disabled', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'powerEnergyMonitor' ? { ...w, visible: false } : w
      ),
    })
    expect(() => render(<PowerPanel />)).not.toThrow()
  })

  it('renders voltage values', () => {
    render(<PowerPanel />)
    // Battery voltage displayed as "XX.XY V"
    const voltEls = screen.queryAllByText(/V/)
    expect(voltEls.length).toBeGreaterThan(0)
  })
})
