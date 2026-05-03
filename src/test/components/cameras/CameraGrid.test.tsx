import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

function mockCamera(id: string, name: string, overrides: Partial<Camera> = {}): Camera {
  return {
    id,
    name,
    manufacturer: 'Axis',
    model: 'P3245',
    siteId: 'SITE-01',
    location: 'Test location',
    status: 'ONLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    ...overrides,
  }
}

const baseState = {
  cameras: [] as Camera[],
  total: 0,
  page: 1,
  loading: false,
  error: null,
  selectedId: null as string | null,
  streamUrls: {} as Record<string, string>,
  testResults: {} as Record<string, { reachable: boolean; latency_ms: number | null; message: string }>,
  filterStatus: '' as const,
  filterSiteId: '',
}

beforeEach(() => {
  useCameraStore.setState({
    ...baseState,
    loadCameras: vi.fn().mockResolvedValue(undefined),
    addCamera: vi.fn(),
    editCamera: vi.fn(),
    removeCamera: vi.fn().mockResolvedValue(undefined),
    testCamera: vi.fn().mockResolvedValue(undefined),
    selectCamera: vi.fn(),
    startStream: vi.fn().mockResolvedValue('http://localhost/s.m3u8'),
    stopStream: vi.fn().mockResolvedValue(undefined),
    setFilterStatus: vi.fn(),
    setFilterSiteId: vi.fn(),
  })
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows "No cameras found" empty state when list is empty', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/no cameras found/i)).toBeInTheDocument()
  })

  it('displays camera count in heading', async () => {
    useCameraStore.setState((s) => ({ ...s, total: 5 }))
    render(<CameraGrid />)
    await waitFor(() => {
      expect(screen.getByText('(5)')).toBeInTheDocument()
    })
  })

  it('renders camera cards when cameras are present', () => {
    useCameraStore.setState((s) => ({
      ...s,
      cameras: [
        mockCamera('c1', 'East Gate'),
        mockCamera('c2', 'West Gate'),
      ],
      total: 2,
    }))
    render(<CameraGrid />)
    expect(screen.getByText('East Gate')).toBeInTheDocument()
    expect(screen.getByText('West Gate')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading with empty list', () => {
    useCameraStore.setState((s) => ({ ...s, loading: true, cameras: [] }))
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays error message when error is set', () => {
    useCameraStore.setState((s) => ({ ...s, error: 'Network failure' }))
    render(<CameraGrid />)
    expect(screen.getByText('Network failure')).toBeInTheDocument()
  })

  it('shows "Add Camera" button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /add camera/i })).toBeInTheDocument()
  })

  it('opens add camera modal when "Add Camera" is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))
    // Modal heading
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('renders status filter dropdown', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('calls loadCameras on initial render', () => {
    const loadCameras = vi.fn().mockResolvedValue(undefined)
    useCameraStore.setState((s) => ({ ...s, loadCameras }))
    render(<CameraGrid />)
    expect(loadCameras).toHaveBeenCalledOnce()
  })

  it('shows Refresh button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('does not show pagination when total ≤ 24', () => {
    useCameraStore.setState((s) => ({ ...s, total: 10 }))
    render(<CameraGrid />)
    expect(screen.queryByRole('button', { name: /prev/i })).not.toBeInTheDocument()
  })
})
