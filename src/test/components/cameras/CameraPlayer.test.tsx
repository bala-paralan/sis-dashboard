import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('hls.js', () => {
  const Hls = vi.fn().mockImplementation(() => ({
    loadSource:   vi.fn(),
    attachMedia:  vi.fn(),
    destroy:      vi.fn(),
    on:           vi.fn(),
  }))
  ;(Hls as any).isSupported = vi.fn().mockReturnValue(false)
  ;(Hls as any).Events = { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' }
  return { default: Hls }
})

function mockCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Alpha',
    manufacturer: null,
    model:        null,
    siteId:       null,
    location:     null,
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras:    [mockCamera()],
    streamUrls: {},
    startStream: vi.fn().mockResolvedValue('http://x/stream.m3u8'),
    stopStream:  vi.fn().mockResolvedValue(undefined),
  } as any)
})

describe('CameraPlayer', () => {
  it('renders without crashing', () => {
    expect(() => render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)).not.toThrow()
  })

  it('shows camera name in header', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
  })

  it('shows cameraId as fallback when camera not in list', () => {
    render(<CameraPlayer cameraId="cam-999" onClose={vi.fn()} />)
    expect(screen.getByText('cam-999')).toBeInTheDocument()
  })

  it('shows Close button', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText(/Close/)).toBeInTheDocument()
  })

  it('calls onClose when Close button is clicked', () => {
    const onClose = vi.fn()
    render(<CameraPlayer cameraId="cam-001" onClose={onClose} />)
    fireEvent.click(screen.getByText(/Close/))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders video element in the player', () => {
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(container.querySelector('video')).toBeInTheDocument()
  })

  it('shows "Connecting to stream" while loading', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText(/Connecting to stream/i)).toBeInTheDocument()
  })

  it('shows error message when startStream rejects', async () => {
    useCameraStore.setState({
      startStream: vi.fn().mockRejectedValue(new Error('Stream unavailable')),
    } as any)
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    await vi.waitFor(() => {
      expect(screen.getByText('Stream unavailable')).toBeInTheDocument()
    })
  })

  it('skips startStream when URL already in streamUrls', () => {
    const startStream = vi.fn().mockResolvedValue('http://x/new.m3u8')
    useCameraStore.setState({
      streamUrls: { 'cam-001': 'http://x/existing.m3u8' },
      startStream,
    } as any)
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(startStream).not.toHaveBeenCalled()
  })
})
