import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchModal } from '@/components/widgets/SearchModal'
import { useAlertStore } from '@/store/alertStore'
import { useCameraStore } from '@/store/cameraStore'
import { useSystemStore } from '@/store/systemStore'

vi.mock('@/store/alertStore')
vi.mock('@/store/cameraStore')
vi.mock('@/store/systemStore')

const mockSetActivePanel = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  // jsdom doesn't implement scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  vi.mocked(useAlertStore).mockImplementation((sel: (s: unknown) => unknown) =>
    sel({ alerts: [] })
  )
  vi.mocked(useCameraStore).mockImplementation((sel: (s: unknown) => unknown) =>
    sel({ cameras: [] })
  )
  vi.mocked(useSystemStore).mockImplementation((sel: (s: unknown) => unknown) =>
    sel({ setActivePanel: mockSetActivePanel })
  )
})

describe('SearchModal', () => {
  it('renders search input and quick navigation by default', () => {
    render(<SearchModal onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText(/search panels/i)).toBeInTheDocument()
    expect(screen.getByText('Quick Navigation')).toBeInTheDocument()
  })

  it('shows first 6 panels in quick navigation when query is empty', () => {
    render(<SearchModal onClose={vi.fn()} />)
    expect(screen.getByTestId('search-result-map')).toBeInTheDocument()
    expect(screen.getByTestId('search-result-alerts')).toBeInTheDocument()
    expect(screen.getByTestId('search-result-health')).toBeInTheDocument()
  })

  it('filters panels by query text', () => {
    render(<SearchModal onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/search panels/i), {
      target: { value: 'weather' },
    })
    expect(screen.getByTestId('search-result-weather')).toBeInTheDocument()
    expect(screen.queryByTestId('search-result-map')).not.toBeInTheDocument()
  })

  it('shows "no results" when query matches nothing', () => {
    render(<SearchModal onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/search panels/i), {
      target: { value: 'xyzzy-does-not-match' },
    })
    expect(screen.getByText(/no results/i)).toBeInTheDocument()
  })

  it('calls setActivePanel and onClose when a panel result is clicked', () => {
    const onClose = vi.fn()
    render(<SearchModal onClose={onClose} />)
    fireEvent.click(screen.getByTestId('search-result-map'))
    expect(mockSetActivePanel).toHaveBeenCalledWith('map')
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on Escape key', () => {
    const onClose = vi.fn()
    render(<SearchModal onClose={onClose} />)
    fireEvent.keyDown(screen.getByPlaceholderText(/search panels/i), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('searches alert title/description when there are alerts', () => {
    vi.mocked(useAlertStore).mockImplementation((sel: (s: unknown) => unknown) =>
      sel({
        alerts: [
          {
            id: 'a1',
            threat_level: 'CRITICAL',
            description: 'perimeter breach detected',
            sensor_family: 'Seismic',
            acknowledged: false,
            timestamp: '2024-01-01T00:00:00Z',
          },
        ],
      })
    )
    render(<SearchModal onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/search panels/i), {
      target: { value: 'breach' },
    })
    expect(screen.getByText(/perimeter breach/i)).toBeInTheDocument()
    expect(screen.getByText('Alerts')).toBeInTheDocument()
  })

  it('navigates to Alerts panel when an alert result is clicked', () => {
    vi.mocked(useAlertStore).mockImplementation((sel: (s: unknown) => unknown) =>
      sel({
        alerts: [
          {
            id: 'a2',
            threat_level: 'HIGH',
            description: 'tunnel vibration',
            sensor_family: 'Seismic',
            acknowledged: false,
            timestamp: '2024-01-01T00:00:00Z',
          },
        ],
      })
    )
    const onClose = vi.fn()
    render(<SearchModal onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/search panels/i), {
      target: { value: 'tunnel' },
    })
    fireEvent.click(screen.getByText(/tunnel vibration/i))
    expect(mockSetActivePanel).toHaveBeenCalledWith('alerts')
    expect(onClose).toHaveBeenCalled()
  })

  it('searches cameras by name', () => {
    vi.mocked(useCameraStore).mockImplementation((sel: (s: unknown) => unknown) =>
      sel({
        cameras: [{ id: 'cam1', name: 'Gate Camera Alpha', siteId: 'SITE-01', location: null, status: 'ONLINE' }],
      })
    )
    render(<SearchModal onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/search panels/i), {
      target: { value: 'gate' },
    })
    expect(screen.getByText('Gate Camera Alpha')).toBeInTheDocument()
    expect(screen.getByText('Cameras')).toBeInTheDocument()
  })

  it('navigates to Cameras panel when a camera result is clicked', () => {
    vi.mocked(useCameraStore).mockImplementation((sel: (s: unknown) => unknown) =>
      sel({
        cameras: [{ id: 'cam2', name: 'Roof Cam B', siteId: null, location: 'Roof', status: 'ONLINE' }],
      })
    )
    const onClose = vi.fn()
    render(<SearchModal onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText(/search panels/i), {
      target: { value: 'roof' },
    })
    fireEvent.click(screen.getByText('Roof Cam B'))
    expect(mockSetActivePanel).toHaveBeenCalledWith('cameras')
    expect(onClose).toHaveBeenCalled()
  })
})
