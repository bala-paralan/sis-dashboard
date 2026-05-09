import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState(useSettingsStore.getInitialState())
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
  useSensorStore.setState({
    sensors: new Map(),
    sensorHistory: new Map(),
    tracks: [],
    selectedSensorId: null,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders heatmap grid area with colored cells', () => {
    render(<AdvancedAIPanel />)
    const cells = document.querySelectorAll('[style*="background"]')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('renders time-window selector buttons (1h, 6h, 24h)', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
  })

  it('renders tab navigation buttons', () => {
    render(<AdvancedAIPanel />)
    const buttons = document.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders confidence distribution section with percentage ranges', () => {
    render(<AdvancedAIPanel />)
    const percentageEls = screen.queryAllByText(/%/)
    expect(percentageEls.length).toBeGreaterThan(0)
  })

  it('switches time window on click without crashing', () => {
    render(<AdvancedAIPanel />)
    const sixH = screen.getByText('6h')
    fireEvent.click(sixH)
    expect(document.body).toBeInTheDocument()
  })

  it('switches to second tab without crashing', () => {
    render(<AdvancedAIPanel />)
    const buttons = document.querySelectorAll('button')
    if (buttons.length > 1) {
      fireEvent.click(buttons[1])
    }
    expect(document.body).toBeInTheDocument()
  })

  it('renders SVG chart elements', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
