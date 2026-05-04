import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraGrid } from '@/components/cameras/CameraGrid'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('@/store/cameraStore', () => ({ useCameraStore: vi.fn() }))
vi.mock('@/components/cameras/CameraPlayer', () => ({
  CameraPlayer: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="camera-player">
      <button onClick={onClose}>Close Player</button>
    </div>
  ),
}))

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Cam',
  manufacturer: 'Axis',
  model:        'P3245',
  siteId:       'site-alpha',
  location:     'Gate A',
  status:       'ONLINE',
  lastSeenAt:   null,
  createdBy:    'user-001',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-01-01T00:00:00.000Z',
}

const loadCameras    = vi.fn().mockResolvedValue(undefined)
const addCamera      = vi.fn().mockResolvedValue(mockCamera)
const editCamera     = vi.fn().mockResolvedValue(mockCamera)
const removeCamera   = vi.fn().mockResolvedValue(undefined)
const testCamera     = vi.fn().mockResolvedValue(undefined)
const selectCamera   = vi.fn()
const setFilterStatus = vi.fn()
const setFilterSiteId = vi.fn()

function setupStore(overrides?: {
  cameras?: Camera[]
  loading?: boolean
  error?: string | null
  selectedId?: string | null
  total?: number
}) {
  const state = {
    cameras:      overrides?.cameras     ?? [],
    total:        overrides?.total       ?? 0,
    page:         1,
    loading:      overrides?.loading     ?? false,
    error:        overrides?.error       ?? null,
    selectedId:   overrides?.selectedId  ?? null,
    testResults:  {},
    filterStatus: '',
    filterSiteId: '',
    loadCameras,
    addCamera,
    editCamera,
    removeCamera,
    testCamera,
    selectCamera,
    setFilterStatus,
    setFilterSiteId,
  }
  // CameraGrid calls useCameraStore() with no selector — return full state
  vi.mocked(useCameraStore).mockReturnValue(state as ReturnType<typeof useCameraStore>)
}

beforeEach(() => {
  vi.clearAllMocks()
  setupStore()
})

describe('CameraGrid', () => {
  describe('loading state', () => {
    it('renders skeleton cards when loading with no cameras', () => {
      setupStore({ loading: true, cameras: [] })
      const { container } = render(<CameraGrid />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('empty state', () => {
    it('renders "No cameras found" when not loading and cameras is empty', () => {
      setupStore({ loading: false, cameras: [] })
      render(<CameraGrid />)
      expect(screen.getByText(/no cameras found/i)).toBeInTheDocument()
    })
  })

  describe('camera grid', () => {
    it('renders a card for each camera', () => {
      const cam2 = { ...mockCamera, id: 'cam-002', name: 'Back Door Cam' }
      setupStore({ cameras: [mockCamera, cam2] })
      render(<CameraGrid />)
      expect(screen.getByText('Gate Cam')).toBeInTheDocument()
      expect(screen.getByText('Back Door Cam')).toBeInTheDocument()
    })

    it('shows total count in heading', () => {
      setupStore({ cameras: [mockCamera], total: 1 })
      render(<CameraGrid />)
      expect(screen.getByText('(1)')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('displays error message when error is set', () => {
      setupStore({ error: 'Failed to load cameras' })
      render(<CameraGrid />)
      expect(screen.getByText(/failed to load cameras/i)).toBeInTheDocument()
    })
  })

  describe('toolbar', () => {
    it('renders Add Camera button', () => {
      render(<CameraGrid />)
      expect(screen.getByRole('button', { name: /\+ add camera/i })).toBeInTheDocument()
    })

    it('opens add modal when Add Camera is clicked', () => {
      render(<CameraGrid />)
      fireEvent.click(screen.getByRole('button', { name: /\+ add camera/i }))
      expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
    })

    it('renders Refresh button', () => {
      render(<CameraGrid />)
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })

    it('calls loadCameras when Refresh is clicked', async () => {
      render(<CameraGrid />)
      fireEvent.click(screen.getByRole('button', { name: /refresh/i }))
      await waitFor(() => {
        expect(loadCameras).toHaveBeenCalled()
      })
    })

    it('renders status filter select', () => {
      render(<CameraGrid />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('calls setFilterStatus when status filter changes', async () => {
      render(<CameraGrid />)
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ONLINE' } })
      await waitFor(() => {
        expect(setFilterStatus).toHaveBeenCalledWith('ONLINE')
      })
    })
  })

  describe('camera player', () => {
    it('renders CameraPlayer when a camera is selected', () => {
      setupStore({ cameras: [mockCamera], selectedId: 'cam-001' })
      render(<CameraGrid />)
      expect(screen.getByTestId('camera-player')).toBeInTheDocument()
    })

    it('calls selectCamera(null) when player is closed', () => {
      setupStore({ cameras: [mockCamera], selectedId: 'cam-001' })
      render(<CameraGrid />)
      fireEvent.click(screen.getByRole('button', { name: /close player/i }))
      expect(selectCamera).toHaveBeenCalledWith(null)
    })
  })

  describe('on mount', () => {
    it('calls loadCameras on mount', () => {
      render(<CameraGrid />)
      expect(loadCameras).toHaveBeenCalled()
    })
  })
})
