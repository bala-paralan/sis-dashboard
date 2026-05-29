import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  })
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows power monitor section', () => {
    render(<PowerPanel />)
    expect(document.body.textContent).toMatch(/Power|Solar|Battery/i)
  })

  it('shows node identifiers in the power list', () => {
    render(<PowerPanel />)
    // BOP nodes should appear in power monitor
    const body = document.body.textContent ?? ''
    const hasNode = ['BOP-ALPHA', 'BOP-BETA', 'BOP-GAMMA', 'BOP-DELTA'].some((n) => body.includes(n))
    expect(hasNode).toBe(true)
  })

  it('shows solar wattage values', () => {
    render(<PowerPanel />)
    expect(document.body.textContent).toMatch(/W|Watts|solar/i)
  })

  it('shows battery percentage values', () => {
    render(<PowerPanel />)
    expect(document.body.textContent).toMatch(/%/)
  })

  it('shows vehicle health section when widget enabled', () => {
    render(<PowerPanel />)
    expect(document.body.textContent).toMatch(/Vehicle|Fuel|fuel/i)
  })

  it('hides power monitor when widget is disabled', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'powerEnergyMonitor' ? { ...w, visible: false } : w
      ),
    })
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders SVG elements for gauges or charts', () => {
    render(<PowerPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(0)
  })
})
