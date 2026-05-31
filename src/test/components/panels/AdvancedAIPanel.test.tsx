import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
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

  it('shows FAR avg stat in the stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/FAR avg/i)).toBeInTheDocument()
  })

  it('shows Rejected stat in the stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Rejected/i)).toBeInTheDocument()
  })

  it('shows Alerts (7d) stat in the stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Alerts \(7d\)/i)).toBeInTheDocument()
  })

  it('renders the heatmap SVG by default', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows High-activity zones section on heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/High-activity zones/i)).toBeInTheDocument()
  })

  it('shows time window buttons (1h, 6h, 24h) on heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: '1h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '24h' })).toBeInTheDocument()
  })

  it('shows sub-tabs when all three widgets are visible', () => {
    // All three widgets are visible by default
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Heatmap/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /False Alarm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confidence/i })).toBeInTheDocument()
  })

  it('hides heatmap tab when behaviouralPatternHeatmap widget is toggled off', () => {
    useSettingsStore.getState().toggleWidget('behaviouralPatternHeatmap')
    render(<AdvancedAIPanel />)
    expect(screen.queryByRole('button', { name: /Heatmap/i })).not.toBeInTheDocument()
  })

  it('switches to False Alarm tab when clicked', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByRole('button', { name: /False Alarm/i }))
    expect(screen.getByText(/Per-sensor false alarm rate/i)).toBeInTheDocument()
  })
})
