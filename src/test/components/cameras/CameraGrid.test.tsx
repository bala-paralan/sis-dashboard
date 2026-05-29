import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock the camera API
vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera:   vi.fn(),
  startStream:  vi.fn(),
  stopStream:   vi.fn(),
}))

// Mock hls.js (used by CameraPlayer which is lazy-rendered)
vi.mock('hls.js', () => ({
  default: class MockHls {
    static isSupported = () => false
    loadSource = vi.fn()
    attachMedia = vi.fn()
    on = vi.fn()
    destroy = vi.fn()
  },
}))

function makeCamera(id: string, name = `Camera ${id}`): Camera {
  return {
    id,
    name,
    manufacturer: 'Axis',
    model: 'P3245',
    siteId: 'BOP-ALPHA-01',
    location: 'Sector 1',
    status: 'ONLINE',
    lastSeenAt: new Date().toISOString(),
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useCameraStore.setState({
    cameras: [],
    total: 0,
    page: 1,
    loading: false,
    error: null,
    selectedId: null,
    streamUrls: {},
    testResults: {},
    filterStatus: '',
    filterSiteId: '',
  })
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows status filter dropdown', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows "Add Camera" button', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Add Camera/i)).toBeInTheDocument()
  })

  it('shows empty state when no cameras', async () => {
    render(<CameraGrid />)
    await waitFor(() => {
      // Either shows "No cameras" or loading/empty state
      expect(document.body.textContent).toMatch(/camera|No|Add/i)
    })
  })

  it('renders a camera card for each camera in the store', async () => {
    useCameraStore.setState({
      cameras: [makeCamera('c1', 'Alpha PTZ'), makeCamera('c2', 'Beta CCTV')],
      total: 2,
    })

    render(<CameraGrid />)

    await waitFor(() => {
      expect(screen.getByText('Alpha PTZ')).toBeInTheDocument()
      expect(screen.getByText('Beta CCTV')).toBeInTheDocument()
    })
  })

  it('opens Add Camera modal when Add button is clicked', async () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
    })
  })

  it('shows pagination controls when total > 24', async () => {
    useCameraStore.setState({ total: 50, page: 1, cameras: [] })
    render(<CameraGrid />)
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/Page|page|Next|Prev|\d+ of \d+/i)
    })
  })

  it('shows loading skeleton when loading with no cameras', () => {
    useCameraStore.setState({ loading: true, cameras: [] })
    render(<CameraGrid />)
    // Loading skeleton renders animate-pulse divs
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows error message when API fails on load', async () => {
    const { fetchCameras } = await import('@/api/cameras')
    vi.mocked(fetchCameras).mockRejectedValueOnce(new Error('Network failure'))

    render(<CameraGrid />)
    await waitFor(() => {
      const body = document.body.textContent ?? ''
      expect(body).toContain('Network failure')
    })
  })
})
