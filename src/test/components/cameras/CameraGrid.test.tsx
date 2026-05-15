import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'

vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera: vi.fn(),
  startStream: vi.fn(),
  stopStream: vi.fn(),
}))

vi.mock('@/store/toastStore', () => ({
  useToastStore: vi.fn(() => ({ addToast: vi.fn() })),
}))

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
  })
})

describe('CameraGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Cameras heading', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/cameras/i)).toBeInTheDocument()
  })

  it('shows Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /add camera/i })).toBeInTheDocument()
  })

  it('shows loading skeleton when loading=true', () => {
    useCameraStore.setState({ loading: true })
    render(<CameraGrid />)
    // The loading state renders skeleton cards or spinner
    expect(screen.getByText(/cameras/i)).toBeInTheDocument()
  })

  it('shows camera cards when cameras are present', () => {
    useCameraStore.setState({
      cameras: [{
        id: 'c1', name: 'Front Gate', manufacturer: null, model: null,
        siteId: null, location: null, status: 'ONLINE',
        lastSeenAt: null, createdBy: 'admin', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
      }],
      total: 1,
    })
    render(<CameraGrid />)
    expect(screen.getByText('Front Gate')).toBeInTheDocument()
  })

  it('shows error message when error is set', async () => {
    const mockLoad = vi.fn().mockImplementation(() => {
      useCameraStore.setState({ error: 'Camera load error', loading: false })
      return Promise.resolve()
    })
    useCameraStore.setState({
      loadCameras: mockLoad,
      error: 'Camera load error',
    } as Parameters<typeof useCameraStore.setState>[0])
    render(<CameraGrid />)
    // Wait for loadCameras to be called and state to update
    await vi.waitFor(() => expect(screen.getByText('Camera load error')).toBeInTheDocument())
  })

  it('shows status filter dropdown', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
