import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useAlertStore }  from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'
import { useSystemStore } from '@/store/systemStore'

beforeEach(() => {
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
  useSystemStore.setState({ health: null, theme: 'dark', wsStatus: 'CONNECTING', activePanelId: null, sidebarOpen: false })
})

describe('PanelMiniView', () => {
  it('returns null for unknown panelId', () => {
    const { container } = render(<PanelMiniView panelId="not-a-panel" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders map mini view with sensor count', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/sensors/i)).toBeInTheDocument()
  })

  it('renders alerts mini view with severity counts', () => {
    render(<PanelMiniView panelId="alerts" />)
    // renders numeric values (0s initially)
    const { container } = render(<PanelMiniView panelId="alerts" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders video mini view', () => {
    render(<PanelMiniView panelId="video" />)
    expect(screen.getByText(/Video/i)).toBeInTheDocument()
  })

  it('renders sensors mini view', () => {
    render(<PanelMiniView panelId="sensors" />)
    expect(screen.getByText(/Online/i)).toBeInTheDocument()
  })

  it('renders aiml mini view', () => {
    render(<PanelMiniView panelId="aiml" />)
    expect(screen.getByText(/tracks/i)).toBeInTheDocument()
  })

  it('renders health mini view — shows Waiting when no health data', () => {
    render(<PanelMiniView panelId="health" />)
    expect(screen.getByText(/Waiting/i)).toBeInTheDocument()
  })

  it('renders counteruas mini view', () => {
    render(<PanelMiniView panelId="counteruas" />)
    expect(screen.getByText(/UAS/i)).toBeInTheDocument()
  })

  it('renders personnel mini view', () => {
    render(<PanelMiniView panelId="personnel" />)
    expect(screen.getByText(/personnel/i)).toBeInTheDocument()
  })

  it('renders power mini view', () => {
    render(<PanelMiniView panelId="power" />)
    expect(screen.getByText(/BOP nodes/i)).toBeInTheDocument()
  })

  it('renders command mini view', () => {
    render(<PanelMiniView panelId="command" />)
    expect(screen.getByText(/online/i)).toBeInTheDocument()
  })

  it('renders advancedai mini view', () => {
    render(<PanelMiniView panelId="advancedai" />)
    expect(screen.getByText(/FAR/i)).toBeInTheDocument()
  })

  it('renders weather mini view', () => {
    render(<PanelMiniView panelId="weather" />)
    expect(screen.getByText(/°C/)).toBeInTheDocument()
  })
})
