import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera A',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2T47G2',
  siteId:       'site-01',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-04-26T10:00:00.000Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-04-26T10:00:00.000Z',
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
    addCamera:    vi.fn().mockResolvedValue(mockCamera),
    editCamera:   vi.fn().mockResolvedValue(mockCamera),
    removeCamera: vi.fn().mockResolvedValue(undefined),
    testCamera:   vi.fn().mockResolvedValue(undefined),
    selectCamera: vi.fn(),
    startStream:  vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
    stopStream:   vi.fn().mockResolvedValue(undefined),
    setFilterStatus: vi.fn(),
    setFilterSiteId: vi.fn(),
  })
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders Cameras heading (h1)', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/\+ Add Camera/i)).toBeInTheDocument()
  })

  it('renders status filter dropdown', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/All statuses/i)).toBeInTheDocument()
  })

  it('renders Refresh button', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Refresh/i)).toBeInTheDocument()
  })

  it('shows "No cameras found" when empty and not loading', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/No cameras found/i)).toBeInTheDocument()
  })

  it('renders camera cards when cameras exist', () => {
    useCameraStore.setState({ cameras: [mockCamera], total: 1 })
    render(<CameraGrid />)
    expect(screen.getByText('Gate Camera A')).toBeInTheDocument()
  })

  it('shows animated skeleton when loading with no cameras', () => {
    useCameraStore.setState({ loading: true, cameras: [] })
    render(<CameraGrid />)
    // Loading skeleton uses animate-pulse class
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    useCameraStore.setState({ error: 'Failed to connect' })
    render(<CameraGrid />)
    expect(screen.getByText(/Failed to connect/i)).toBeInTheDocument()
  })

  it('opens Add Camera modal when button clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText(/\+ Add Camera/i))
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('shows total camera count in heading', () => {
    useCameraStore.setState({ cameras: [mockCamera], total: 1 })
    render(<CameraGrid />)
    // Heading shows "Cameras (1)"
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toMatch(/1/)
  })
})
