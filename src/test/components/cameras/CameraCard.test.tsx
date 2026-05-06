import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const camera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera',
  manufacturer: 'Axis',
  model:        'P3245',
  siteId:       'site-a',
  location:     'North Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-05-01T12:00:00Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00Z',
  updatedAt:    '2026-01-01T00:00:00Z',
}

const noop = vi.fn()

beforeEach(() => { vi.clearAllMocks() })

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })

  it('renders location', () => {
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('renders manufacturer', () => {
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Axis')).toBeInTheDocument()
  })

  it('renders model', () => {
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('P3245')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('calls onSelect when Live button is clicked', () => {
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    fireEvent.click(screen.getByText('▶ Live'))
    expect(noop).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<CameraCard camera={camera} onSelect={noop} onEdit={onEdit} onDelete={noop} onTest={noop} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(camera)
  })

  it('calls onTest when Test button is clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onDelete after confirm dialog when Delete is clicked', () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={onDelete} onTest={noop} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('does NOT call onDelete when confirm is cancelled', () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<CameraCard camera={camera} onSelect={noop} onEdit={noop} onDelete={onDelete} onTest={noop} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows test result when provided', () => {
    render(
      <CameraCard
        camera={camera}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
        onTest={noop}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />,
    )
    expect(screen.getByText(/42 ms/)).toBeInTheDocument()
  })

  it('shows failure message in test result', () => {
    render(
      <CameraCard
        camera={camera}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
        onTest={noop}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />,
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })
})
