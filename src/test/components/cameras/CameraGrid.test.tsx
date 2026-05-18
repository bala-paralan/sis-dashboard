import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'North Gate',
  manufacturer: 'Dahua',
  model: 'IPC-HDW2831',
  siteId: 'site-A',
  location: 'North fence',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
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
  vi.restoreAllMocks()
})

describe('CameraGrid', () => {
  it('shows loading skeleton when loading with no cameras', () => {
    useCameraStore.setState({ loading: true })
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ loadCameras } as never)
    render(<CameraGrid />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no cameras found', async () => {
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ loadCameras, cameras: [], loading: false } as never)
    render(<CameraGrid />)
    expect(await screen.findByText('No cameras found')).toBeInTheDocument()
  })

  it('renders camera cards when cameras exist', () => {
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({
      cameras: [mockCamera],
      total: 1,
      loading: false,
      loadCameras,
    } as never)
    render(<CameraGrid />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ error: 'Failed to load', loadCameras } as never)
    render(<CameraGrid />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })

  it('renders Add Camera button', () => {
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ loadCameras } as never)
    render(<CameraGrid />)
    expect(screen.getByText('+ Add Camera')).toBeInTheDocument()
  })

  it('shows camera count in heading', () => {
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ total: 5, loadCameras } as never)
    render(<CameraGrid />)
    expect(screen.getByText('(5)')).toBeInTheDocument()
  })
})
