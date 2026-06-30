import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

function mockCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate',
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'site-alpha',
    location:     'North Perimeter',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const resetStore = () => {
  useCameraStore.setState({
    cameras:      [],
    total:        0,
    page:         1,
    loading:      false,
    error:        null,
    selectedId:   null,
    streamUrls:   {},
    testResults:  {},
    filterStatus: '',
    filterSiteId: '',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  resetStore()
})

describe('CameraGrid', () => {
  it('calls loadCameras on mount', async () => {
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ loadCameras } as any)

    render(<CameraGrid />)

    await waitFor(() => {
      expect(loadCameras).toHaveBeenCalled()
    })
  })

  it('shows "No cameras found" when cameras list is empty', () => {
    useCameraStore.setState({ loadCameras: vi.fn().mockResolvedValue(undefined) } as any)
    render(<CameraGrid />)
    expect(screen.getByText('No cameras found')).toBeInTheDocument()
  })

  it('renders camera cards from store', () => {
    useCameraStore.setState({
      cameras: [
        mockCamera({ id: 'cam-001', name: 'Front Gate' }),
        mockCamera({ id: 'cam-002', name: 'Rear Gate' }),
      ],
      loadCameras: vi.fn().mockResolvedValue(undefined),
    } as any)

    render(<CameraGrid />)
    expect(screen.getByText('Front Gate')).toBeInTheDocument()
    expect(screen.getByText('Rear Gate')).toBeInTheDocument()
  })

  it('shows total count in heading', () => {
    useCameraStore.setState({
      cameras: [mockCamera()],
      total: 42,
      loadCameras: vi.fn().mockResolvedValue(undefined),
    } as any)

    render(<CameraGrid />)
    expect(screen.getByText('(42)')).toBeInTheDocument()
  })

  it('shows error banner when store has an error', () => {
    useCameraStore.setState({
      error: 'Failed to load cameras',
      loadCameras: vi.fn().mockResolvedValue(undefined),
    } as any)

    render(<CameraGrid />)
    expect(screen.getByText('Failed to load cameras')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading with empty cameras', () => {
    useCameraStore.setState({
      loading: true,
      cameras: [],
      loadCameras: vi.fn().mockResolvedValue(undefined),
    } as any)

    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('opens Add Camera modal when + Add Camera button is clicked', () => {
    useCameraStore.setState({ loadCameras: vi.fn().mockResolvedValue(undefined) } as any)

    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('shows pagination when total > 24', () => {
    useCameraStore.setState({
      cameras: [mockCamera()],
      total: 50,
      page: 1,
      loadCameras: vi.fn().mockResolvedValue(undefined),
    } as any)

    render(<CameraGrid />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('does not show pagination when total <= 24', () => {
    useCameraStore.setState({
      cameras: [mockCamera()],
      total: 10,
      page: 1,
      loadCameras: vi.fn().mockResolvedValue(undefined),
    } as any)

    render(<CameraGrid />)
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
  })

  it('calls setFilterStatus when status filter changes', () => {
    const setFilterStatus = vi.fn()
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ setFilterStatus, loadCameras } as any)

    render(<CameraGrid />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ONLINE' } })
    expect(setFilterStatus).toHaveBeenCalledWith('ONLINE')
  })

  it('shows camera player when a camera is selected', () => {
    useCameraStore.setState({
      cameras: [mockCamera({ id: 'cam-001' })],
      selectedId: 'cam-001',
      streamUrls: {},
      startStream: vi.fn().mockReturnValue(new Promise(() => {})),
      stopStream: vi.fn().mockResolvedValue(undefined),
      loadCameras: vi.fn().mockResolvedValue(undefined),
    } as any)

    render(<CameraGrid />)
    expect(screen.getByText(/Connecting to stream/i)).toBeInTheDocument()
  })
})
