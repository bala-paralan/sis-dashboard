import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import type { Alert } from '@/types/sensors'

function makeAlert(id: string, threat_level: Alert['threat_level'], acknowledged = false): Alert {
  return {
    id, acknowledged, threat_level,
    timestamp: new Date().toISOString(),
    source_sensors: ['S01'],
    location: '21.94, 88.12',
    classification: 'INTRUSION',
    description: 'Test alert',
  }
}

beforeEach(() => {
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
})

describe('PanelMiniView', () => {
  it('renders without crashing for the "map" panel', () => {
    expect(() => render(<PanelMiniView panelId="map" />)).not.toThrow()
  })

  it('renders without crashing for the "alerts" panel', () => {
    expect(() => render(<PanelMiniView panelId="alerts" />)).not.toThrow()
  })

  it('renders without crashing for the "video" panel', () => {
    expect(() => render(<PanelMiniView panelId="video" />)).not.toThrow()
  })

  it('renders without crashing for the "sensors" panel', () => {
    expect(() => render(<PanelMiniView panelId="sensors" />)).not.toThrow()
  })

  it('returns null for an unknown panel id', () => {
    const { container } = render(<PanelMiniView panelId="unknown" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders without crashing for "health" panel', () => {
    expect(() => render(<PanelMiniView panelId="health" />)).not.toThrow()
  })

  it('renders without crashing for "power" panel', () => {
    expect(() => render(<PanelMiniView panelId="power" />)).not.toThrow()
  })

  it('renders without crashing for "command" panel', () => {
    expect(() => render(<PanelMiniView panelId="command" />)).not.toThrow()
  })

  it('shows sensor count for the map panel', () => {
    const sensors = new Map()
    sensors.set('S01', { sensor_id: 'S01', modality: 'RADAR', timestamp: '', site_id: 'S', bop_id: 'B', quality_score: 1, raw_value: {}, sensor_status: 'ONLINE', lat: 0, lon: 0 })
    useSensorStore.setState({ sensors })
    render(<PanelMiniView panelId="map" />)
    expect(document.body.textContent).toMatch(/1 sensor/)
  })

  it('shows unacknowledged alert counts for the alerts panel', () => {
    useAlertStore.setState({
      alerts: [
        makeAlert('a1', 'CRITICAL', false),
        makeAlert('a2', 'HIGH', false),
        makeAlert('a3', 'MEDIUM', true),
      ],
      threatAssessment: null,
      filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
    })
    render(<PanelMiniView panelId="alerts" />)
    // Should show count for critical (1)
    expect(document.body.textContent).toMatch(/1/)
  })
})
