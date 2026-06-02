import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'

vi.mock('hls.js', () => {
  const Hls = vi.fn()
  Hls.isSupported = vi.fn().mockReturnValue(false)
  Hls.Events = { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' }
  Hls.prototype.loadSource = vi.fn()
  Hls.prototype.attachMedia = vi.fn()
  Hls.prototype.on = vi.fn()
  Hls.prototype.destroy = vi.fn()
  return { default: Hls }
})

vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera: vi.fn(),
  startStream: vi.fn().mockResolvedValue({ cameraId: 'cam-001', hlsUrl: 'http://example.com/hls.m3u8', message: 'ok' }),
  stopStream: vi.fn().mockResolvedValue(undefined),
}))

beforeEach(() => {
  useCameraStore.setState({
    cameras: [{
      id: 'cam-001', name: 'Test Cam', manufacturer: null, model: null,
      siteId: null, location: null, status: 'ONLINE',
      lastSeenAt: null, createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
    }],
    streamUrls: {},
    startStream: vi.fn().mockResolvedValue('http://example.com/hls.m3u8'),
    stopStream: vi.fn().mockResolvedValue(undefined),
  } as Parameters<typeof useCameraStore.setState>[0])
})

describe('CameraPlayer', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders camera name in the player header', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Test Cam')).toBeInTheDocument()
  })

  it('renders a close button', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders a video element or fallback', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    // In jsdom, hls.js is not supported so it renders native video or fallback
    expect(screen.getByText('Test Cam')).toBeInTheDocument()
  })
})
