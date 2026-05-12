import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
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

function mockCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Alpha',
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
    loadCameras:  vi.fn().mockResolvedValue(undefined),
    addCamera:    vi.fn().mockResolvedValue(mockCamera()),
    editCamera:   vi.fn().mockResolvedValue(mockCamera()),
    removeCamera: vi.fn().mockResolvedValue(undefined),
    testCamera:   vi.fn().mockResolvedValue(undefined),
    selectCamera: vi.fn(),
    startStream:  vi.fn().mockResolvedValue('http://x/stream.m3u8'),
    stopStream:   vi.fn().mockResolvedValue(undefined),
    setFilterStatus: vi.fn(),
    setFilterSiteId: vi.fn(),
  } as any)
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    expect(() => render(<CameraGrid />)).not.toThrow()
  })

  it('shows "Cameras" heading with total count', () => {
    useCameraStore.setState({ total: 5 } as any)
    render(<CameraGrid />)
    expect(screen.getByText(/Cameras/)).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('shows "No cameras found" when list is empty', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/No cameras found/i)).toBeInTheDocument()
  })

  it('renders camera cards when cameras exist', () => {
    useCameraStore.setState({ cameras: [mockCamera(), mockCamera({ id: 'cam-002', name: 'South Gate' })], total: 2 } as any)
    render(<CameraGrid />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
    expect(screen.getByText('South Gate')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    useCameraStore.setState({ error: 'Network failure' } as any)
    render(<CameraGrid />)
    expect(screen.getByText('Network failure')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading with no cameras', () => {
    useCameraStore.setState({ loading: true, cameras: [] } as any)
    const { container } = render(<CameraGrid />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByText('+ Add Camera')).toBeInTheDocument()
  })

  it('opens add modal when Add Camera button is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('has a status filter dropdown', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('has a site ID filter input', () => {
    render(<CameraGrid />)
    expect(screen.getByPlaceholderText(/site id/i)).toBeInTheDocument()
  })

  it('calls setFilterStatus when status dropdown changes', () => {
    render(<CameraGrid />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ONLINE' } })
    expect(useCameraStore.getState().setFilterStatus).toHaveBeenCalledWith('ONLINE')
  })

  it('shows pagination controls when total > 24', () => {
    useCameraStore.setState({ total: 50, page: 1 } as any)
    render(<CameraGrid />)
    expect(screen.getByText(/Prev/)).toBeInTheDocument()
    expect(screen.getByText(/Next/)).toBeInTheDocument()
  })

  it('does not show pagination when total <= 24', () => {
    useCameraStore.setState({ total: 10, page: 1 } as any)
    render(<CameraGrid />)
    expect(screen.queryByText(/Prev/)).not.toBeInTheDocument()
  })
})
