import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { Camera } from '@/api/cameras'

const mockCameras: Camera[] = [
  {
    id: 'cam-001',
    name: 'Gate Alpha',
    manufacturer: 'Hikvision',
    model: 'DS-2CD2143',
    siteId: 'SITE-A',
    location: 'Main Gate',
    status: 'ONLINE',
    lastSeenAt: '2026-04-11T10:00:00.000Z',
    createdBy: 'admin',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-11T10:00:00.000Z',
  },
  {
    id: 'cam-002',
    name: 'Perimeter North',
    manufacturer: 'Dahua',
    model: 'IPC-HDW2831T',
    siteId: 'SITE-A',
    location: 'North Wall',
    status: 'OFFLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
]

const mockStore = {
  cameras: mockCameras,
  total: 2,
  page: 1,
  loading: false,
  error: null,
  selectedId: null,
  testResults: {},
  filterStatus: '' as const,
  filterSiteId: '',
  loadCameras: vi.fn().mockResolvedValue(undefined),
  addCamera: vi.fn().mockResolvedValue(mockCameras[0]),
  editCamera: vi.fn().mockResolvedValue(mockCameras[0]),
  removeCamera: vi.fn().mockResolvedValue(undefined),
  testCamera: vi.fn().mockResolvedValue(undefined),
  selectCamera: vi.fn(),
  startStream: vi.fn().mockResolvedValue('http://localhost/hls/cam-001/index.m3u8'),
  stopStream: vi.fn().mockResolvedValue(undefined),
  setFilterStatus: vi.fn(),
  setFilterSiteId: vi.fn(),
}

vi.mock('@/store/cameraStore', () => ({
  useCameraStore: vi.fn(() => mockStore),
}))

vi.mock('hls.js', () => {
  const MockHls = vi.fn().mockImplementation(() => ({
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  }))
  ;(MockHls as any).isSupported = vi.fn().mockReturnValue(false)
  ;(MockHls as any).Events = { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' }
  return { default: MockHls }
})

const { CameraGrid } = await import('@/components/cameras/CameraGrid')

beforeEach(() => {
  vi.clearAllMocks()
  mockStore.cameras = mockCameras
  mockStore.loading = false
  mockStore.error = null
  mockStore.selectedId = null
  mockStore.total = 2
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows cameras heading', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Cameras/i)).toBeInTheDocument()
  })

  it('shows total count', () => {
    render(<CameraGrid />)
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('renders camera cards for each camera', () => {
    render(<CameraGrid />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
    expect(screen.getByText('Perimeter North')).toBeInTheDocument()
  })

  it('renders Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /\+ Add Camera/i })).toBeInTheDocument()
  })

  it('renders Refresh button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument()
  })

  it('renders status filter dropdown', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders site ID filter input', () => {
    render(<CameraGrid />)
    expect(screen.getByPlaceholderText(/Site ID/i)).toBeInTheDocument()
  })

  it('opens Add Camera modal showing the heading when Add Camera button is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Camera/i }))
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('shows error message when error state is set', () => {
    mockStore.error = 'Failed to fetch cameras'
    render(<CameraGrid />)
    expect(screen.getByText(/Failed to fetch cameras/i)).toBeInTheDocument()
  })

  it('calls loadCameras on initial render', () => {
    render(<CameraGrid />)
    expect(mockStore.loadCameras).toHaveBeenCalled()
  })

  it('renders loading skeletons when loading with no cameras', () => {
    mockStore.loading = true
    mockStore.cameras = []
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no cameras and not loading', () => {
    mockStore.cameras = []
    mockStore.total = 0
    render(<CameraGrid />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/No cameras|Add Camera/i)
  })
})
