import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore }  from '@/store/alertStore'
import type { SensorPayload } from '@/types/sensors'

function fakeSensor(id: string, status: SensorPayload['sensor_status'] = 'ONLINE'): SensorPayload {
  return {
    sensor_id: id,
    modality: 'SEISMIC',
    sensor_status: status,
    timestamp: '2026-01-01T00:00:00Z',
    confidence: 0.9,
    raw_value: {},
  }
}

describe('PanelMiniView — map', () => {
  it('shows sensor count', () => {
    useSensorStore.setState({
      sensors: new Map([['s1', fakeSensor('s1')], ['s2', fakeSensor('s2')]]),
    } as Parameters<typeof useSensorStore.setState>[0])
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/2 sensor/i)).toBeInTheDocument()
  })

  it('shows track count', () => {
    useSensorStore.setState({
      tracks: [{
        track_id: 't1', sensor_ids: [],
        location: { lat: 0, lon: 0, accuracy_m: 0 },
        threat_level: 'LOW', classification: 'UNK',
        velocity_ms: 0, heading_deg: 0, timestamp: '', age_s: 0,
      }],
    } as Parameters<typeof useSensorStore.setState>[0])
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/1 track/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — alerts', () => {
  it('renders alert counts without crashing', () => {
    useAlertStore.setState({ alerts: [] })
    render(<PanelMiniView panelId="alerts" />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(4)
  })
})

describe('PanelMiniView — video', () => {
  it('renders video feeds label', () => {
    render(<PanelMiniView panelId="video" />)
    expect(screen.getByText(/video feeds/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — sensors', () => {
  it('renders online/total sensor summary', () => {
    useSensorStore.setState({
      sensors: new Map([
        ['s1', fakeSensor('s1', 'ONLINE')],
        ['s2', fakeSensor('s2', 'OFFLINE')],
      ]),
    } as Parameters<typeof useSensorStore.setState>[0])
    render(<PanelMiniView panelId="sensors" />)
    expect(screen.getByText(/1\/2/)).toBeInTheDocument()
  })
})

describe('PanelMiniView — unknown panel', () => {
  it('renders nothing for an unknown panelId', () => {
    const { container } = render(<PanelMiniView panelId="__unknown__" />)
    expect(container.firstChild).toBeNull()
  })
})
