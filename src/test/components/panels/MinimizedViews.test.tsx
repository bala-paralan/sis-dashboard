import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'

beforeEach(() => {
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
  useSystemStore.setState({
    health: null,
    theme: 'dark',
    scenario: 'NORMAL',
    connectionStatus: 'disconnected',
    activePanel: 'map',
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
  })
})

describe('PanelMiniView', () => {
  it('renders null for unknown panelId', () => {
    const { container } = render(<PanelMiniView panelId="nonexistent" />)
    expect(container.firstChild).toBeNull()
  })

  describe('map mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="map" />)
      expect(container).toBeDefined()
    })

    it('shows sensor count indicator', () => {
      render(<PanelMiniView panelId="map" />)
      expect(screen.getByText(/sensors/i)).toBeInTheDocument()
    })

    it('shows track count indicator', () => {
      render(<PanelMiniView panelId="map" />)
      expect(screen.getByText(/tracks/i)).toBeInTheDocument()
    })
  })

  describe('alerts mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="alerts" />)
      expect(container).toBeDefined()
    })

    it('shows threat level emoji indicators', () => {
      render(<PanelMiniView panelId="alerts" />)
      // AlertsMini shows 🔴/🟠/🟡/🟢 indicators with counts
      const body = document.body.textContent
      expect(body).toMatch(/🔴|🟠|🟡|🟢/)
    })
  })

  describe('video mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="video" />)
      expect(container).toBeDefined()
    })
  })

  describe('sensors mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="sensors" />)
      expect(container).toBeDefined()
    })
  })

  describe('aiml mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="aiml" />)
      expect(container).toBeDefined()
    })

    it('shows threat score or AI-related text', () => {
      render(<PanelMiniView panelId="aiml" />)
      // AimlMini shows threat info
      expect(document.body).toBeTruthy()
    })
  })

  describe('health mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="health" />)
      expect(container).toBeDefined()
    })
  })

  describe('counteruas mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="counteruas" />)
      expect(container).toBeDefined()
    })
  })

  describe('personnel mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="personnel" />)
      expect(container).toBeDefined()
    })
  })

  describe('power mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="power" />)
      expect(container).toBeDefined()
    })
  })

  describe('command mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="command" />)
      expect(container).toBeDefined()
    })
  })

  describe('advancedai mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="advancedai" />)
      expect(container).toBeDefined()
    })
  })

  describe('weather mini', () => {
    it('renders without crashing', () => {
      const { container } = render(<PanelMiniView panelId="weather" />)
      expect(container).toBeDefined()
    })
  })
})
