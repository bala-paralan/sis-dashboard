import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('hls.js', () => ({
  default: {
    isSupported: vi.fn(() => false),
    Events: { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' },
  },
}))

function makeCamera(id: string, name: string): Camera {
  return {
    id, name,
    manufacturer: null, model: null, siteId: null, location: null,
    status: 'ONLINE', lastSeenAt: null, createdBy: 'admin', createdAt: '', updatedAt: '',
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
  vi.spyOn(useCameraStore.getState(), 'loadCameras').mockResolvedValue(undefined)
})

describe('CameraGrid', () => {
  it('renders without throwing', () => {
    const { container } = render(<CameraGrid />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Cameras heading', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('heading', { name: /Cameras/i })).toBeInTheDocument()
  })

  it('shows Add Camera button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('shows Refresh button', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument()
  })

  it('shows status filter dropdown', () => {
    render(<CameraGrid />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders camera cards when cameras are in store', () => {
    useCameraStore.setState({
      cameras: [makeCamera('cam-001', 'Gate Camera 1'), makeCamera('cam-002', 'Gate Camera 2')],
      total: 2,
    })
    render(<CameraGrid />)
    expect(screen.getByText('Gate Camera 1')).toBeInTheDocument()
    expect(screen.getByText('Gate Camera 2')).toBeInTheDocument()
  })

  it('shows total count in heading', () => {
    useCameraStore.setState({ cameras: [], total: 5 })
    render(<CameraGrid />)
    // The heading renders as: Cameras <span>(5)</span>
    expect(screen.getByText('(5)')).toBeInTheDocument()
  })

  it('opens add camera modal when Add Camera is clicked', () => {
    render(<CameraGrid />)
    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))
    // After click the modal heading appears; use role to distinguish from the button
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('shows no cameras message when list is empty', () => {
    render(<CameraGrid />)
    expect(screen.getByText(/No cameras/i)).toBeInTheDocument()
  })

  it('shows pagination when total > cameras per page', () => {
    const cameras = Array.from({ length: 5 }, (_, i) => makeCamera(`cam-${i}`, `Camera ${i}`))
    useCameraStore.setState({ cameras, total: 30, page: 1 })
    render(<CameraGrid />)
    expect(screen.getByText(/Page 1/i)).toBeInTheDocument()
  })

  it('calls loadCameras on mount', async () => {
    const loadCameras = vi.spyOn(useCameraStore.getState(), 'loadCameras').mockResolvedValue(undefined)
    render(<CameraGrid />)
    await waitFor(() => {
      expect(loadCameras).toHaveBeenCalled()
    })
  })
})
