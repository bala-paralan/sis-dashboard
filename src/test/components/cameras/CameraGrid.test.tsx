import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import type { Camera } from '@/api/cameras'

// ── Mock the camera store ─────────────────────────────────────────────────
const mockStore = {
  cameras:      [] as Camera[],
  total:        0,
  page:         1,
  loading:      false,
  error:        null as string | null,
  selectedId:   null as string | null,
  testResults:  {} as Record<string, { reachable: boolean; latency_ms: number | null; message: string }>,
  filterStatus: '' as string,
  filterSiteId: '' as string,
  loadCameras:  vi.fn().mockResolvedValue(undefined),
  addCamera:    vi.fn().mockResolvedValue(undefined),
  editCamera:   vi.fn().mockResolvedValue(undefined),
  removeCamera: vi.fn().mockResolvedValue(undefined),
  testCamera:   vi.fn().mockResolvedValue(undefined),
  selectCamera: vi.fn(),
  setFilterStatus: vi.fn(),
  setFilterSiteId: vi.fn(),
}

vi.mock('@/store/cameraStore', () => ({
  useCameraStore: (selector: (s: typeof mockStore) => unknown) =>
    typeof selector === 'function' ? selector(mockStore) : mockStore,
}))

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2-L',
    siteId:       'site-alpha',
    location:     'Main entrance',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00Z',
    updatedAt:    '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  mockStore.cameras      = []
  mockStore.total        = 0
  mockStore.page         = 1
  mockStore.loading      = false
  mockStore.error        = null
  mockStore.selectedId   = null
  mockStore.testResults  = {}
  mockStore.filterStatus = ''
  mockStore.filterSiteId = ''
  vi.clearAllMocks()
  mockStore.loadCameras.mockResolvedValue(undefined)
})

describe('CameraGrid', () => {
  it('renders the heading "Cameras"', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Cameras/)).toBeInTheDocument()
  })

  it('calls loadCameras on mount', () => {
    render(<CameraGrid />)
    expect(mockStore.loadCameras).toHaveBeenCalled()
  })

  it('shows empty state when no cameras', () => {
    render(<CameraGrid />)
    expect(screen.getByText('No cameras found')).toBeInTheDocument()
  })

  it('renders camera cards when cameras are present', () => {
    mockStore.cameras = [makeCamera({ id: 'cam-001', name: 'Front Gate' }), makeCamera({ id: 'cam-002', name: 'Back Gate' })]
    mockStore.total = 2
    render(<CameraGrid />)
    expect(screen.getByText('Front Gate')).toBeInTheDocument()
    expect(screen.getByText('Back Gate')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading and no cameras', () => {
    mockStore.loading = true
    mockStore.cameras = []
    const { container } = render(<CameraGrid />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    mockStore.error = 'Network error'
    render(<CameraGrid />)
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('opens Add Camera modal when + Add Camera button clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('closes Add Camera modal when Cancel is clicked', async () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Add Camera' })).not.toBeInTheDocument()
    )
  })

  it('renders total count in heading', () => {
    mockStore.total = 42
    render(<CameraGrid />)
    expect(screen.getByText('(42)')).toBeInTheDocument()
  })

  it('calls loadCameras when Refresh button clicked', async () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('↺ Refresh'))
    await waitFor(() => expect(mockStore.loadCameras).toHaveBeenCalledTimes(2))
  })

  it('does not show pagination when total <= 24', () => {
    mockStore.total = 10
    render(<CameraGrid />)
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
  })

  it('shows pagination when total > 24', () => {
    mockStore.total   = 50
    mockStore.cameras = Array.from({ length: 24 }, (_, i) =>
      makeCamera({ id: `cam-${i}`, name: `Camera ${i}` })
    )
    render(<CameraGrid />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('calls setFilterStatus when status filter changes', () => {
    render(<CameraGrid />)
    const select = screen.getAllByRole('combobox')[0]
    fireEvent.change(select, { target: { value: 'ONLINE' } })
    expect(mockStore.setFilterStatus).toHaveBeenCalledWith('ONLINE')
  })
})
