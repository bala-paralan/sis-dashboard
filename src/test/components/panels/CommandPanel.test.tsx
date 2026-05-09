import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders node status cards', () => {
    render(<CommandPanel />)
    // Nodes like BOP-ALPHA-01 are rendered in the initial state
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('renders multiple BOP node identifiers', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/BOP-BETA-01/i)).toBeInTheDocument()
    expect(screen.getByText(/BOP-GAMMA-01/i)).toBeInTheDocument()
  })

  it('shows ONLINE status for healthy nodes', () => {
    render(<CommandPanel />)
    const online = screen.queryAllByText('ONLINE')
    expect(online.length).toBeGreaterThan(0)
  })

  it('shows OFFLINE status for the echo node', () => {
    render(<CommandPanel />)
    const offline = screen.queryByText('OFFLINE')
    expect(offline).toBeInTheDocument()
  })

  it('shows DEGRADED status badge', () => {
    render(<CommandPanel />)
    const degraded = screen.queryAllByText('DEGRADED')
    expect(degraded.length).toBeGreaterThan(0)
  })

  it('renders health as a progress bar (width style attribute)', () => {
    render(<CommandPanel />)
    // Health is rendered as a div with width:XX% in inline style
    const healthBars = document.querySelectorAll('[style*="width:"]')
    expect(healthBars.length).toBeGreaterThan(0)
  })

  it('does not crash when widget is disabled in settings', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'multiNodeOverview' ? { ...w, visible: false } : w
      ),
    })
    expect(() => render(<CommandPanel />)).not.toThrow()
  })
})
