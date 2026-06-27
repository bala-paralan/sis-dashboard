import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'
import { useSettingsStore } from '@/store/settingsStore'

function enableAllWidgets() {
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) =>
      ['behaviouralPatternHeatmap', 'falseAlarmRateTracker', 'aiModelConfidenceMonitor'].includes(w.id)
        ? { ...w, visible: true }
        : w
    ),
  })
}

beforeEach(() => {
  enableAllWidgets()
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
    expect(screen.getByText(/Rejected/i)).toBeInTheDocument()
  })

  it('shows Alerts (7d) count in stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Alerts \(7d\)/i)).toBeInTheDocument()
  })

  it('renders heatmap SVG on heatmap tab by default', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows time window buttons (1h, 6h, 24h)', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
  })

  it('shows High-activity zones section', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/High-activity zones/i)).toBeInTheDocument()
  })

  it('switches to False Alarm tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/False Alarm/i))
    expect(screen.getByText(/Per-sensor false alarm rate/i)).toBeInTheDocument()
  })

  it('shows export buttons on False Alarm tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/False Alarm/i))
    expect(screen.getByText(/Rejected Alerts Log/i)).toBeInTheDocument()
    expect(screen.getByText(/Export Audit CSV/i)).toBeInTheDocument()
  })

  it('switches to Confidence tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/Confidence/i))
    expect(screen.getByText(/Model inference confidence distribution/i)).toBeInTheDocument()
  })

  it('shows model names on Confidence tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/Confidence/i))
    // YOLOv9 and LSTM appear in legend, bar labels, and model status — use getAllByText
    expect(screen.getAllByText(/YOLOv9/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/LSTM/i).length).toBeGreaterThan(0)
  })

  it('shows DEGRADED model status on Confidence tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/Confidence/i))
    expect(screen.getByText(/DEGRADED/i)).toBeInTheDocument()
  })

  it('shows Recalibrate button for degraded model', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/Confidence/i))
    expect(screen.getByText(/Recalibrate/i)).toBeInTheDocument()
  })
})
