import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [] })
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows FAR avg stat in the header bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/FAR avg/i)).toBeInTheDocument()
  })

  it('shows Rejected count in the header bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Rejected/i)).toBeInTheDocument()
  })

  it('shows Alerts (7d) stat in the header bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Alerts \(7d\)/i)).toBeInTheDocument()
  })

  it('renders the Heatmap tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/🔥 Heatmap/)).toBeInTheDocument()
  })

  it('renders the False Alarm tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/📊 False Alarm/)).toBeInTheDocument()
  })

  it('renders the Confidence tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/🧠 Confidence/)).toBeInTheDocument()
  })

  it('shows heatmap SVG in the Heatmap tab', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows High-activity zones heading in Heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/High-activity zones/i)).toBeInTheDocument()
  })

  it('switches to False Alarm tab when clicked', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/📊 False Alarm/))
    expect(screen.getByText(/Per-sensor false alarm rate/i)).toBeInTheDocument()
  })

  it('switches to Confidence tab when clicked', () => {
    render(<AdvancedAIPanel />)
    fireEvent.click(screen.getByText(/🧠 Confidence/))
    expect(screen.getByText(/confidence distribution/i)).toBeInTheDocument()
  })

  it('shows time window buttons (1h, 6h, 24h) in Heatmap tab', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: '1h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6h' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '24h' })).toBeInTheDocument()
  })
})
