import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'
import type { Alert } from '@/types/sensors'

function makeAlert(id: string, level: Alert['threat_level'], acked = false): Alert {
  return {
    id,
    timestamp: '2026-04-11T10:00:00.000Z',
    threat_level: level,
    sensor_id: 's1',
    sensor_family: 'SEISMIC',
    location: { lat: 21.9, lon: 88.1 },
    description: `Test alert ${id}`,
    acknowledged: acked,
  }
}

beforeEach(() => {
  localStorage.clear()
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
})

describe('PanelMiniView — map', () => {
  it('renders sensor and track counts', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/sensors/i)).toBeInTheDocument()
    expect(screen.getByText(/tracks/i)).toBeInTheDocument()
  })

  it('shows 0 sensors and 0 tracks with empty store', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/0 sensors/i)).toBeInTheDocument()
    expect(screen.getByText(/0 tracks/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — alerts', () => {
  it('renders alert level counts', () => {
    render(<PanelMiniView panelId="alerts" />)
    // Should render four Kpi elements (CRITICAL, HIGH, MEDIUM, LOW)
    const allStrongs = document.querySelectorAll('strong')
    expect(allStrongs.length).toBeGreaterThan(0)
  })

  it('shows correct count for CRITICAL unacknowledged alerts', () => {
    useAlertStore.setState({
      alerts: [makeAlert('a1', 'CRITICAL'), makeAlert('a2', 'HIGH')],
    })
    render(<PanelMiniView panelId="alerts" />)
    // CRITICAL count = 1, HIGH count = 1
    const strongs = Array.from(document.querySelectorAll('strong')).map((el) => el.textContent)
    expect(strongs).toContain('1')
  })
})

describe('PanelMiniView — video', () => {
  it('renders the video feeds label', () => {
    render(<PanelMiniView panelId="video" />)
    expect(screen.getByText(/Video feeds active/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — sensors', () => {
  it('renders online sensor fraction', () => {
    render(<PanelMiniView panelId="sensors" />)
    expect(screen.getByText(/Online/i)).toBeInTheDocument()
    expect(screen.getByText(/0\/0/i)).toBeInTheDocument()
  })

  it('shows average quality score', () => {
    render(<PanelMiniView panelId="sensors" />)
    expect(screen.getByText(/Avg Q/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — aiml', () => {
  it('renders track count', () => {
    render(<PanelMiniView panelId="aiml" />)
    expect(screen.getByText(/tracks/i)).toBeInTheDocument()
  })

  it('shows threat level when threatAssessment is set', () => {
    useAlertStore.setState({
      threatAssessment: {
        assessment_id: 'ta-1',
        timestamp: '2026-04-11T10:00:00.000Z',
        threat_score: 80,
        threat_level: 'HIGH',
        contributing_sensors: [],
        dominant_modality: 'ACOUSTIC',
        location: { lat: 21.9, lon: 88.1, accuracy_m: 10 },
        recommended_action: 'Monitor',
        model_version: 'v1',
      },
    })
    render(<PanelMiniView panelId="aiml" />)
    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })
})

describe('PanelMiniView — health', () => {
  it('renders Waiting when no health data', () => {
    useSystemStore.setState({ health: null })
    render(<PanelMiniView panelId="health" />)
    expect(screen.getByText(/Waiting/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — personnel', () => {
  it('renders personnel count label', () => {
    render(<PanelMiniView panelId="personnel" />)
    expect(screen.getByText(/5 personnel/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — power', () => {
  it('renders BOP nodes label', () => {
    render(<PanelMiniView panelId="power" />)
    expect(screen.getByText(/4 BOP nodes/i)).toBeInTheDocument()
  })

  it('renders Avg bat label', () => {
    render(<PanelMiniView panelId="power" />)
    expect(screen.getByText(/Avg bat/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — weather', () => {
  it('renders temperature reading', () => {
    render(<PanelMiniView panelId="weather" />)
    expect(screen.getByText(/°C/i)).toBeInTheDocument()
  })

  it('renders visibility label', () => {
    render(<PanelMiniView panelId="weather" />)
    expect(screen.getByText(/Vis/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — unknown panelId', () => {
  it('returns null for an unknown panel id', () => {
    const { container } = render(<PanelMiniView panelId="nonexistent" />)
    expect(container.firstChild).toBeNull()
  })
})
