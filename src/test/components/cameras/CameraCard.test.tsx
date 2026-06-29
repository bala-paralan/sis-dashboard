import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Gate Alpha',
  manufacturer: 'Axis',
  model: 'P3245-V',
  siteId: 'SITE-01',
  location: 'North Perimeter',
  status: 'ONLINE',
  lastSeenAt: '2026-06-29T10:00:00.000Z',
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-29T10:00:00.000Z',
}

describe('CameraCard', () => {
  const onSelect = vi.fn()
  const onEdit   = vi.fn()
  const onDelete = vi.fn()
  const onTest   = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('renders camera name', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('North Perimeter')).toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Axis')).toBeInTheDocument()
    expect(screen.getByText('P3245-V')).toBeInTheDocument()
  })

  it('renders ONLINE status badge', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('calls onSelect when Live button clicked', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('▶ Live'))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button clicked', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onTest when Test button clicked', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onDelete after confirm when Delete clicked', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('shows reachable test result in green', () => {
    render(
      <CameraCard
        camera={mockCamera}
        onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest}
        testResult={{ reachable: true, latency_ms: 12, message: 'ok' }}
      />
    )
    expect(screen.getByText(/Reachable/)).toBeInTheDocument()
    expect(screen.getByText(/12 ms/)).toBeInTheDocument()
  })

  it('shows unreachable test result in red', () => {
    render(
      <CameraCard
        camera={mockCamera}
        onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })

  it('does not show test result when not provided', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.queryByText(/Reachable/)).not.toBeInTheDocument()
  })
})
