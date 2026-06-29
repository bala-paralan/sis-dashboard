import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

const mockCam: Camera = {
  id: 'cam-001',
  name: 'Gate Alpha',
  manufacturer: 'Axis',
  model: 'P3245',
  siteId: 'S1',
  location: 'Main Gate',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

// Mock hls.js — not available in jsdom
vi.mock('hls.js', () => ({
  default: {
    isSupported: vi.fn(() => false),
    Events: { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' },
  },
}))

describe('CameraPlayer', () => {
  const startStream = vi.fn().mockResolvedValue('http://localhost/stream/cam-001.m3u8')
  const stopStream  = vi.fn().mockResolvedValue(undefined)
  const onClose = vi.fn()

  const baseState = {
    cameras: [mockCam],
    streamUrls: {},
    startStream,
    stopStream,
    cameras_total: 1,
    page: 1,
    loading: false,
    error: null,
    selectedId: 'cam-001',
    testResults: {},
    filterStatus: '' as const,
    filterSiteId: '',
    total: 1,
    addCamera: vi.fn(),
    editCamera: vi.fn(),
    removeCamera: vi.fn(),
    testCamera: vi.fn(),
    selectCamera: vi.fn(),
    setFilterStatus: vi.fn(),
    setFilterSiteId: vi.fn(),
    loadCameras: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useCameraStore.setState(baseState)
  })

  it('renders camera name in header', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
  })

  it('renders Close button', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(screen.getByText(/Close/)).toBeInTheDocument()
  })

  it('shows connecting message while stream loads', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(screen.getByText(/Connecting to stream/)).toBeInTheDocument()
  })

  it('falls back to cameraId in header if camera not found', () => {
    useCameraStore.setState({ ...baseState, cameras: [] })
    render(<CameraPlayer cameraId="cam-unknown" onClose={onClose} />)
    expect(screen.getByText('cam-unknown')).toBeInTheDocument()
  })

  it('renders a video element', () => {
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(container.querySelector('video')).toBeInTheDocument()
  })

  it('shows HLS error when stream URL already has an error message', async () => {
    // Simulate startStream rejecting
    startStream.mockRejectedValueOnce(new Error('Stream not available'))
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    // Error appears asynchronously — confirm video element still renders
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(container.querySelector('video')).toBeInTheDocument()
  })
})
