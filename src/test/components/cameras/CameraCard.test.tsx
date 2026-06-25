import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const baseCamera: Camera = {
  id: 'cam-001',
  name: 'Gate Camera',
  status: 'ONLINE',
  rtspUrl: 'rtsp://example.com/stream',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  manufacturer: 'Acme',
  model: 'X100',
  location: 'Main Gate',
  siteId: 'BOP-ALPHA-01',
  lastSeenAt: '2024-06-01T12:00:00Z',
}

describe('CameraCard', () => {
  const onSelect = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onTest = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    global.confirm = vi.fn(() => true)
  })

  it('renders the camera name', () => {
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })

  it('renders the location', () => {
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('shows the status badge', () => {
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('shows manufacturer and model', () => {
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('X100')).toBeInTheDocument()
  })

  it('calls onSelect when Live button is clicked', () => {
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('▶ Live'))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button is clicked', () => {
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(baseCamera)
  })

  it('calls onTest when Test button is clicked', () => {
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onDelete after confirming', () => {
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('does not call onDelete when confirm is cancelled', () => {
    global.confirm = vi.fn(() => false)
    render(<CameraCard camera={baseCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows reachable test result', () => {
    render(
      <CameraCard
        camera={baseCamera}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable.*42 ms/)).toBeInTheDocument()
  })

  it('shows unreachable test result', () => {
    render(
      <CameraCard
        camera={baseCamera}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })
})
