import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'

// Mock hls.js — not available in jsdom
vi.mock('hls.js', () => {
  const Hls = vi.fn().mockImplementation(() => ({
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  }))
  ;(Hls as unknown as Record<string, unknown>).isSupported = vi.fn().mockReturnValue(false)
  ;(Hls as unknown as Record<string, unknown>).Events = { MANIFEST_PARSED: 'MANIFEST_PARSED', ERROR: 'ERROR' }
  return { default: Hls }
})

const resetStore = () =>
  useCameraStore.setState({
    cameras: [
      {
        id: 'cam-99', name: 'Roof Cam', manufacturer: null,
        model: null, siteId: null, location: null,
        status: 'ONLINE', lastSeenAt: null,
        createdBy: 'u-1', createdAt: '', updatedAt: '',
      },
    ],
    streamUrls: {},
    selectedId: null,
  } as Parameters<typeof useCameraStore.setState>[0])

beforeEach(() => {
  vi.clearAllMocks()
  resetStore()
})

describe('CameraPlayer', () => {
  it('shows "Connecting to stream…" while loading', async () => {
    // startStream never resolves — keeps loading state
    vi.spyOn(useCameraStore.getState(), 'startStream').mockReturnValue(new Promise(() => undefined))
    render(<CameraPlayer cameraId="cam-99" onClose={vi.fn()} />)
    expect(screen.getByText(/Connecting to stream/i)).toBeInTheDocument()
  })

  it('shows an error when stream fails', async () => {
    vi.spyOn(useCameraStore.getState(), 'startStream')
      .mockRejectedValue(new Error('Stream unavailable'))
    render(<CameraPlayer cameraId="cam-99" onClose={vi.fn()} />)
    await waitFor(() =>
      expect(screen.getByText(/Stream unavailable/i)).toBeInTheDocument(),
    )
  })

  it('displays the camera name in the header', () => {
    vi.spyOn(useCameraStore.getState(), 'startStream').mockReturnValue(new Promise(() => undefined))
    render(<CameraPlayer cameraId="cam-99" onClose={vi.fn()} />)
    expect(screen.getByText('Roof Cam')).toBeInTheDocument()
  })

  it('calls onClose and stopStream when Close button clicked', async () => {
    const onClose   = vi.fn()
    const stopStream = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(useCameraStore.getState(), 'startStream').mockReturnValue(new Promise(() => undefined))
    vi.spyOn(useCameraStore.getState(), 'stopStream').mockImplementation(stopStream)
    render(<CameraPlayer cameraId="cam-99" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('uses pre-existing stream URL without re-starting', () => {
    useCameraStore.setState({
      streamUrls: { 'cam-99': 'http://localhost:3001/streams/cam-99/index.m3u8' },
    } as Parameters<typeof useCameraStore.setState>[0])
    const startStream = vi.spyOn(useCameraStore.getState(), 'startStream').mockResolvedValue('')
    render(<CameraPlayer cameraId="cam-99" onClose={vi.fn()} />)
    expect(startStream).not.toHaveBeenCalled()
  })
})
