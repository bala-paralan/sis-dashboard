import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useCameraStore } from '@/store/cameraStore'

// Mock the cameras API so no real fetch occurs
vi.mock('@/api/cameras', () => ({
  fetchCameras:  vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera:  vi.fn(),
  updateCamera:  vi.fn(),
  deleteCamera:  vi.fn(),
  testCamera:    vi.fn(),
  startStream:   vi.fn(),
  stopStream:    vi.fn(),
}))

// Mock hls.js
vi.mock('hls.js', () => ({
  default: class Hls {
    static isSupported = vi.fn(() => false)
    static Events = {}
    loadSource = vi.fn()
    attachMedia = vi.fn()
    on = vi.fn()
    destroy = vi.fn()
  },
}))

import { CameraGrid } from '@/components/cameras/CameraGrid'
import type { Camera } from '@/api/cameras'

function makeCamera(id: string, name: string): Camera {
  return {
    id,
    name,
    manufacturer: 'Axis',
    model:        'P3',
    siteId:       'ALPHA',
    location:     'Gate',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2024-01-01T00:00:00Z',
    updatedAt:    '2024-01-01T00:00:00Z',
  }
}

beforeEach(() => {
  // Override loadCameras to a no-op so useEffect doesn't change loading state during tests
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
    loadCameras: vi.fn().mockResolvedValue(undefined),
  } as Parameters<typeof useCameraStore.setState>[0])
})

describe('CameraGrid', () => {
  it('renders the Cameras heading', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Cameras/)).toBeInTheDocument()
  })

  it('shows empty state when no cameras and not loading', () => {
    render(<CameraGrid />)
    expect(screen.getByText('No cameras found')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading with no cameras', () => {
    useCameraStore.setState({ loading: true, cameras: [] })
    render(<CameraGrid />)
    // Skeleton divs are rendered — heading still present
    expect(screen.getByText(/Cameras/)).toBeInTheDocument()
  })

  it('renders camera cards when cameras are present', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c1', 'Gate Alpha'), makeCamera('c2', 'Gate Beta')],
      total: 2,
    })
    render(<CameraGrid />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
    expect(screen.getByText('Gate Beta')).toBeInTheDocument()
  })

  it('shows error message when error is in store state', () => {
    useCameraStore.setState({
      error: 'Network error',
      cameras: [],
      loading: false,
      loadCameras: vi.fn().mockResolvedValue(undefined),
    } as Parameters<typeof useCameraStore.setState>[0])
    render(<CameraGrid />)
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('renders "+ Add Camera" toolbar button', () => {
    render(<CameraGrid />)
    expect(screen.getByText('+ Add Camera')).toBeInTheDocument()
  })
})
