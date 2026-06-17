import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-1',
  name: 'Perimeter Cam A',
  manufacturer: 'Hikvision',
  model: 'DS-2CD2T47G2',
  siteId: 'SITE-01',
  location: 'North Gate',
  status: 'ONLINE',
  lastSeenAt: '2026-06-17T10:00:00.000Z',
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-17T10:00:00.000Z',
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
})

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('Perimeter Cam A')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2T47G2')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button is clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('▶ Live'))
    expect(defaultProps.onSelect).toHaveBeenCalledWith('cam-1')
  })

  it('calls onEdit with the camera object when Edit button is clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onTest with camera id when Test button is clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Test'))
    expect(defaultProps.onTest).toHaveBeenCalledWith('cam-1')
  })

  it('calls onDelete when Delete is confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(defaultProps.onDelete).toHaveBeenCalledWith('cam-1')
  })

  it('does NOT call onDelete when Delete is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false)
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(defaultProps.onDelete).not.toHaveBeenCalled()
  })

  it('shows reachable test result', () => {
    render(
      <CameraCard
        {...defaultProps}
        testResult={{ reachable: true, latency_ms: 42, message: '' }}
      />,
    )
    expect(screen.getByText(/42 ms/)).toBeInTheDocument()
  })

  it('shows unreachable test result with message', () => {
    render(
      <CameraCard
        {...defaultProps}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />,
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })

  it('does not render test result when undefined', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.queryByText(/ms/)).not.toBeInTheDocument()
  })
})
