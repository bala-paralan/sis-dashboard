import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore }  from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'
import type { SystemHealth } from '@/types/sensors'

const PANEL_IDS = [
  'map', 'alerts', 'video', 'sensors', 'aiml', 'health',
  'counteruas', 'personnel', 'power', 'command', 'advancedai', 'weather',
]

beforeEach(() => {
  vi.useFakeTimers()

  useSensorStore.setState({ sensors: new Map(), tracks: [] })
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
  useSystemStore.setState({ health: null })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PanelMiniView', () => {
  it('returns null for an unknown panel id', () => {
    const { container } = render(<PanelMiniView panelId="nonexistent" />)
    expect(container.firstChild).toBeNull()
  })

  it.each(PANEL_IDS)('renders without crashing for panelId="%s"', (panelId) => {
    const { container } = render(<PanelMiniView panelId={panelId} />)
    expect(container).toBeInTheDocument()
  })

  describe('map mini view', () => {
    it('shows sensor count and track count', () => {
      render(<PanelMiniView panelId="map" />)
      expect(screen.getByText(/sensors/i)).toBeInTheDocument()
      expect(screen.getByText(/tracks/i)).toBeInTheDocument()
    })
  })

  describe('alerts mini view', () => {
    it('shows critical/high/medium/low count labels', () => {
      render(<PanelMiniView panelId="alerts" />)
      expect(screen.getByText('🔴')).toBeInTheDocument()
      expect(screen.getByText('🟠')).toBeInTheDocument()
      expect(screen.getByText('🟡')).toBeInTheDocument()
      expect(screen.getByText('🟢')).toBeInTheDocument()
    })
  })

  describe('video mini view', () => {
    it('shows "Video feeds active"', () => {
      render(<PanelMiniView panelId="video" />)
      expect(screen.getByText(/Video feeds active/i)).toBeInTheDocument()
    })
  })

  describe('health mini view', () => {
    it('shows "Waiting…" when health is null', () => {
      render(<PanelMiniView panelId="health" />)
      expect(screen.getByText('Waiting…')).toBeInTheDocument()
    })

    it('shows node_id and temperature when health data present', () => {
      useSystemStore.setState({
        health: {
          node_id: 'NODE-01',
          timestamp: '2026-06-05T00:00:00Z',
          hardware: {
            temperature_c: 45.0,
            cpu_percent: 30,
            gpu_percent: 20,
            ram_percent: 60,
            nvme_percent: 40,
            uptime_hours: 12,
          },
          comms: {},
          aiml: { inference_fps: 10, gpu_memory_percent: 50, model_versions: {} },
        } as SystemHealth,
      })
      render(<PanelMiniView panelId="health" />)
      expect(screen.getByText('NODE-01')).toBeInTheDocument()
      expect(screen.getByText(/45\.0°C/)).toBeInTheDocument()
    })
  })

  describe('power mini view', () => {
    it('shows "4 BOP nodes"', () => {
      render(<PanelMiniView panelId="power" />)
      expect(screen.getByText(/4 BOP nodes/i)).toBeInTheDocument()
    })

    it('shows average battery percentage', () => {
      render(<PanelMiniView panelId="power" />)
      expect(screen.getByText(/Avg bat/)).toBeInTheDocument()
    })
  })

  describe('weather mini view', () => {
    it('shows temperature and visibility labels', () => {
      render(<PanelMiniView panelId="weather" />)
      expect(screen.getByText('Vis')).toBeInTheDocument()
      expect(screen.getByText('Wind')).toBeInTheDocument()
    })
  })

  describe('advancedai mini view', () => {
    it('shows FAR label', () => {
      render(<PanelMiniView panelId="advancedai" />)
      expect(screen.getByText(/🧠 FAR/)).toBeInTheDocument()
    })

    it('shows Alerts 7d label', () => {
      render(<PanelMiniView panelId="advancedai" />)
      expect(screen.getByText('Alerts 7d')).toBeInTheDocument()
    })
  })

  describe('personnel mini view', () => {
    it('shows personnel count', () => {
      render(<PanelMiniView panelId="personnel" />)
      expect(screen.getByText(/personnel/i)).toBeInTheDocument()
    })
  })

  describe('counteruas mini view', () => {
    it('shows UAS count', () => {
      render(<PanelMiniView panelId="counteruas" />)
      expect(screen.getByText(/UAS/i)).toBeInTheDocument()
    })
  })
})
