import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock child modals/player so we test CameraGrid in isolation
vi.mock('@/components/cameras/CameraPlayer', () => ({
  CameraPlayer: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="camera-player"><button onClick={onClose}>Close Player</button></div>
  ),
}))
vi.mock('@/components/cameras/CameraFormModal', () => ({
  CameraFormModal: ({ onClose, mode }: { onClose: () => void; mode: string }) => (
    <div data-testid="camera-form-modal">
      <span>{mode === 'add' ? 'Add Camera Form' : 'Edit Camera Form'}</span>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}))

function makeCamera(id: string, name: string): Camera {
  return {
    id, name,
    manufacturer: 'Axis', model: 'P3245',
    siteId: 'SITE-01', location: 'Gate A',
    status: 'ONLINE', lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

const defaultStore = {
  cameras: [] as Camera[],
  total: 0, page: 1, loading: false, error: null,
  selectedId: null, streamUrls: {}, testResults: {},
  filterStatus: '' as const, filterSiteId: '',
  loadCameras: vi.fn().mockResolvedValue(undefined),
  addCamera: vi.fn().mockResolvedValue(makeCamera('new-001', 'New Cam')),
  editCamera: vi.fn().mockResolvedValue(makeCamera('cam-001', 'Updated')),
  removeCamera: vi.fn().mockResolvedValue(undefined),
  testCamera: vi.fn().mockResolvedValue(undefined),
  selectCamera: vi.fn(),
  startStream: vi.fn().mockResolvedValue('http://example.com/stream.m3u8'),
  stopStream: vi.fn().mockResolvedValue(undefined),
  setFilterStatus: vi.fn(),
  setFilterSiteId: vi.fn(),
}

beforeEach(() => {
  useCameraStore.setState(defaultStore as any)
  vi.clearAllMocks()
})

describe('CameraGrid', () => {
  it('renders the Cameras heading', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('calls loadCameras on mount', () => {
    render(<CameraGrid />)
    expect(defaultStore.loadCameras).toHaveBeenCalled()
  })

  it('shows "No cameras found" when camera list is empty', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/No cameras found/i)).toBeInTheDocument()
  })

  it('renders camera cards when cameras are in the store', () => {
    useCameraStore.setState({
      ...defaultStore,
      cameras: [makeCamera('cam-001', 'Front Gate'), makeCamera('cam-002', 'Rear Gate')],
      total: 2,
    } as any)
    render(<CameraGrid />)
    expect(screen.getByText('Front Gate')).toBeInTheDocument()
    expect(screen.getByText('Rear Gate')).toBeInTheDocument()
  })

  it('renders loading skeletons when loading with no cameras', () => {
    useCameraStore.setState({ ...defaultStore, loading: true, cameras: [] } as any)
    const { container } = render(<CameraGrid />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows error message when error is set', () => {
    useCameraStore.setState({ ...defaultStore, error: 'API unreachable' } as any)
    render(<CameraGrid />)
    expect(screen.getByText('API unreachable')).toBeInTheDocument()
  })

  it('opens Add Camera modal when "+ Add Camera" is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    expect(screen.getByTestId('camera-form-modal')).toBeInTheDocument()
    expect(screen.getByText('Add Camera Form')).toBeInTheDocument()
  })

  it('closes Add Camera modal when modal fires onClose', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('+ Add Camera'))
    fireEvent.click(screen.getByText('Close Modal'))
    expect(screen.queryByTestId('camera-form-modal')).not.toBeInTheDocument()
  })

  it('shows CameraPlayer when selectedId is set in the store', () => {
    useCameraStore.setState({
      ...defaultStore,
      selectedId: 'cam-001',
      cameras: [makeCamera('cam-001', 'Front Gate')],
    } as any)
    render(<CameraGrid />)
    expect(screen.getByTestId('camera-player')).toBeInTheDocument()
  })

  it('calls setFilterStatus and loadCameras when status filter changes', () => {
    render(<CameraGrid />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'ONLINE' } })
    expect(defaultStore.setFilterStatus).toHaveBeenCalledWith('ONLINE')
    expect(defaultStore.loadCameras).toHaveBeenCalled()
  })

  it('calls setFilterSiteId when site filter input changes', () => {
    render(<CameraGrid />)
    const input = screen.getByPlaceholderText('Site ID…')
    fireEvent.change(input, { target: { value: 'SITE-02' } })
    expect(defaultStore.setFilterSiteId).toHaveBeenCalledWith('SITE-02')
  })

  it('calls loadCameras when Refresh is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByText('↺ Refresh'))
    expect(defaultStore.loadCameras).toHaveBeenCalledTimes(2) // once on mount, once on click
  })
})
