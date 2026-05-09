import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'
import type { SensorPayload } from '@/types/sensors'

function makeSensor(id: string, status: 'ONLINE' | 'OFFLINE' = 'ONLINE'): SensorPayload {
  return {
    sensor_id: id,
    modality: 'SEISMIC',
    timestamp: new Date().toISOString(),
    site_id: 'SITE-A',
    bop_id: 'BOP-01',
    quality_score: 0.85,
    raw_value: {},
    sensor_status: status,
  }
}

beforeEach(() => {
  useSensorStore.setState({
    sensors: new Map(),
    sensorHistory: new Map(),
    tracks: [],
    selectedSensorId: null,
  })
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
  useSystemStore.setState({
    ...useSystemStore.getState(),
    health: null,
    connectionStatus: 'connected',
  })
})

describe('PanelMiniView — map', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="map" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows sensor count (0 when store is empty)', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/0 sensors/i)).toBeInTheDocument()
  })

  it('shows track count (0 when no tracks)', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/0 tracks/i)).toBeInTheDocument()
  })

  it('updates sensor count when sensors are added', () => {
    useSensorStore.setState({
      sensors: new Map([['s1', makeSensor('s1')], ['s2', makeSensor('s2')]]),
    })
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/2 sensors/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — alerts', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="alerts" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows alert count badges', () => {
    render(<PanelMiniView panelId="alerts" />)
    const zeros = screen.queryAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(4)
  })
})

describe('PanelMiniView — video', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="video" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows "Video feeds active" text', () => {
    render(<PanelMiniView panelId="video" />)
    expect(screen.getByText(/Video feeds active/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — sensors', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="sensors" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows online count when sensors exist', () => {
    useSensorStore.setState({
      sensors: new Map([
        ['s1', makeSensor('s1', 'ONLINE')],
        ['s2', makeSensor('s2', 'OFFLINE')],
      ]),
    })
    render(<PanelMiniView panelId="sensors" />)
    expect(screen.getByText(/1\/2/)).toBeInTheDocument()
  })
})

describe('PanelMiniView — aiml', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="aiml" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders track count', () => {
    render(<PanelMiniView panelId="aiml" />)
    expect(screen.getByText(/0 tracks/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — health', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="health" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows "Waiting…" when health data is null', () => {
    render(<PanelMiniView panelId="health" />)
    expect(screen.getByText(/Waiting/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — unknown panelId', () => {
  it('returns null for unknown panel ids', () => {
    const { container } = render(<PanelMiniView panelId="nonexistent_panel" />)
    expect(container.firstChild).toBeNull()
  })
})
