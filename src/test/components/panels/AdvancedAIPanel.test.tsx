import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  vi.useFakeTimers()
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => {
      if (['behaviouralPatternHeatmap', 'falseAlarmRateTracker', 'aiModelConfidenceMonitor'].includes(w.id)) {
        return { ...w, visible: true }
      }
      return w
    }),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('AdvancedAIPanel', () => {
  it('renders without throwing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Heatmap tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Heatmap/i })).toBeInTheDocument()
  })

  it('shows False Alarm tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /False Alarm/i })).toBeInTheDocument()
  })

  it('shows Confidence tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Confidence/i })).toBeInTheDocument()
  })

  it('shows time window selector buttons in heatmap tab (default)', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: '1h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '24h' })).toBeInTheDocument()
  })

  it('shows High-activity zones heading in default heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/High-activity zones/i)).toBeInTheDocument()
  })

  it('renders SVG heatmap', () => {
    render(<AdvancedAIPanel />)
    expect(document.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  it('switches to false alarm tab on click', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByRole('button', { name: /False Alarm/i }))
    expect(screen.getByText(/false alarm rate/i)).toBeInTheDocument()
  })

  it('hides Heatmap tab when behaviouralPatternHeatmap is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'behaviouralPatternHeatmap' ? { ...w, visible: false } : w
      ),
    })
    render(<AdvancedAIPanel />)
    expect(screen.queryByRole('button', { name: /Heatmap/i })).not.toBeInTheDocument()
  })

  it('hides False Alarm tab when falseAlarmRateTracker is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'falseAlarmRateTracker' ? { ...w, visible: false } : w
      ),
    })
    render(<AdvancedAIPanel />)
    expect(screen.queryByRole('button', { name: /False Alarm/i })).not.toBeInTheDocument()
  })
})
