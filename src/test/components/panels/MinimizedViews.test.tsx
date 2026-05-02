import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'

beforeEach(() => {
  useSensorStore.setState({ sensors: new Map(), tracks: [], sensorHistory: new Map(), selectedSensorId: null })
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
})

describe('PanelMiniView', () => {
  it('renders null for unknown panelId', () => {
    const { container } = render(<PanelMiniView panelId="unknown-panel" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders map mini view showing sensors count', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/sensors/i)).toBeInTheDocument()
    expect(screen.getByText(/tracks/i)).toBeInTheDocument()
  })

  it('renders alerts mini view showing CRITICAL count', () => {
    render(<PanelMiniView panelId="alerts" />)
    // Should show numeric counts for each level
    const criticalLabel = screen.getByText('🔴')
    expect(criticalLabel).toBeInTheDocument()
  })

  it('renders video mini view', () => {
    render(<PanelMiniView panelId="video" />)
    expect(screen.getByText(/Video feeds active/i)).toBeInTheDocument()
  })

  it('renders sensors mini view with Online label', () => {
    render(<PanelMiniView panelId="sensors" />)
    expect(screen.getByText(/Online/i)).toBeInTheDocument()
  })

  it('renders aiml mini view with tracks count', () => {
    render(<PanelMiniView panelId="aiml" />)
    expect(screen.getByText(/tracks/i)).toBeInTheDocument()
  })

  it('renders health mini view', () => {
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

  it('renders power mini view with BOP nodes label', () => {
    render(<PanelMiniView panelId="power" />)
    expect(screen.getByText(/BOP nodes/i)).toBeInTheDocument()
  })

  it('renders command mini view', () => {
    render(<PanelMiniView panelId="command" />)
    expect(screen.getByText(/online/i)).toBeInTheDocument()
  })

  it('renders advancedai mini view with FAR label', () => {
    render(<PanelMiniView panelId="advancedai" />)
    expect(screen.getByText(/FAR/i)).toBeInTheDocument()
  })

  it('renders weather mini view with temperature', () => {
    render(<PanelMiniView panelId="weather" />)
    expect(screen.getByText(/°C/i)).toBeInTheDocument()
  })
})
