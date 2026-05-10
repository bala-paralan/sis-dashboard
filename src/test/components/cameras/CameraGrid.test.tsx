import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock the cameras API so loadCameras doesn't make network calls
vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera:  vi.fn(),
  updateCamera:  vi.fn(),
  deleteCamera:  vi.fn(),
  testCamera:    vi.fn(),
  startStream:   vi.fn(),
  stopStream:    vi.fn(),
}))

function makeCamera(id: string, name: string, overrides?: Partial<Camera>): Camera {
  return {
    id,
    name,
    manufacturer: 'Hikvision',
    model:        'DS-2CD',
    siteId:       'BOP-ALPHA-01',
    location:     'Gate 1',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-10T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-05-10T10:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
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
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the Cameras heading', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('heading', { name: /Cameras/i })).toBeInTheDocument()
  })

  it('shows "+ Add Camera" button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /\+ Add Camera/i })).toBeInTheDocument()
  })

  it('shows Refresh button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /↺ Refresh/i })).toBeInTheDocument()
  })

  it('shows status filter select', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows site ID filter input', () => {
    render(<CameraGrid />)
    expect(screen.getByPlaceholderText(/Site ID/i)).toBeInTheDocument()
  })

  it('shows empty state when no cameras are loaded', async () => {
    useCameraStore.setState({ cameras: [], loading: false })
    render(<CameraGrid />)
    // loadCameras is called on mount; wait for the async result to settle
    expect(await screen.findByText(/No cameras found/i)).toBeInTheDocument()
  })

  it('renders camera cards when cameras are in the store', () => {
    useCameraStore.setState({
      cameras: [
        makeCamera('cam-001', 'North Gate'),
        makeCamera('cam-002', 'South Gate'),
      ],
      total: 2,
    })
    render(<CameraGrid />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
    expect(screen.getByText('South Gate')).toBeInTheDocument()
  })

  it('shows total count in the heading', () => {
    useCameraStore.setState({ cameras: [makeCamera('cam-001', 'Gate')], total: 1 })
    render(<CameraGrid />)
    expect(screen.getByText('(1)')).toBeInTheDocument()
  })

  it('shows error message when store has an error', async () => {
    // Make the API reject so the store sets error state
    const { fetchCameras } = await import('@/api/cameras')
    ;(fetchCameras as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed to load cameras'))
    render(<CameraGrid />)
    expect(await screen.findByText(/Failed to load cameras/)).toBeInTheDocument()
  })

  it('opens Add Camera modal when "+ Add Camera" is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Camera/i }))
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('shows loading skeleton when loading is true and cameras is empty', () => {
    useCameraStore.setState({ loading: true, cameras: [] })
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
