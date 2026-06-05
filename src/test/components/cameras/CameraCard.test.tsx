import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Gate Camera Alpha',
  manufacturer: 'Hikvision',
  model: 'DS-2CD2T47G2',
  siteId: 'SITE-01',
  location: 'North Gate',
  status: 'ONLINE',
  lastSeenAt: '2026-06-05T10:00:00.000Z',
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-05T10:00:00.000Z',
}

const defaultProps = {
  camera: mockCamera,
  onSelect: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onTest: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('Gate Camera Alpha')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('renders manufacturer', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })

  it('renders model', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('DS-2CD2T47G2')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders Last seen row when lastSeenAt is set', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('Last seen')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText(/Live/i))
    expect(defaultProps.onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest with camera id when Test button clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Test'))
    expect(defaultProps.onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit with camera object when Edit button clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onDelete with camera id after confirm dialog when Delete clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(defaultProps.onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('does NOT call onDelete when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(defaultProps.onDelete).not.toHaveBeenCalled()
  })

  it('shows reachable test result in green', () => {
    render(
      <CameraCard
        {...defaultProps}
        testResult={{ reachable: true, latency_ms: 12, message: 'OK' }}
      />,
    )
    expect(screen.getByText(/Reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/12 ms/i)).toBeInTheDocument()
  })

  it('shows unreachable test result in red with message', () => {
    render(
      <CameraCard
        {...defaultProps}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />,
    )
    expect(screen.getByText(/Connection refused/i)).toBeInTheDocument()
  })

  it('hides test result section when testResult prop is absent', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.queryByText(/Reachable/i)).not.toBeInTheDocument()
  })

  it('omits manufacturer row when manufacturer is null', () => {
    render(
      <CameraCard
        {...defaultProps}
        camera={{ ...mockCamera, manufacturer: null }}
      />,
    )
    expect(screen.queryByText('Manufacturer')).not.toBeInTheDocument()
  })

  it('omits model row when model is null', () => {
    render(
      <CameraCard
        {...defaultProps}
        camera={{ ...mockCamera, model: null }}
      />,
    )
    expect(screen.queryByText('Model')).not.toBeInTheDocument()
  })
})
