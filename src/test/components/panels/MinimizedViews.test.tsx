import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'
import { useSystemStore } from '@/store/systemStore'

beforeEach(() => {
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
  useSystemStore.setState({
    theme: 'dark',
    scenario: 'DEFAULT',
    connectionStatus: 'CONNECTED',
    systemHealth: null,
  })
})

describe('PanelMiniView — map', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="map" />)
    expect(container).toBeInTheDocument()
  })

  it('shows sensor count', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/sensors/i)).toBeInTheDocument()
  })

  it('shows tracks count', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/tracks/i)).toBeInTheDocument()
  })

  it('shows correct sensor count when sensors exist', () => {
    useSensorStore.setState({
      sensors: new Map([
        ['S01', { id: 'S01', type: 'SEISMIC', lat: 21.9, lon: 88.1, status: 'ACTIVE', lastUpdate: '' }],
      ]),
    })
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/1 sensors/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — alerts', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="alerts" />)
    expect(container).toBeInTheDocument()
  })

  it('shows zero counts when no alerts', () => {
    render(<PanelMiniView panelId="alerts" />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
  })
})

describe('PanelMiniView — video', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="video" />)
    expect(container).toBeInTheDocument()
  })

  it('shows video feeds active text', () => {
    render(<PanelMiniView panelId="video" />)
    expect(screen.getByText(/Video feeds active/i)).toBeInTheDocument()
  })
})

describe('PanelMiniView — sensors', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="sensors" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — aiml', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="aiml" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — health', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="health" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — counteruas', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="counteruas" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — personnel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="personnel" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — power', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="power" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — command', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="command" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — advancedai', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="advancedai" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — weather', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelMiniView panelId="weather" />)
    expect(container).toBeInTheDocument()
  })
})

describe('PanelMiniView — unknown panelId', () => {
  it('renders null for unknown panel IDs', () => {
    const { container } = render(<PanelMiniView panelId="nonexistent" />)
    expect(container.firstChild).toBeNull()
  })
})
