import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock hls.js before importing the component
vi.mock('hls.js', () => {
  const Hls = vi.fn().mockImplementation(() => ({
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  }))
  ;(Hls as unknown as Record<string, unknown>).isSupported = vi.fn().mockReturnValue(false)
  ;(Hls as unknown as Record<string, unknown>).Events = { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' }
  return { default: Hls }
})

// Import AFTER mock is set up
const { CameraPlayer } = await import('@/components/cameras/CameraPlayer')

function mockCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id: 'cam-001',
    name: 'South Gate',
    manufacturer: null,
    model: null,
    siteId: null,
    location: null,
    status: 'ONLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [mockCamera()],
    streamUrls: {},
    selectedId: null,
    total: 1,
    page: 1,
    loading: false,
    error: null,
    testResults: {},
    filterStatus: '',
    filterSiteId: '',
  })
})

describe('CameraPlayer', () => {
  it('renders without crashing', () => {
    useCameraStore.setState((s) => ({
      ...s,
      startStream: vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
      stopStream: vi.fn().mockResolvedValue(undefined),
    }))
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays camera name in the header', () => {
    useCameraStore.setState((s) => ({
      ...s,
      startStream: vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
      stopStream: vi.fn().mockResolvedValue(undefined),
    }))
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('South Gate')).toBeInTheDocument()
  })

  it('shows "Connecting to stream..." loading text', () => {
    useCameraStore.setState((s) => ({
      ...s,
      startStream: vi.fn().mockReturnValue(new Promise(() => undefined)),
      stopStream: vi.fn().mockResolvedValue(undefined),
    }))
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText(/connecting to stream/i)).toBeInTheDocument()
  })

  it('renders the Close button', () => {
    useCameraStore.setState((s) => ({
      ...s,
      startStream: vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
      stopStream: vi.fn().mockResolvedValue(undefined),
    }))
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('calls onClose when Close button is clicked', () => {
    const onClose = vi.fn()
    useCameraStore.setState((s) => ({
      ...s,
      startStream: vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
      stopStream: vi.fn().mockResolvedValue(undefined),
    }))
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('uses cameraId as fallback title when camera not in store', () => {
    useCameraStore.setState((s) => ({
      ...s,
      cameras: [],
      startStream: vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
      stopStream: vi.fn().mockResolvedValue(undefined),
    }))
    render(<CameraPlayer cameraId="cam-999" onClose={vi.fn()} />)
    expect(screen.getByText('cam-999')).toBeInTheDocument()
  })
})
