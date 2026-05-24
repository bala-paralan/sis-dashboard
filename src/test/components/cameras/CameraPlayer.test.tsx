import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock hls.js
vi.mock('hls.js', () => ({
  default: class MockHls {
    static isSupported = () => false
    loadSource = vi.fn()
    attachMedia = vi.fn()
    on = vi.fn()
    destroy = vi.fn()
  },
}))

// Mock camera API
vi.mock('@/api/cameras', () => ({
  fetchCameras:  vi.fn(),
  createCamera:  vi.fn(),
  updateCamera:  vi.fn(),
  deleteCamera:  vi.fn(),
  testCamera:    vi.fn(),
  startStream:   vi.fn(),
  stopStream:    vi.fn(),
}))

function makeCamera(id = 'cam-001'): Camera {
  return {
    id,
    name: 'Test Camera',
    manufacturer: null,
    model: null,
    siteId: null,
    location: null,
    status: 'ONLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [makeCamera()],
    total: 1,
    page: 1,
    loading: false,
    error: null,
    selectedId: null,
    streamUrls: {},
    testResults: {},
    filterStatus: '',
    filterSiteId: '',
  })
})

describe('CameraPlayer', () => {
  it('renders without crashing', () => {
    const startStream = vi.fn().mockResolvedValue('http://example.com/stream.m3u8')
    useCameraStore.setState({ ...useCameraStore.getState(), startStream } as Parameters<typeof useCameraStore.setState>[0])

    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the camera name in the player header', () => {
    useCameraStore.setState({
      ...useCameraStore.getState(),
      startStream: vi.fn().mockResolvedValue('http://x.com/stream.m3u8'),
    } as Parameters<typeof useCameraStore.setState>[0])

    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Test Camera')).toBeInTheDocument()
  })

  it('renders a video element', () => {
    useCameraStore.setState({
      ...useCameraStore.getState(),
      startStream: vi.fn().mockResolvedValue('http://x.com/stream.m3u8'),
    } as Parameters<typeof useCameraStore.setState>[0])

    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(document.querySelector('video')).toBeInTheDocument()
  })

  it('shows a close button', () => {
    useCameraStore.setState({
      ...useCameraStore.getState(),
      startStream: vi.fn().mockResolvedValue('http://x.com/stream.m3u8'),
    } as Parameters<typeof useCameraStore.setState>[0])

    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    // close button has × or close text
    const closeBtn = document.querySelector('button')
    expect(closeBtn).toBeInTheDocument()
  })

  it('uses existing stream URL if already in store', () => {
    const startStream = vi.fn()
    useCameraStore.setState({
      ...useCameraStore.getState(),
      streamUrls: { 'cam-001': 'http://existing.com/stream.m3u8' },
      startStream,
    } as Parameters<typeof useCameraStore.setState>[0])

    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(startStream).not.toHaveBeenCalled()
  })
})
