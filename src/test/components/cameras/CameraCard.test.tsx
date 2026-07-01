import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id: 'cam-001',
    name: 'Gate Camera',
    manufacturer: 'Axis',
    model: 'P3245',
    siteId: 'SITE-01',
    location: 'North Gate',
    status: 'ONLINE',
    lastSeenAt: '2026-07-01T10:00:00.000Z',
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  const onSelect = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onTest = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders camera name', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })

  it('renders location when provided', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Axis')).toBeInTheDocument()
    expect(screen.getByText('P3245')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('calls onSelect when Live button is clicked', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('▶ Live'))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button is clicked', () => {
    const cam = makeCamera()
    render(<CameraCard camera={cam} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('calls onTest when Test button is clicked', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onDelete after confirming the dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('does NOT call onDelete when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows a reachable test result', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable.*42 ms/i)).toBeInTheDocument()
  })

  it('shows an unreachable test result', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/i)).toBeInTheDocument()
  })

  it('does not render testResult section when testResult is undefined', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.queryByText(/Reachable/i)).not.toBeInTheDocument()
  })

  it('renders without optional fields gracefully', () => {
    const minimal = makeCamera({ manufacturer: null, model: null, location: null, lastSeenAt: null })
    expect(() =>
      render(<CameraCard camera={minimal} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    ).not.toThrow()
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })
})
