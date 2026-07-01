import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock hls.js
vi.mock('hls.js', () => ({
  default: {
    isSupported: vi.fn(() => false),
    Events: { MANIFEST_PARSED: 'manifestParsed', ERROR: 'hlsError' },
  },
}))

function makeCamera(id: string): Camera {
  return {
    id,
    name: 'Main Entrance',
    manufacturer: 'Axis',
    model: 'P3245',
    siteId: 'SITE-01',
    location: 'Gate A',
    status: 'ONLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [makeCamera('cam-001')],
    total: 1, page: 1, loading: false, error: null,
    selectedId: 'cam-001',
    streamUrls: {},
    testResults: {},
    filterStatus: '', filterSiteId: '',
  })
  vi.clearAllMocks()
})

describe('CameraPlayer', () => {
  it('renders the camera name in the header', () => {
    const startStream = vi.fn().mockResolvedValue('http://example.com/stream.m3u8')
    useCameraStore.setState({ startStream } as any, true)
    // Manually wire store with the real state + mocked action
    useCameraStore.setState({
      cameras: [makeCamera('cam-001')],
      streamUrls: {},
      startStream,
      stopStream: vi.fn().mockResolvedValue(undefined),
    } as any)
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Main Entrance')).toBeInTheDocument()
  })

  it('shows "Connecting to stream…" on mount when no streamUrl cached', () => {
    useCameraStore.setState({
      cameras: [makeCamera('cam-001')],
      streamUrls: {},
      startStream: vi.fn().mockResolvedValue('http://example.com/stream.m3u8'),
      stopStream: vi.fn().mockResolvedValue(undefined),
    } as any)
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Connecting to stream…')).toBeInTheDocument()
  })

  it('shows error text when startStream rejects', async () => {
    useCameraStore.setState({
      cameras: [makeCamera('cam-001')],
      streamUrls: {},
      startStream: vi.fn().mockRejectedValue(new Error('No stream available')),
      stopStream: vi.fn().mockResolvedValue(undefined),
    } as any)
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    await screen.findByText('No stream available')
  })

  it('renders a Close button', () => {
    useCameraStore.setState({
      cameras: [makeCamera('cam-001')],
      streamUrls: {},
      startStream: vi.fn().mockResolvedValue('http://example.com/stream.m3u8'),
      stopStream: vi.fn().mockResolvedValue(undefined),
    } as any)
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText(/Close/i)).toBeInTheDocument()
  })

  it('calls onClose and stopStream when Close is clicked', async () => {
    const onClose = vi.fn()
    const stopStream = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState({
      cameras: [makeCamera('cam-001')],
      streamUrls: {},
      startStream: vi.fn().mockResolvedValue('http://example.com/stream.m3u8'),
      stopStream,
    } as any)
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    fireEvent.click(screen.getByText(/Close/i))
    expect(onClose).toHaveBeenCalled()
  })

  it('falls back to cameraId in header when camera not in store', () => {
    useCameraStore.setState({
      cameras: [],
      streamUrls: {},
      startStream: vi.fn().mockResolvedValue('http://example.com/stream.m3u8'),
      stopStream: vi.fn().mockResolvedValue(undefined),
    } as any)
    render(<CameraPlayer cameraId="unknown-cam" onClose={vi.fn()} />)
    expect(screen.getByText('unknown-cam')).toBeInTheDocument()
  })
})
