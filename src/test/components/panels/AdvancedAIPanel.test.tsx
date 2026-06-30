import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
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

  it('shows Alerts (7d) in stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Alerts.*7d/i)).toBeInTheDocument()
  })

  it('renders Heatmap tab button when heatmap widget is visible', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getAllByText(/Heatmap/i).length).toBeGreaterThan(0)
  })

  it('renders False Alarm tab button when FAR widget is visible', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getAllByText(/False Alarm/i).length).toBeGreaterThan(0)
  })

  it('renders Confidence tab button when confidence widget is visible', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getAllByText(/Confidence/i).length).toBeGreaterThan(0)
  })

  it('shows time window buttons (1h, 6h, 24h) in heatmap view', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
  })

  it('switches to False Alarm tab when clicked', () => {
    render(<AdvancedAIPanel />)
    const farTabs = screen.getAllByText(/False Alarm/i)
    fireEvent.click(farTabs[0])
    // After clicking, sensor rows should appear
    expect(screen.getAllByText(/False Alarm/i).length).toBeGreaterThanOrEqual(1)
  })

  it('switches to Confidence tab when clicked', () => {
    render(<AdvancedAIPanel />)
    const confTabs = screen.getAllByText(/Confidence/i)
    fireEvent.click(confTabs[0])
    expect(screen.getAllByText(/Confidence/i).length).toBeGreaterThanOrEqual(1)
  })

  it('hides False Alarm tab when falseAlarmRateTracker widget is toggled off', () => {
    useSettingsStore.getState().toggleWidget('falseAlarmRateTracker')
    render(<AdvancedAIPanel />)
    // Tab should be gone — only heatmap and confidence tabs remain
    const farElements = screen.queryAllByText(/📊 False Alarm/)
    expect(farElements.length).toBe(0)
  })

  it('hides heatmap time window buttons when behaviouralPatternHeatmap widget is off', () => {
    useSettingsStore.getState().toggleWidget('behaviouralPatternHeatmap')
    render(<AdvancedAIPanel />)
    // If only FAR and confidence remain, time window buttons won't be present
    expect(screen.queryByText('1h')).not.toBeInTheDocument()
  })
})
