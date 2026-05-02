import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera',
  manufacturer: 'Axis',
  model:        'P1448',
  siteId:       'site-a',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-01-01T10:00:00Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00Z',
  updatedAt:    '2026-01-01T00:00:00Z',
}

const defaultProps = {
  camera:   mockCamera,
  onSelect: vi.fn(),
  onEdit:   vi.fn(),
  onDelete: vi.fn(),
  onTest:   vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('renders manufacturer', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('Axis')).toBeInTheDocument()
  })

  it('renders model', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('P1448')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CameraCard {...defaultProps} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('calls onSelect when Live button is clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText(/Live/i))
    expect(defaultProps.onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button is clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onTest when Test button is clicked', () => {
    render(<CameraCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Test'))
    expect(defaultProps.onTest).toHaveBeenCalledWith('cam-001')
  })

  it('shows test result when reachable', () => {
    render(<CameraCard {...defaultProps} testResult={{ reachable: true, latency_ms: 12, message: 'OK' }} />)
    expect(screen.getByText(/Reachable/i)).toBeInTheDocument()
  })

  it('shows test result when not reachable', () => {
    render(<CameraCard {...defaultProps} testResult={{ reachable: false, latency_ms: null, message: 'Timeout' }} />)
    expect(screen.getByText(/Timeout/i)).toBeInTheDocument()
  })
})
