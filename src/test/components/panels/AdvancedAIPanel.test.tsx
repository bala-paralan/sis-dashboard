import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({
      ...w,
      visible: true,
    })),
  })
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows FAR avg in stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/FAR avg/i)).toBeInTheDocument()
  })

  it('shows Rejected count in stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Rejected:/i)).toBeInTheDocument()
  })

  it('shows Alerts 7d in stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Alerts \(7d\)/i)).toBeInTheDocument()
  })

  it('shows Heatmap tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getAllByText(/Heatmap/i).length).toBeGreaterThan(0)
  })

  it('shows False Alarm tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/False Alarm/i)).toBeInTheDocument()
  })

  it('shows Confidence tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Confidence/i)).toBeInTheDocument()
  })

  it('renders heatmap SVG on heatmap tab', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows time window selectors (1h, 6h, 24h) on heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
  })

  it('switches time window on button click', () => {
    render(<AdvancedAIPanel />)
    const sixHBtn = screen.getByText('6h')
    fireEvent.click(sixHBtn)
    expect(screen.getByText(/6h window/i)).toBeInTheDocument()
  })

  it('switches to False Alarm tab on click', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/False Alarm/i))
    expect(screen.getByText(/False Alarm Rate/i)).toBeInTheDocument()
  })

  it('switches to Confidence tab on click', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/Confidence/i))
    expect(screen.getByText(/Model inference confidence distribution/i)).toBeInTheDocument()
  })

  it('shows confidence range buckets on confidence tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/Confidence/i))
    expect(screen.getByText(/50-60%/)).toBeInTheDocument()
    expect(screen.getByText(/90-100%/)).toBeInTheDocument()
  })

  it('hides heatmap when behaviouralPatternHeatmap widget is disabled', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'behaviouralPatternHeatmap' ? { ...w, visible: false } : w
      ),
    })
    render(<AdvancedAIPanel />)
    expect(screen.queryByText(/Heatmap/i)).not.toBeInTheDocument()
  })
})
