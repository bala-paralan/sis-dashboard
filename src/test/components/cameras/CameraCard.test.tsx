import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Gate A PTZ',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2-L',
    siteId:       'SITE-01',
    location:     'Main Gate',
    status:       'ONLINE',
    lastSeenAt:   '2026-04-11T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-04-11T10:00:00.000Z',
    ...overrides,
  }
}

const defaultProps = {
  onSelect: vi.fn(),
  onEdit:   vi.fn(),
  onDelete: vi.fn(),
  onTest:   vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraCard', () => {
  describe('rendering', () => {
    it('displays the camera name', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      expect(screen.getByText('Gate A PTZ')).toBeInTheDocument()
    })

    it('displays the location', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      expect(screen.getByText('Main Gate')).toBeInTheDocument()
    })

    it('displays manufacturer when present', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      expect(screen.getByText('Hikvision')).toBeInTheDocument()
    })

    it('displays model when present', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      expect(screen.getByText('DS-2CD2T47G2-L')).toBeInTheDocument()
    })

    it('omits manufacturer row when null', () => {
      render(<CameraCard camera={makeCamera({ manufacturer: null })} {...defaultProps} />)
      expect(screen.queryByText('Manufacturer')).not.toBeInTheDocument()
    })

    it('omits model row when null', () => {
      render(<CameraCard camera={makeCamera({ model: null })} {...defaultProps} />)
      expect(screen.queryByText('Model')).not.toBeInTheDocument()
    })

    it('omits location when null', () => {
      render(<CameraCard camera={makeCamera({ location: null })} {...defaultProps} />)
      // Name still shows; location paragraph should not
      expect(screen.queryByText('Main Gate')).not.toBeInTheDocument()
    })

    it('renders the status badge', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      expect(screen.getByText('ONLINE')).toBeInTheDocument()
    })

    it('renders Live, Test, Edit and Delete action buttons', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      expect(screen.getByRole('button', { name: /live/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })
  })

  describe('test result', () => {
    it('shows reachable result with latency', () => {
      render(
        <CameraCard
          camera={makeCamera()}
          {...defaultProps}
          testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
        />,
      )
      expect(screen.getByText(/reachable/i)).toBeInTheDocument()
      expect(screen.getByText(/42/)).toBeInTheDocument()
    })

    it('shows unreachable result with error message', () => {
      render(
        <CameraCard
          camera={makeCamera()}
          {...defaultProps}
          testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
        />,
      )
      expect(screen.getByText(/connection refused/i)).toBeInTheDocument()
    })

    it('hides test result when not provided', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      expect(screen.queryByText(/reachable/i)).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('calls onSelect with camera id when Live is clicked', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /live/i }))
      expect(defaultProps.onSelect).toHaveBeenCalledWith('cam-001')
    })

    it('calls onTest with camera id when Test is clicked', () => {
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /test/i }))
      expect(defaultProps.onTest).toHaveBeenCalledWith('cam-001')
    })

    it('calls onEdit with camera object when Edit is clicked', () => {
      const cam = makeCamera()
      render(<CameraCard camera={cam} {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /edit/i }))
      expect(defaultProps.onEdit).toHaveBeenCalledWith(cam)
    })

    it('calls onDelete when Delete is clicked and user confirms', () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /delete/i }))
      expect(defaultProps.onDelete).toHaveBeenCalledWith('cam-001')
      vi.unstubAllGlobals()
    })

    it('does not call onDelete when user cancels the confirm dialog', () => {
      vi.stubGlobal('confirm', vi.fn(() => false))
      render(<CameraCard camera={makeCamera()} {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /delete/i }))
      expect(defaultProps.onDelete).not.toHaveBeenCalled()
      vi.unstubAllGlobals()
    })
  })
})
