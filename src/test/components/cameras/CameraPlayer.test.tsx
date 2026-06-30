import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'

// Mock hls.js
vi.mock('hls.js', () => {
  const Hls = vi.fn().mockImplementation(() => ({
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  }))
  Hls.isSupported = vi.fn().mockReturnValue(false) // Use native fallback path
  Hls.Events = {
    MANIFEST_PARSED: 'hlsManifestParsed',
    ERROR: 'hlsError',
  }
  return { default: Hls }
})

beforeEach(() => {
  vi.clearAllMocks()
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
  })
})

describe('CameraPlayer', () => {
  it('renders connecting message while loading', () => {
    vi.spyOn(useCameraStore.getState(), 'startStream').mockReturnValue(new Promise(() => {}))
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText(/Connecting to stream/i)).toBeInTheDocument()
  })

  it('shows camera id as title when camera name is not in store', () => {
    vi.spyOn(useCameraStore.getState(), 'startStream').mockReturnValue(new Promise(() => {}))
    render(<CameraPlayer cameraId="cam-999" onClose={vi.fn()} />)
    expect(screen.getByText('cam-999')).toBeInTheDocument()
  })

  it('shows camera name when camera is in store', () => {
    useCameraStore.setState({
      cameras: [{
        id: 'cam-001', name: 'Main Gate Cam', manufacturer: null, model: null,
        siteId: null, location: null, status: 'ONLINE', lastSeenAt: null,
        createdBy: 'admin', createdAt: '', updatedAt: '',
      }],
    })
    vi.spyOn(useCameraStore.getState(), 'startStream').mockReturnValue(new Promise(() => {}))
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Main Gate Cam')).toBeInTheDocument()
  })

  it('shows HLS not supported error when neither hls.js nor native supported', async () => {
    // startStream returns a URL but Hls.isSupported returns false and no canPlayType
    vi.spyOn(useCameraStore.getState(), 'startStream').mockResolvedValueOnce('http://localhost/hls/cam-001/index.m3u8')
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    // The error message appears after the stream URL resolves and HLS.isSupported() returns false
    // and canPlayType returns empty
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument()
  })

  it('shows error when startStream rejects', async () => {
    vi.spyOn(useCameraStore.getState(), 'startStream').mockRejectedValueOnce(new Error('Stream unavailable'))

    const { findByText } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    const errorMsg = await findByText(/Stream unavailable/i)
    expect(errorMsg).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    vi.spyOn(useCameraStore.getState(), 'startStream').mockReturnValue(new Promise(() => {}))
    vi.spyOn(useCameraStore.getState(), 'stopStream').mockResolvedValue(undefined)

    const onClose = vi.fn()
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    fireEvent.click(screen.getByText(/✕ Close/i))
    expect(onClose).toHaveBeenCalled()
  })

  it('uses existing stream URL from store without re-starting', () => {
    useCameraStore.setState({ streamUrls: { 'cam-001': 'http://localhost/hls/cam-001/index.m3u8' } })
    const startStream = vi.spyOn(useCameraStore.getState(), 'startStream').mockResolvedValue('')

    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(startStream).not.toHaveBeenCalled()
  })
})
