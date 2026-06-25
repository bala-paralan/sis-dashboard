import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'

vi.mock('hls.js', () => ({
  default: {
    isSupported: vi.fn(() => false),
    Events: { ERROR: 'hlsError', MANIFEST_PARSED: 'manifestParsed' },
  },
}))

const baseCam = {
  id: 'cam-001',
  name: 'Perimeter',
  status: 'ONLINE' as const,
  rtspUrl: 'rtsp://example.com/stream',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('CameraPlayer', () => {
  const onClose = vi.fn()
  const startStream = vi.fn().mockResolvedValue('http://stream/index.m3u8')
  const stopStream = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    useCameraStore.setState({
      cameras: [baseCam],
      streamUrls: {},
      startStream,
      stopStream,
      loadCameras: vi.fn(),
      addCamera: vi.fn(),
      editCamera: vi.fn(),
      removeCamera: vi.fn(),
      testCamera: vi.fn(),
      selectCamera: vi.fn(),
      setFilterStatus: vi.fn(),
      setFilterSiteId: vi.fn(),
      total: 1,
      page: 1,
      loading: false,
      error: null,
      selectedId: 'cam-001',
      testResults: {},
      filterStatus: '',
      filterSiteId: '',
    })
  })

  it('renders the camera name in the header', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(screen.getByText('Perimeter')).toBeInTheDocument()
  })

  it('renders a close button', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('calls startStream on mount', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(startStream).toHaveBeenCalledWith('cam-001')
  })

  it('renders with an existing stream URL without calling startStream', () => {
    useCameraStore.setState({ streamUrls: { 'cam-001': 'http://already/index.m3u8' } })
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    expect(startStream).not.toHaveBeenCalled()
  })

  it('shows the cameraId as fallback when camera not found', () => {
    render(<CameraPlayer cameraId="cam-999" onClose={onClose} />)
    expect(screen.getByText('cam-999')).toBeInTheDocument()
  })
})
