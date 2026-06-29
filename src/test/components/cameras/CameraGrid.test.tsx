import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

const mockCam = (id: string, name: string): Camera => ({
  id,
  name,
  manufacturer: 'Axis',
  model: 'P3245',
  siteId: 'S1',
  location: 'Main Gate',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

vi.mock('@/store/cameraStore', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/store/cameraStore')>()
  return mod
})

describe('CameraGrid', () => {
  const loadCameras    = vi.fn().mockResolvedValue(undefined)
  const addCamera      = vi.fn().mockResolvedValue(mockCam('new', 'New'))
  const editCamera     = vi.fn().mockResolvedValue(mockCam('cam-001', 'Updated'))
  const removeCamera   = vi.fn().mockResolvedValue(undefined)
  const testCamera     = vi.fn().mockResolvedValue(undefined)
  const selectCamera   = vi.fn()
  const setFilterStatus = vi.fn()
  const setFilterSiteId = vi.fn()

  const baseState = {
    cameras: [mockCam('cam-001', 'Gate Alpha'), mockCam('cam-002', 'East Fence')],
    total: 2,
    page: 1,
    loading: false,
    error: null,
    selectedId: null,
    testResults: {},
    filterStatus: '' as const,
    filterSiteId: '',
    streamUrls: {},
    loadCameras,
    addCamera,
    editCamera,
    removeCamera,
    testCamera,
    selectCamera,
    startStream: vi.fn(),
    stopStream: vi.fn(),
    setFilterStatus,
    setFilterSiteId,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useCameraStore.setState(baseState)
  })

  it('renders the page heading with camera count', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Cameras/)).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('renders a card for each camera', () => {
    render(<CameraGrid />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
    expect(screen.getByText('East Fence')).toBeInTheDocument()
  })

  it('shows Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByText('+ Add Camera')).toBeInTheDocument()
  })

  it('opens add modal when Add Camera is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('shows loading skeletons when loading with no cameras', () => {
    useCameraStore.setState({ ...baseState, cameras: [], loading: true })
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no cameras and not loading', () => {
    useCameraStore.setState({ ...baseState, cameras: [], total: 0, loading: false })
    render(<CameraGrid />)
    expect(screen.getByText('No cameras found')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    useCameraStore.setState({ ...baseState, error: 'Failed to reach server' })
    render(<CameraGrid />)
    expect(screen.getByText('Failed to reach server')).toBeInTheDocument()
  })

  it('renders status filter select with All statuses option', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('All statuses')).toBeInTheDocument()
  })

  it('hides pagination when total ≤ 24', () => {
    render(<CameraGrid />)
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
  })

  it('shows pagination when total > 24', () => {
    useCameraStore.setState({ ...baseState, total: 50 })
    render(<CameraGrid />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })
})
