import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera:   vi.fn(),
  startStream:  vi.fn(),
  stopStream:   vi.fn(),
}))

vi.mock('hls.js', () => ({
  default: { isSupported: vi.fn(() => false) },
}))

function makeCamera(id: string, name: string, status: Camera['status'] = 'ONLINE'): Camera {
  return {
    id, name, manufacturer: 'Axis', model: 'P1', siteId: 'site-a',
    location: 'Gate', status, lastSeenAt: null,
    createdBy: 'admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [], total: 0, page: 1, loading: false, error: null,
    selectedId: null, streamUrls: {}, testResults: {},
    filterStatus: '', filterSiteId: '',
  })
  vi.clearAllMocks()
})

describe('CameraGrid', () => {
  it('shows loading skeleton when loading with no cameras', () => {
    useCameraStore.setState({ loading: true, cameras: [] })
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when not loading and cameras are empty', async () => {
    useCameraStore.setState({ loading: false, cameras: [] })
    render(<CameraGrid />)
    await waitFor(() => {
      expect(screen.getByText('No cameras found')).toBeInTheDocument()
    })
  })

  it('renders camera cards when cameras are loaded', async () => {
    useCameraStore.setState({
      loading: false,
      cameras: [makeCamera('cam-1', 'North Gate'), makeCamera('cam-2', 'South Gate')],
      total: 2,
    })
    render(<CameraGrid />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
    expect(screen.getByText('South Gate')).toBeInTheDocument()
  })

  it('shows total camera count in heading', () => {
    useCameraStore.setState({ loading: false, cameras: [], total: 5 })
    render(<CameraGrid />)
    expect(screen.getByText(/\(5\)/)).toBeInTheDocument()
  })

  it('shows error message when there is an error', async () => {
    const camerasApi = await import('@/api/cameras')
    vi.mocked(camerasApi.fetchCameras).mockRejectedValueOnce(new Error('Failed to load'))
    render(<CameraGrid />)
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('renders Add Camera button', async () => {
    useCameraStore.setState({ loading: false, cameras: [] })
    render(<CameraGrid />)
    await waitFor(() => {
      expect(screen.getByText('+ Add Camera')).toBeInTheDocument()
    })
  })

  it('opens add modal when + Add Camera is clicked', async () => {
    useCameraStore.setState({ loading: false, cameras: [] })
    render(<CameraGrid />)
    await waitFor(() => {
      fireEvent.click(screen.getByText('+ Add Camera'))
    })
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('renders status filter select with All statuses option', async () => {
    useCameraStore.setState({ loading: false, cameras: [] })
    render(<CameraGrid />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('All statuses')).toBeInTheDocument()
    })
  })

  it('shows pagination controls when total exceeds 24', () => {
    useCameraStore.setState({ loading: false, cameras: [], total: 50, page: 2 })
    render(<CameraGrid />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })
})
