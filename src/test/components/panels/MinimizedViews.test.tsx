import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelMiniView } from '@/components/panels/MinimizedViews'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'

vi.mock('@/store/sensorStore', () => ({
  useSensorStore: vi.fn(),
}))

vi.mock('@/store/alertStore', () => ({
  useAlertStore: vi.fn(),
}))

vi.mock('@/store/systemStore', () => ({
  useSystemStore: vi.fn(),
}))

function setupMocks() {
  ;(useSensorStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { sensors: Map<string, unknown>; tracks: unknown[] }) => unknown) =>
    selector({ sensors: new Map(), tracks: [] })
  )
  ;(useAlertStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { alerts: unknown[]; threatAssessment: null }) => unknown) =>
    selector({ alerts: [], threatAssessment: null })
  )
  ;(useSystemStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { health: null }) => unknown) =>
    selector({ health: null })
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  setupMocks()
})

describe('PanelMiniView', () => {
  it('renders for panelId="map" without crashing', () => {
    const { container } = render(<PanelMiniView panelId="map" />)
    expect(container).toBeInTheDocument()
  })

  it('renders map mini view with sensors text', () => {
    render(<PanelMiniView panelId="map" />)
    expect(screen.getByText(/sensors/i)).toBeInTheDocument()
  })

  it('renders for panelId="alerts" without crashing', () => {
    const { container } = render(<PanelMiniView panelId="alerts" />)
    expect(container).toBeInTheDocument()
  })

  it('renders for panelId="video" and shows video feeds text', () => {
    render(<PanelMiniView panelId="video" />)
    expect(screen.getByText(/Video feeds active/i)).toBeInTheDocument()
  })

  it('renders for panelId="health" and shows Waiting text when health is null', () => {
    render(<PanelMiniView panelId="health" />)
    expect(screen.getByText(/Waiting/i)).toBeInTheDocument()
  })

  it('renders null for unknown panelId without crashing', () => {
    const { container } = render(<PanelMiniView panelId="nonexistent-panel-xyz" />)
    // Should render nothing (null) — container body will be empty
    expect(container.firstChild).toBeNull()
  })

  it('renders for panelId="weather" without crashing', () => {
    const { container } = render(<PanelMiniView panelId="weather" />)
    expect(container).toBeInTheDocument()
  })
})
