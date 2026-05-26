import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraPlayer } from '@/components/cameras/CameraPlayer'
import { useCameraStore } from '@/store/cameraStore'

vi.mock('hls.js', () => ({
  default: {
    isSupported: vi.fn(() => false),
    Events: { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' },
  },
}))

beforeEach(() => {
  useCameraStore.setState({
    cameras:     [{ id: 'cam-001', name: 'Gate Camera 1', manufacturer: null, model: null, siteId: null, location: null, status: 'ONLINE', lastSeenAt: null, createdBy: 'admin', createdAt: '', updatedAt: '' }],
    streamUrls:  {},
    testResults: {},
    loading:     false,
    error:       null,
    selectedId:  null,
    total:       1,
    page:        1,
    filterStatus: '',
    filterSiteId: '',
  })
  vi.spyOn(useCameraStore.getState(), 'startStream').mockResolvedValue('http://localhost:3001/hls/cam-001.m3u8')
  vi.spyOn(useCameraStore.getState(), 'stopStream').mockResolvedValue(undefined)
})

describe('CameraPlayer', () => {
  it('renders without throwing', () => {
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the camera name in the header', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText('Gate Camera 1')).toBeInTheDocument()
  })

  it('shows a Close button', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders a video element', () => {
    const { container } = render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(container.querySelector('video')).toBeInTheDocument()
  })

  it('shows connecting status initially', () => {
    render(<CameraPlayer cameraId="cam-001" onClose={vi.fn()} />)
    expect(screen.getByText(/connecting/i)).toBeInTheDocument()
  })

  it('shows camera id when name is not found', () => {
    useCameraStore.setState({ cameras: [] })
    render(<CameraPlayer cameraId="cam-unknown" onClose={vi.fn()} />)
    expect(screen.getByText('cam-unknown')).toBeInTheDocument()
  })
})
