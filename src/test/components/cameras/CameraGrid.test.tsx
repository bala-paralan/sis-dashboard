import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

const makeCamera = (id: string, name: string): Camera => ({
  id,
  name,
  status: 'ONLINE',
  rtspUrl: 'rtsp://example.com/stream',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
})

describe('CameraGrid', () => {
  beforeEach(() => {
    useCameraStore.setState({
      cameras: [],
      total: 0,
      page: 1,
      loading: false,
      error: null,
      selectedId: null,
      streamUrls: {},
      testResults: {},
      filterStatus: '',
      filterSiteId: '',
      loadCameras: vi.fn().mockResolvedValue(undefined),
      addCamera: vi.fn().mockResolvedValue(undefined),
      editCamera: vi.fn().mockResolvedValue(undefined),
      removeCamera: vi.fn().mockResolvedValue(undefined),
      testCamera: vi.fn().mockResolvedValue(undefined),
      selectCamera: vi.fn(),
      startStream: vi.fn().mockResolvedValue('http://stream'),
      stopStream: vi.fn().mockResolvedValue(undefined),
      setFilterStatus: vi.fn(),
      setFilterSiteId: vi.fn(),
    })
    global.confirm = vi.fn(() => true)
  })

  it('shows the heading with total count', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/Cameras/)).toBeInTheDocument()
  })

  it('shows empty-state message when no cameras', () => {
    render(<CameraGrid />)
    expect(screen.getByText('No cameras found')).toBeInTheDocument()
  })

  it('renders camera cards when cameras are present', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c1', 'Alpha'), makeCamera('c2', 'Beta')],
      total: 2,
    })
    render(<CameraGrid />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows error message when error state is set', () => {
    useCameraStore.setState({ error: 'Network failure' })
    render(<CameraGrid />)
    expect(screen.getByText('Network failure')).toBeInTheDocument()
  })

  it('shows loading skeletons when loading with no cameras', () => {
    useCameraStore.setState({ loading: true, cameras: [] })
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('does not show pagination when total ≤ 24', () => {
    useCameraStore.setState({ total: 10, cameras: [makeCamera('c1', 'Alpha')] })
    render(<CameraGrid />)
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
  })

  it('shows pagination when total > 24', () => {
    const manyCameras = Array.from({ length: 24 }, (_, i) => makeCamera(`c${i}`, `Cam ${i}`))
    useCameraStore.setState({ total: 50, cameras: manyCameras, page: 1 })
    render(<CameraGrid />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('renders Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByText('+ Add Camera')).toBeInTheDocument()
  })

  it('renders status filter select', () => {
    render(<CameraGrid />)
    expect(screen.getByText('All statuses')).toBeInTheDocument()
  })
})
