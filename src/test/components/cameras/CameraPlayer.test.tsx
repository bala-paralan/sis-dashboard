import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
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
  lastSeenAt:   null,
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-01-01T00:00:00.000Z',
}

const startStreamMock = vi.fn().mockResolvedValue('http://localhost/stream.m3u8')
const stopStreamMock  = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  vi.clearAllMocks()
  useCameraStore.setState({
    cameras:      [mockCamera],
    streamUrls:   {},
    startStream:  startStreamMock,
    stopStream:   stopStreamMock,
    total:        1,
    page:         1,
    loading:      false,
    error:        null,
    selectedId:   null,
    testResults:  {},
    filterStatus: '',
    filterSiteId: '',
    loadCameras:  vi.fn().mockResolvedValue(undefined),
    addCamera:    vi.fn(),
    editCamera:   vi.fn(),
    removeCamera: vi.fn(),
    testCamera:   vi.fn(),
    selectCamera: vi.fn(),
    setFilterStatus: vi.fn(),
    setFilterSiteId: vi.fn(),
  })
})

describe('CameraPlayer', () => {
  const onClose = vi.fn()

  it('renders without crashing', () => {
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows camera name', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(screen.getByText('Gate Camera A')).toBeInTheDocument()
  })

  it('renders a video element', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(document.querySelector('video')).toBeInTheDocument()
  })

  it('calls startStream on mount when no stream URL cached', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(startStreamMock).toHaveBeenCalledWith('cam-001')
  })

  it('does not call startStream when stream URL already cached', () => {
    useCameraStore.setState({ streamUrls: { 'cam-001': 'http://localhost/stream.m3u8' } })
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(startStreamMock).not.toHaveBeenCalled()
  })

  it('shows "Connecting to stream…" loading text initially', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(screen.getByText(/Connecting to stream/i)).toBeInTheDocument()
  })

  it('shows "✕ Close" button', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(screen.getByText(/✕ Close/i)).toBeInTheDocument()
  })

  it('falls back to cameraId as heading when camera not found', () => {
    useCameraStore.setState({ cameras: [] })
    render(<CameraPlayer cameraId="cam-999" onClose={onClose} />)
    expect(screen.getByText('cam-999')).toBeInTheDocument()
  })
})
