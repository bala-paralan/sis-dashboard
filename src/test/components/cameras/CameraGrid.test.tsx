import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock HLS.js (used by CameraPlayer which may be mounted)
vi.mock('hls.js', () => ({ default: class { static isSupported() { return false; } } }))

function makeCamera(id: string, overrides: Partial<Camera> = {}): Camera {
  return {
    id,
    name:         `Camera ${id}`,
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'site-a',
    location:     'Zone A',
    status:       'ONLINE',
    lastSeenAt:   '2026-06-01T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-06-01T10:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras:      [],
    total:        0,
    page:         1,
    loading:      false,
    error:        null,
    selectedId:   null,
    streamUrls:   {},
    testResults:  {},
    filterStatus: '',
    filterSiteId: '',
  })
  vi.clearAllMocks()
})

// Stub out async store actions so they don't make real network calls
const mockLoad = vi.fn().mockResolvedValue(undefined)

describe('CameraGrid', () => {
  beforeEach(() => {
    useCameraStore.setState({
      loadCameras: mockLoad,
    } as never)
  })

  it('calls loadCameras on mount', () => {
    render(<CameraGrid />)
    expect(mockLoad).toHaveBeenCalledTimes(1)
  })

  it('shows empty state message when no cameras and not loading', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/No cameras found/i)).toBeInTheDocument()
  })

  it('shows loading skeletons when loading and cameras empty', () => {
    useCameraStore.setState({ loading: true })
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders camera cards when cameras are present', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c-001'), makeCamera('c-002')],
      total:   2,
    })
    render(<CameraGrid />)
    expect(screen.getByText('Camera c-001')).toBeInTheDocument()
    expect(screen.getByText('Camera c-002')).toBeInTheDocument()
  })

  it('shows total count in heading', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c-001')],
      total:   1,
    })
    render(<CameraGrid />)
    expect(screen.getByText('(1)')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    useCameraStore.setState({ error: 'Network timeout' })
    render(<CameraGrid />)
    expect(screen.getByText(/Network timeout/i)).toBeInTheDocument()
  })

  it('renders Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('clicking Add Camera opens the form modal', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('does NOT show pagination when total <= 24', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c-001')],
      total:   5,
    })
    render(<CameraGrid />)
    expect(screen.queryByRole('button', { name: /Prev/i })).not.toBeInTheDocument()
  })

  it('shows pagination when total > 24', () => {
    const cameras = Array.from({ length: 24 }, (_, i) => makeCamera(`c-${i}`))
    useCameraStore.setState({ cameras, total: 25, page: 1 })
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /Prev/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
  })

  it('status filter select is rendered', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('site ID filter input is rendered', () => {
    render(<CameraGrid />)
    expect(screen.getByPlaceholderText(/Site ID/i)).toBeInTheDocument()
  })

  it('Refresh button triggers loadCameras', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }))
    // called once on mount + once on refresh
    expect(mockLoad).toHaveBeenCalledTimes(2)
  })
})
