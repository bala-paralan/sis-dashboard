import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { useSystemStore } from '@/store/systemStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useViewStore } from '@/store/viewStore'

// Mock leaflet to avoid jsdom canvas issues
vi.mock('leaflet', () => ({ default: {} }))
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
  useMap: () => ({ setView: vi.fn() }),
}))

// Mock camera API so CameraGrid doesn't error out
vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera:   vi.fn(),
  startStream:  vi.fn(),
  stopStream:   vi.fn(),
}))

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
  useSystemStore.setState({
    theme:           'dark',
    scenario:        'NORMAL',
    connectionStatus:'connecting',
    health:          null,
    sidebarCollapsed: false,
    activePanel:     'map',
    mobileSidebarOpen: false,
  })
})

describe('PanelGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<PanelGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the Settings panel shell when activePanel is settings', () => {
    useSystemStore.setState({ activePanel: 'settings' })
    render(<PanelGrid />)
    expect(screen.getByText(/Dashboard Settings/i)).toBeInTheDocument()
  })

  it('renders the Cameras panel shell when activePanel is cameras', () => {
    useSystemStore.setState({ activePanel: 'cameras' })
    render(<PanelGrid />)
    expect(screen.getByText(/Camera Management/i)).toBeInTheDocument()
  })

  it('renders the Device Config panel shell when activePanel is device', () => {
    useSystemStore.setState({ activePanel: 'device' })
    render(<PanelGrid />)
    expect(screen.getByText(/SensiConnect/i)).toBeInTheDocument()
  })

  it('renders core panel titles in the main grid view', async () => {
    render(<PanelGrid />)
    await waitFor(() => {
      expect(screen.getAllByText(/Live Tactical Map/i).length).toBeGreaterThan(0)
    })
  })

  it('renders the Alert Management panel in the main grid', async () => {
    render(<PanelGrid />)
    await waitFor(() => {
      expect(screen.getAllByText(/Alert Management/i).length).toBeGreaterThan(0)
    })
  })

  it('shows an expanded banner when a panel is expanded', async () => {
    useViewStore.setState({ expandedPanel: 'map', panelViews: { map: 'expanded' } })
    render(<PanelGrid />)
    await waitFor(() => {
      expect(screen.getAllByText(/Expanded/i).length).toBeGreaterThan(0)
    })
  })

  it('shows the Collapse button when a panel is expanded', async () => {
    useViewStore.setState({ expandedPanel: 'alerts', panelViews: { alerts: 'expanded' } })
    render(<PanelGrid />)
    await waitFor(() => {
      expect(screen.getByText(/✕ Collapse/i)).toBeInTheDocument()
    })
  })
})
