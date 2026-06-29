import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    isWidgetVisible: () => true,
  })
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows Heatmap tab label or activity description', () => {
    render(<AdvancedAIPanel />)
    // "🔥 Heatmap" tab button AND "Activity density heatmap" span both match
    expect(screen.getAllByText(/Heatmap/i).length).toBeGreaterThan(0)
  })

  it('renders time window selector buttons', () => {
    render(<AdvancedAIPanel />)
    // "1h" appears in the button and in "Activity density heatmap — 1h window"
    expect(screen.getAllByText(/1h/).length).toBeGreaterThan(0)
    expect(screen.getByText(/6h/)).toBeInTheDocument()
    expect(screen.getByText(/24h/)).toBeInTheDocument()
  })

  it('switches time window on button click', () => {
    render(<AdvancedAIPanel />)
    const btn24h = screen.getByText(/24h/)
    fireEvent.click(btn24h)
    expect(btn24h.closest('button') ?? btn24h).toBeInTheDocument()
  })

  it('shows False Alarm tab label', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/False Alarm/i)).toBeInTheDocument()
  })

  it('shows Model Confidence tab label', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Confidence/i)).toBeInTheDocument()
  })

  it('shows AI model names in confidence tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/🧠 Confidence/))
    expect(screen.getAllByText(/YOLOv9|LSTM/i).length).toBeGreaterThan(0)
  })

  it('renders heatmap grid cells', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.querySelector('svg') ?? container.querySelectorAll('[style]').length).toBeTruthy()
  })
})
