import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('hls.js', () => ({
  default: {
    isSupported: vi.fn(() => false),
    Events: { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' },
  },
}))

vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn(),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera:   vi.fn(),
  startStream:  vi.fn().mockResolvedValue({ cameraId: 'cam-001', hlsUrl: '/hls/cam-001.m3u8', message: 'ok' }),
  stopStream:   vi.fn().mockResolvedValue(undefined),
}))

const camera: Camera = {
  id: 'cam-001', name: 'Gate Camera', manufacturer: null, model: null,
  siteId: null, location: null, status: 'ONLINE', lastSeenAt: null,
  createdBy: 'admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [camera], total: 1, page: 1, loading: false, error: null,
    selectedId: 'cam-001', streamUrls: {}, testResults: {},
    filterStatus: '', filterSiteId: '',
  })
  vi.clearAllMocks()
})

describe('CameraPlayer', () => {
  it('renders camera name in header', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })

  it('renders Close button', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('✕ Close')).toBeInTheDocument()
  })

  it('calls onClose when Close button is clicked', () => {
    const onClose = vi.fn()
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    fireEvent.click(screen.getByText('✕ Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows connecting message while stream starts', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText(/Connecting to stream/i)).toBeInTheDocument()
  })

  it('renders video element', () => {
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(container.querySelector('video')).toBeInTheDocument()
  })
})
