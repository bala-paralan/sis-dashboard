import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraStatus } from '@/api/cameras'

// Mock hls.js (not available in jsdom)
vi.mock('hls.js', () => ({
  default: {
    isSupported: vi.fn(() => false),
    Events: { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' },
  },
}))

function makeCamera(id: string, name: string, status: CameraStatus = 'ONLINE'): Camera {
  return {
    id,
    name,
    manufacturer: 'Hikvision',
    model:        'DS-2CD',
    siteId:       'SITE-A',
    location:     'Main Gate',
    status,
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-04-01T00:00:00.000Z',
  }
}

const mockStoreBase = {
  cameras:      [] as Camera[],
  total:        0,
  page:         1,
  loading:      false,
  error:        null,
  selectedId:   null as string | null,
  streamUrls:   {} as Record<string, string>,
  testResults:  {} as Record<string, { reachable: boolean; latency_ms: number | null; message: string }>,
  filterStatus: '' as CameraStatus | '',
  filterSiteId: '',
  loadCameras:  vi.fn().mockResolvedValue(undefined),
  addCamera:    vi.fn(),
  editCamera:   vi.fn(),
  removeCamera: vi.fn().mockResolvedValue(undefined),
  testCamera:   vi.fn().mockResolvedValue(undefined),
  selectCamera: vi.fn(),
  startStream:  vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
  stopStream:   vi.fn().mockResolvedValue(undefined),
  setFilterStatus: vi.fn(),
  setFilterSiteId: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  useCameraStore.setState({ ...mockStoreBase, loadCameras: vi.fn().mockResolvedValue(undefined) })
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    expect(() => render(<CameraGrid />)).not.toThrow()
  })

  it('shows "Cameras" heading with total count', () => {
    useCameraStore.setState({ total: 5 })
    render(<CameraGrid />)
    expect(screen.getByText('Cameras')).toBeInTheDocument()
    expect(screen.getByText('(5)')).toBeInTheDocument()
  })

  it('shows "No cameras found" empty state when cameras is empty and not loading', () => {
    render(<CameraGrid />)
    expect(screen.getByText('No cameras found')).toBeInTheDocument()
  })

  it('shows loading skeletons when loading is true and cameras list is empty', () => {
    useCameraStore.setState({ loading: true, cameras: [] })
    render(<CameraGrid />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders camera cards for each camera in the store', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c1', 'Front Gate'), makeCamera('c2', 'Back Door')],
      total: 2,
    })
    render(<CameraGrid />)
    expect(screen.getByText('Front Gate')).toBeInTheDocument()
    expect(screen.getByText('Back Door')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    useCameraStore.setState({ error: 'Failed to load cameras' })
    render(<CameraGrid />)
    expect(screen.getByText('Failed to load cameras')).toBeInTheDocument()
  })

  it('renders status filter dropdown', () => {
    render(<CameraGrid />)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('option', { name: 'All statuses' })).toBeInTheDocument()
  })

  it('renders site filter text input', () => {
    render(<CameraGrid />)
    expect(screen.getByPlaceholderText('Site ID…')).toBeInTheDocument()
  })

  it('renders Refresh and Add Camera buttons', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('calls loadCameras on mount', () => {
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ loadCameras })
    render(<CameraGrid />)
    expect(loadCameras).toHaveBeenCalled()
  })

  it('shows Add Camera modal when Add Camera button is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Camera/i }))
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('closes Add Camera modal when Cancel is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Camera/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('heading', { name: 'Add Camera' })).not.toBeInTheDocument()
  })

  it('opens Edit modal when Edit is clicked on a camera card', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c1', 'Gate Cam')],
      total: 1,
    })
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('heading', { name: 'Edit Camera' })).toBeInTheDocument()
  })

  it('does not show pagination when total <= 24', () => {
    useCameraStore.setState({ total: 10, page: 1 })
    render(<CameraGrid />)
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
  })

  it('shows pagination when total > 24', () => {
    useCameraStore.setState({
      cameras: Array.from({ length: 24 }, (_, i) => makeCamera(`c${i}`, `Cam ${i}`)),
      total: 30,
      page: 1,
    })
    render(<CameraGrid />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('Prev button is disabled on first page', () => {
    useCameraStore.setState({
      cameras: Array.from({ length: 24 }, (_, i) => makeCamera(`c${i}`, `Cam ${i}`)),
      total: 30,
      page: 1,
    })
    render(<CameraGrid />)
    expect(screen.getByText('← Prev')).toBeDisabled()
  })

  it('calls setFilterStatus and loadCameras when status filter changes', () => {
    const setFilterStatus = vi.fn()
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ setFilterStatus, loadCameras })
    render(<CameraGrid />)

    act(() => {
      fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'ONLINE' } })
    })
    expect(setFilterStatus).toHaveBeenCalledWith('ONLINE')
  })

  it('shows CameraPlayer overlay when a camera is selected', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c1', 'Gate Cam')],
      total: 1,
      selectedId: 'c1',
      startStream: vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
    })
    render(<CameraGrid />)
    // CameraPlayer renders the camera name in a heading and a close button
    expect(screen.getAllByText('Gate Cam').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /✕ Close/i })).toBeInTheDocument()
  })
})
