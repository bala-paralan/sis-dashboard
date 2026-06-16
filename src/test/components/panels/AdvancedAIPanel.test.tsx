import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) => {
      const ids = ['behaviouralPatternHeatmap', 'falseAlarmRateTracker', 'aiModelConfidenceMonitor']
      return ids.includes(w.id) ? { ...w, visible: true } : w
    }),
  }))
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
  vi.useFakeTimers()
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
    expect(screen.getByText(/FAR avg:/i)).toBeInTheDocument()
  })

  it('shows Rejected count in stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Rejected:/i)).toBeInTheDocument()
  })

  it('shows Alerts (7d) count in stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Alerts \(7d\):/i)).toBeInTheDocument()
  })

  it('renders Heatmap, False Alarm, and Confidence sub-tabs', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getAllByText(/Heatmap/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/False Alarm/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Confidence/i).length).toBeGreaterThan(0)
  })

  it('shows heatmap time window buttons 1h 6h 24h', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: '1h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '24h' })).toBeInTheDocument()
  })

  it('shows High-activity zones section in heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/High-activity zones/i)).toBeInTheDocument()
  })

  it('switches to False Alarm tab and shows per-sensor FAR heading', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/False Alarm/i))
    expect(screen.getByText(/Per-sensor false alarm rate/i)).toBeInTheDocument()
  })

  it('shows Export Audit CSV button in false alarm tab', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/False Alarm/i))
    expect(screen.getByRole('button', { name: /Export Audit CSV/i })).toBeInTheDocument()
  })

  it('renders Export PNG button in heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Export PNG/i })).toBeInTheDocument()
  })
})
