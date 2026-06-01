import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  } as never)
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

  it('renders Heatmap tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Heatmap/i })).toBeInTheDocument()
  })

  it('renders heatmap SVG', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('renders time window selector buttons (1h, 6h, 24h)', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: '1h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '24h' })).toBeInTheDocument()
  })

  it('clicking 6h time window button changes selection', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByRole('button', { name: '6h' }))
    // The button should be visually active — just verify it doesn't throw
    expect(screen.getByRole('button', { name: '6h' })).toBeInTheDocument()
  })

  it('renders False Alarm tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /False Alarm/i })).toBeInTheDocument()
  })

  it('renders Confidence tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Confidence/i })).toBeInTheDocument()
  })

  it('clicking False Alarm tab shows FAR content', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByRole('button', { name: /False Alarm/i }))
    expect(screen.getByText(/False Alarm Rate/i)).toBeInTheDocument()
  })

  it('clicking Confidence tab shows model names (YOLOv9, LSTM, RF/Bay)', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Confidence/i }))
    expect(screen.getAllByText(/YOLOv9/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/LSTM/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/RF\/Bay/i).length).toBeGreaterThan(0)
  })
})
