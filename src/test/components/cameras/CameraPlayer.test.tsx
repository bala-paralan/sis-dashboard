import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock hls.js — jsdom has no MediaSource
vi.mock('hls.js', () => ({
  default: class Hls {
    static isSupported = vi.fn(() => false)
    static Events = {}
    loadSource = vi.fn()
    attachMedia = vi.fn()
    on = vi.fn()
    destroy = vi.fn()
  },
}))

// Mock cameraStore to avoid real API calls
// CameraPlayer calls useCameraStore() without a selector, so we return the state object directly
vi.mock('@/store/cameraStore', () => ({
  useCameraStore: vi.fn().mockReturnValue({
    cameras:     [{ id: 'cam-1', name: 'Test Camera' }],
    streamUrls:  {},
    startStream: vi.fn().mockResolvedValue('http://localhost/stream.m3u8'),
    stopStream:  vi.fn().mockResolvedValue(undefined),
  }),
}))

import { CameraPlayer } from '@/components/cameras/CameraPlayer'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraPlayer', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraPlayer cameraId="cam-1" onClose={vi.fn()} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the camera name in the header', () => {
    render(<CameraPlayer cameraId="cam-1" onClose={vi.fn()} />)
    expect(screen.getByText('Test Camera')).toBeInTheDocument()
  })

  it('renders the close button', () => {
    render(<CameraPlayer cameraId="cam-1" onClose={vi.fn()} />)
    expect(screen.getByText(/Close/i)).toBeInTheDocument()
  })

  it('renders the video element', () => {
    const { container } = render(<CameraPlayer cameraId="cam-1" onClose={vi.fn()} />)
    expect(container.querySelector('video')).toBeInTheDocument()
  })
})
