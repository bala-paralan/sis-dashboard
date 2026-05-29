import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  })
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

  it('shows stats bar with FAR average', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/FAR avg/i)).toBeInTheDocument()
  })

  it('shows rejected count in stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Rejected/i)).toBeInTheDocument()
  })

  it('shows Heatmap tab button', () => {
    render(<AdvancedAIPanel />)
    const els = screen.getAllByText(/Heatmap/i)
    expect(els.length).toBeGreaterThan(0)
  })

  it('shows False Alarm tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/False Alarm/i)).toBeInTheDocument()
  })

  it('shows Confidence tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Confidence/i)).toBeInTheDocument()
  })

  it('heatmap tab renders SVG grid', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('switching to False Alarm tab shows per-sensor content', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/False Alarm/i))
    expect(screen.getByText(/Per-sensor false alarm rate/i)).toBeInTheDocument()
  })

  it('switching to Confidence tab shows model status', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/Confidence/i))
    expect(screen.getByText(/Model status/i)).toBeInTheDocument()
  })

  it('confidence tab shows YOLOv9 entry', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getAllByText(/Confidence/i)[0])
    const els = screen.getAllByText(/YOLOv9/i)
    expect(els.length).toBeGreaterThan(0)
  })

  it('heatmap time window buttons render', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
  })

  it('hides heatmap when widget is disabled', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'behaviouralPatternHeatmap' ? { ...w, visible: false } : w
      ),
    })
    render(<AdvancedAIPanel />)
    expect(screen.queryByText(/Activity density heatmap/i)).not.toBeInTheDocument()
  })
})
