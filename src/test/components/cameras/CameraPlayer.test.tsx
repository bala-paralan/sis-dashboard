import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('hls.js', () => ({
  default: {
    isSupported: vi.fn(() => false),
    Events: { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' },
  },
}))

const mockCamera: Camera = {
  id: 'cam-007',
  name: 'Roof Camera',
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

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('CameraPlayer', () => {
  it('shows camera name in header when camera is in store', () => {
    const startStream = vi.fn().mockResolvedValue('http://localhost/stream.m3u8')
    const stopStream = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({
      cameras: [mockCamera],
      streamUrls: {},
      startStream,
      stopStream,
    } as never)
    render(<CameraPlayer cameraId="cam-007" onClose={vi.fn()} />)
    expect(screen.getByText('Roof Camera')).toBeInTheDocument()
  })

  it('shows camera id when camera not in store', () => {
    const startStream = vi.fn().mockResolvedValue('http://localhost/stream.m3u8')
    const stopStream = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ cameras: [], streamUrls: {}, startStream, stopStream } as never)
    render(<CameraPlayer cameraId="cam-unknown" onClose={vi.fn()} />)
    expect(screen.getByText('cam-unknown')).toBeInTheDocument()
  })

  it('shows connecting message while stream loads', () => {
    const startStream = vi.fn(() => new Promise(() => undefined))
    const stopStream = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ cameras: [], streamUrls: {}, startStream, stopStream } as never)
    render(<CameraPlayer cameraId="cam-007" onClose={vi.fn()} />)
    expect(screen.getByText('Connecting to stream…')).toBeInTheDocument()
  })

  it('renders Close button', () => {
    const startStream = vi.fn().mockResolvedValue('http://localhost/stream.m3u8')
    const stopStream = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({ cameras: [], streamUrls: {}, startStream, stopStream } as never)
    render(<CameraPlayer cameraId="cam-007" onClose={vi.fn()} />)
    expect(screen.getByText('✕ Close')).toBeInTheDocument()
  })
})
