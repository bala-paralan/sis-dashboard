import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn(),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera:   vi.fn(),
  startStream:  vi.fn(),
  stopStream:   vi.fn(),
}))

import * as camerasApi from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Test Camera',
    manufacturer: null,
    model:        null,
    siteId:       null,
    location:     null,
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(camerasApi.fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
  useCameraStore.setState({
    cameras: [], total: 0, page: 1, loading: false, error: null,
    selectedId: null, streamUrls: {}, testResults: {},
    filterStatus: '', filterSiteId: '',
  })
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the Cameras heading', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Cameras/i)).toBeInTheDocument()
  })

  it('shows the Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/\+ Add Camera/i)).toBeInTheDocument()
  })

  it('shows a refresh button', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Refresh/i)).toBeInTheDocument()
  })

  it('shows the empty state message when there are no cameras', async () => {
    render(<CameraGrid />)
    expect(await screen.findByText(/No cameras found/i)).toBeInTheDocument()
  })

  it('renders camera cards when cameras exist in the store', async () => {
    const cam = makeCamera({ name: 'North Gate Cam' })
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue({ cameras: [cam], total: 1, page: 1, limit: 24, count: 1 })
    render(<CameraGrid />)
    expect(await screen.findByText('North Gate Cam')).toBeInTheDocument()
  })

  it('shows a status filter select', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows an error message when error is set in the store', async () => {
    vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Backend unavailable'))
    render(<CameraGrid />)
    expect(await screen.findByText('Backend unavailable')).toBeInTheDocument()
  })

  it('shows the total camera count in the heading', () => {
    useCameraStore.setState({ cameras: [makeCamera()], total: 42 })
    render(<CameraGrid />)
    expect(screen.getByText('(42)')).toBeInTheDocument()
  })
})
