import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

const mockCamera = (overrides?: Partial<Camera>): Camera => ({
  id: 'cam-001',
  name: 'Gate Camera Alpha',
  manufacturer: 'Hikvision',
  model: 'DS-2CD2T47G2',
  siteId: 'SITE-01',
  location: 'North Gate',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const loadCameras = vi.fn().mockResolvedValue(undefined)
const addCamera   = vi.fn().mockResolvedValue(mockCamera())
const editCamera  = vi.fn().mockResolvedValue(mockCamera())
const removeCamera = vi.fn().mockResolvedValue(undefined)
const testCamera  = vi.fn().mockResolvedValue(undefined)
const selectCamera = vi.fn()
const setFilterStatus = vi.fn()
const setFilterSiteId = vi.fn()

function setStoreState(overrides?: Partial<ReturnType<typeof useCameraStore.getState>>) {
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
    loadCameras,
    addCamera,
    editCamera,
    removeCamera,
    testCamera,
    selectCamera,
    startStream: vi.fn().mockResolvedValue('http://example.com/stream.m3u8'),
    stopStream: vi.fn().mockResolvedValue(undefined),
    setFilterStatus,
    setFilterSiteId,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  setStoreState()
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows "Cameras" heading', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/^Cameras/i)).toBeInTheDocument()
  })

  it('calls loadCameras on mount', () => {
    render(<CameraGrid />)
    expect(loadCameras).toHaveBeenCalledOnce()
  })

  it('shows empty state when no cameras and not loading', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/No cameras found/i)).toBeInTheDocument()
  })

  it('shows skeleton cards when loading', () => {
    setStoreState({ loading: true, cameras: [] })
    const { container } = render(<CameraGrid />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders camera cards when cameras are loaded', () => {
    setStoreState({ cameras: [mockCamera(), mockCamera({ id: 'cam-002', name: 'Perimeter Cam' })] })
    render(<CameraGrid />)
    expect(screen.getByText('Gate Camera Alpha')).toBeInTheDocument()
    expect(screen.getByText('Perimeter Cam')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    setStoreState({ error: 'Failed to connect to API' })
    render(<CameraGrid />)
    expect(screen.getByText(/Failed to connect to API/i)).toBeInTheDocument()
  })

  it('renders status filter select', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders + Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/\+ Add Camera/i)).toBeInTheDocument()
  })

  it('opens add modal when + Add Camera is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText(/\+ Add Camera/i))
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('opens edit modal when Edit button clicked on a camera card', () => {
    setStoreState({ cameras: [mockCamera()] })
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
  })

  it('calls removeCamera when Delete confirmed on a camera card', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    setStoreState({ cameras: [mockCamera()] })
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('Delete'))
    expect(removeCamera).toHaveBeenCalledWith('cam-001')
  })

  it('shows total count from store in heading', () => {
    setStoreState({ total: 42 })
    render(<CameraGrid />)
    expect(screen.getByText('(42)')).toBeInTheDocument()
  })

  it('renders Refresh button', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/↺ Refresh/i)).toBeInTheDocument()
  })
})
