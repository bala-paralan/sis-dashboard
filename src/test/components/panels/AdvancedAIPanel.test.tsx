import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      ['behaviouralPatternHeatmap', 'falseAlarmRateTracker', 'aiModelConfidenceMonitor'].includes(w.id)
        ? { ...w, visible: true }
        : w,
    ),
  }))
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', status: 'ALL', sensor: 'ALL' } })
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders Heatmap tab button', () => {
    render(<AdvancedAIPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Heatmap/i)
  })

  it('renders False Alarm tab button', () => {
    render(<AdvancedAIPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/False Alarm/i)
  })

  it('renders Confidence tab button', () => {
    render(<AdvancedAIPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Confidence/i)
  })

  it('renders time window toggle buttons for heatmap', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: '1h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '24h' })).toBeInTheDocument()
  })

  it('renders high-activity zones section in heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/High-activity zones/i)).toBeInTheDocument()
  })

  it('switches to False Alarm tab and shows FAR content', () => {
    render(<AdvancedAIPanel />)
    const farTab = screen.getByRole('button', { name: /False Alarm/i })
    fireEvent.click(farTab)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/false alarm rate|ACOUSTIC|SEISMIC|RADAR/i)
  })

  it('switches to Confidence tab and shows model type labels', () => {
    render(<AdvancedAIPanel />)
    const confTab = screen.getByRole('button', { name: /Confidence/i })
    fireEvent.click(confTab)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/YOLO|LSTM|RF/)
  })

  it('renders confidence bucket ranges in Confidence tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Confidence/i }))
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/50-60%|60-70%|70-80%|80-90%|90-100%/)
  })

  it('hides heatmap tab when behaviouralPatternHeatmap is disabled', () => {
    useSettingsStore.setState((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === 'behaviouralPatternHeatmap' ? { ...w, visible: false } : w,
      ),
    }))
    render(<AdvancedAIPanel />)
    const body = document.body.textContent ?? ''
    expect(body).not.toMatch(/High-activity zones/)
  })

  it('renders Export PNG button in heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Export PNG/i })).toBeInTheDocument()
  })
})
