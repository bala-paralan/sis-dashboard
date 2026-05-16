import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('@/store/cameraStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/cameraStore')>()
  return actual
})

vi.mock('@/components/cameras/CameraPlayer', () => ({
  CameraPlayer: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="camera-player">
      <button onClick={onClose}>Close Player</button>
    </div>
  ),
}))

function makeCamera(id: string, name: string): Camera {
  return {
    id, name,
    manufacturer: null, model: null, siteId: null, location: null,
    status: 'ONLINE', lastSeenAt: null,
    createdBy: 'admin', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  }
}

const mockLoad     = vi.fn().mockResolvedValue(undefined)
const mockAdd      = vi.fn().mockResolvedValue(makeCamera('c-new', 'New Cam'))
const mockRemove   = vi.fn().mockResolvedValue(undefined)
const mockTest     = vi.fn().mockResolvedValue(undefined)
const mockSelect   = vi.fn()
const mockSetFilterStatus = vi.fn()
const mockSetFilterSiteId = vi.fn()

function setStoreState(cameras: Camera[], extra: object = {}) {
  useCameraStore.setState({
    cameras,
    total:        cameras.length,
    page:         1,
    loading:      false,
    error:        null,
    selectedId:   null,
    streamUrls:   {},
    testResults:  {},
    filterStatus: '',
    filterSiteId: '',
    loadCameras:  mockLoad,
    addCamera:    mockAdd,
    editCamera:   vi.fn().mockResolvedValue(cameras[0]),
    removeCamera: mockRemove,
    testCamera:   mockTest,
    selectCamera: mockSelect,
    startStream:  vi.fn().mockResolvedValue(''),
    stopStream:   vi.fn().mockResolvedValue(undefined),
    setFilterStatus: mockSetFilterStatus,
    setFilterSiteId: mockSetFilterSiteId,
    ...extra,
  })
}

describe('CameraGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setStoreState([])
  })

  it('renders the Cameras heading', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /add camera/i })).toBeInTheDocument()
  })

  it('renders Refresh button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('shows empty state when no cameras', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/no cameras found/i)).toBeInTheDocument()
  })

  it('renders camera cards when cameras exist', () => {
    setStoreState([makeCamera('c1', 'Alpha Cam'), makeCamera('c2', 'Beta Cam')])
    render(<CameraGrid />)
    expect(screen.getByText('Alpha Cam')).toBeInTheDocument()
    expect(screen.getByText('Beta Cam')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    setStoreState([], { error: 'Network failure' })
    render(<CameraGrid />)
    expect(screen.getByText(/network failure/i)).toBeInTheDocument()
  })

  it('shows loading skeletons when loading and no cameras', () => {
    setStoreState([], { loading: true })
    const { container } = render(<CameraGrid />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('opens Add Camera modal on button click', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('calls loadCameras on mount', () => {
    render(<CameraGrid />)
    expect(mockLoad).toHaveBeenCalled()
  })

  it('calls loadCameras when Refresh is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }))
    expect(mockLoad).toHaveBeenCalledTimes(2)
  })

  it('opens CameraPlayer when camera is selected', () => {
    setStoreState([makeCamera('c1', 'Alpha Cam')], { selectedId: 'c1' })
    render(<CameraGrid />)
    expect(screen.getByTestId('camera-player')).toBeInTheDocument()
  })

  it('shows status filter select', () => {
    render(<CameraGrid />)
    expect(screen.getByDisplayValue(/all statuses/i)).toBeInTheDocument()
  })

  it('calls setFilterStatus when status filter changes', async () => {
    render(<CameraGrid />)
    const select = screen.getByDisplayValue(/all statuses/i)
    fireEvent.change(select, { target: { value: 'ONLINE' } })
    await waitFor(() => expect(mockSetFilterStatus).toHaveBeenCalledWith('ONLINE'))
  })

  it('does not show pagination when total <= 24', () => {
    setStoreState(Array.from({ length: 5 }, (_, i) => makeCamera(`c${i}`, `Cam ${i}`)))
    render(<CameraGrid />)
    expect(screen.queryByRole('button', { name: /prev/i })).not.toBeInTheDocument()
  })
})
