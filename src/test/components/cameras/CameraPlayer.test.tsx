import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// hls.js is complex — declare it unsupported so CameraPlayer falls through to the
// "HLS not supported" error branch, which keeps tests simple and fast.
vi.mock('hls.js', () => ({
  default: {
    isSupported: () => false,
    Events: { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' },
  },
}))

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Gate Camera Alpha',
  manufacturer: null,
  model: null,
  siteId: null,
  location: null,
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const startStream = vi.fn().mockResolvedValue('http://example.com/stream.m3u8')
const stopStream  = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  vi.clearAllMocks()
  useCameraStore.setState({
    cameras: [mockCamera],
    streamUrls: {},
    startStream,
    stopStream,
    // minimal required state
    total: 1,
    page: 1,
    loading: false,
    error: null,
    selectedId: null,
    testResults: {},
    filterStatus: '',
    filterSiteId: '',
    loadCameras: vi.fn().mockResolvedValue(undefined),
    addCamera: vi.fn().mockResolvedValue(mockCamera),
    editCamera: vi.fn().mockResolvedValue(mockCamera),
    removeCamera: vi.fn().mockResolvedValue(undefined),
    testCamera: vi.fn().mockResolvedValue(undefined),
    selectCamera: vi.fn(),
    setFilterStatus: vi.fn(),
    setFilterSiteId: vi.fn(),
  } as Parameters<typeof useCameraStore.setState>[0])
})

describe('CameraPlayer', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows camera name in header', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Gate Camera Alpha')).toBeInTheDocument()
  })

  it('calls startStream on mount', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(startStream).toHaveBeenCalledWith('cam-001')
  })

  it('renders close button', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument()
  })

  it('calls onClose and stopStream when close button clicked', async () => {
    const onClose = vi.fn()
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /Close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('uses cameraId as fallback when camera is not found in store', () => {
    render(<CameraPlayer cameraId="cam-unknown" onClose={vi.fn()} />)
    expect(screen.getByText('cam-unknown')).toBeInTheDocument()
  })

  it('skips startStream when HLS URL is already in streamUrls', () => {
    useCameraStore.setState({
      streamUrls: { 'cam-001': 'http://example.com/stream.m3u8' },
    } as Parameters<typeof useCameraStore.setState>[0])
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(startStream).not.toHaveBeenCalled()
  })
})
