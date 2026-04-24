import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('@/api/cameras')

const noop = vi.fn().mockResolvedValue(undefined)

const makeCamera = (id: string, name: string): Camera => ({
  id,
  name,
  manufacturer: null,
  model:        null,
  siteId:       null,
  location:     null,
  status:       'ONLINE',
  lastSeenAt:   null,
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-01-01T00:00:00.000Z',
})

beforeEach(() => {
  vi.clearAllMocks()
  // Always stub loadCameras so the effect doesn't modify state unpredictably
  useCameraStore.setState({
    cameras: [], total: 0, page: 1, loading: false,
    error: null, selectedId: null, streamUrls: {},
    testResults: {}, filterStatus: '', filterSiteId: '',
    loadCameras:  noop,
    addCamera:    noop,
    editCamera:   noop,
    removeCamera: noop,
    testCamera:   noop,
    selectCamera: vi.fn(),
    startStream:  noop,
    stopStream:   noop,
    setFilterStatus: vi.fn(),
    setFilterSiteId: vi.fn(),
  })
})

describe('CameraGrid', () => {
  it('renders "No cameras found" when list is empty and not loading', () => {
    render(<CameraGrid />)
    expect(screen.getByText('No cameras found')).toBeInTheDocument()
  })

  it('renders loading skeleton when loading and no cameras', () => {
    useCameraStore.setState({ loading: true })
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders camera cards when cameras are loaded', () => {
    useCameraStore.setState({
      loading:  false,
      cameras:  [makeCamera('c1', 'Alpha'), makeCamera('c2', 'Bravo')],
      total:    2,
    })
    render(<CameraGrid />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Bravo')).toBeInTheDocument()
  })

  it('renders Cameras total count', () => {
    useCameraStore.setState({ cameras: [makeCamera('c1', 'Alpha')], total: 1 })
    render(<CameraGrid />)
    expect(screen.getByText('(1)')).toBeInTheDocument()
  })

  it('renders error message when error is set', () => {
    useCameraStore.setState({ error: 'Backend offline', cameras: [] })
    render(<CameraGrid />)
    expect(screen.getByText('Backend offline')).toBeInTheDocument()
  })

  it('renders Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByText('+ Add Camera')).toBeInTheDocument()
  })

  it('opens add modal when Add Camera button is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('calls loadCameras on Refresh button click', async () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('↺ Refresh'))
    await waitFor(() => {
      expect(noop as Mock).toHaveBeenCalled()
    })
  })

  it('does not render pagination when total <= 24', () => {
    useCameraStore.setState({
      cameras: [makeCamera('c1', 'Alpha')],
      total: 1,
    })
    render(<CameraGrid />)
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
  })
})
