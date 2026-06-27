import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'
import type { Alert } from '@/types/sensors'

function makeAlert(id: string, level: Alert['threat_level']): Alert {
  return {
    alert_id: id,
    timestamp: new Date().toISOString(),
    sensor_id: 'S01',
    threat_level: level,
    sensor_family: 'SEISMIC',
    location: { lat: 21.94, lon: 88.12, accuracy_m: 10 },
    description: `Test alert ${id}`,
    acknowledged: false,
    ai_confidence: 0.9,
    track_id: null,
  }
}

beforeEach(() => {
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
  useSystemStore.setState({ theme: 'dark', scenario: 'NORMAL', connectionStatus: 'connected', health: null, sidebarCollapsed: false, activePanel: 'map' })
})

describe('PanelMiniView', () => {
  it('renders null for unknown panelId', () => {
    const { container } = render(<PanelMiniView panelId="nonexistent" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders map mini with sensor/track counts', () => {
    useSensorStore.setState({ sensors: new Map([['S01', { sensor_id: 'S01' } as never]]), tracks: [] })
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/1 sensors/i)).toBeInTheDocument()
    expect(screen.getByText(/0 tracks/i)).toBeInTheDocument()
  })

  it('renders alerts mini showing CRITICAL count', () => {
    useAlertStore.setState({ alerts: [makeAlert('a1', 'CRITICAL'), makeAlert('a2', 'HIGH')] })
    render(<PanelMiniView panelId="alerts" />)
    // Shows "1" CRITICAL (red), "1" HIGH, "0" MEDIUM, "0" LOW — use getAllByText
    const ones = screen.getAllByText('1')
    expect(ones.length).toBeGreaterThan(0)
  })

  it('renders video mini', () => {
    render(<PanelMiniView panelId="video" />)
    expect(screen.getByText(/Video feeds active/i)).toBeInTheDocument()
  })

  it('renders sensors mini with 0/0 when no sensors', () => {
    render(<PanelMiniView panelId="sensors" />)
    expect(screen.getByText(/0\/0/)).toBeInTheDocument()
  })

  it('renders aiml mini with 0 tracks', () => {
    render(<PanelMiniView panelId="aiml" />)
    expect(screen.getByText(/0 tracks/i)).toBeInTheDocument()
  })

  it('renders health mini waiting state when no health data', () => {
    render(<PanelMiniView panelId="health" />)
    expect(screen.getByText(/Waiting/i)).toBeInTheDocument()
  })

  it('renders health mini with node id when health is set', () => {
    useSystemStore.setState({
      health: {
        timestamp: new Date().toISOString(),
        node_id: 'BOP-ALPHA-01',
        hardware: { cpu_percent: 45, gpu_percent: 60, ram_percent: 50, nvme_percent: 20, temperature_c: 48, uptime_hours: 10 },
        comms: {},
        aiml: { inference_fps: 24, gpu_memory_percent: 70, model_versions: { detection: 'yolov9', tracking: 'bytetrack', threat: 'bayesian' } },
      } as never,
    })
    render(<PanelMiniView panelId="health" />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
  })

  it('renders counteruas mini', () => {
    render(<PanelMiniView panelId="counteruas" />)
    expect(screen.getByText(/UAS/i)).toBeInTheDocument()
  })

  it('renders personnel mini', () => {
    render(<PanelMiniView panelId="personnel" />)
    expect(screen.getByText(/personnel/i)).toBeInTheDocument()
  })

  it('renders power mini', () => {
    render(<PanelMiniView panelId="power" />)
    expect(screen.getByText(/BOP nodes/i)).toBeInTheDocument()
  })

  it('renders command mini', () => {
    render(<PanelMiniView panelId="command" />)
    expect(screen.getByText(/online/i)).toBeInTheDocument()
  })

  it('renders advancedai mini', () => {
    render(<PanelMiniView panelId="advancedai" />)
    expect(screen.getByText(/FAR/i)).toBeInTheDocument()
  })

  it('renders weather mini', () => {
    render(<PanelMiniView panelId="weather" />)
    expect(screen.getByText(/°C/)).toBeInTheDocument()
  })
})
