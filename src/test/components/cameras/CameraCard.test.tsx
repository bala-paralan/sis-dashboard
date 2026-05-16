import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-1',
    name:         'Gate Camera',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2',
    siteId:       'site-a',
    location:     'North Gate',
    status:       'ONLINE',
    lastSeenAt:   '2024-01-15T10:30:00Z',
    createdBy:    'admin',
    createdAt:    '2024-01-01T00:00:00Z',
    updatedAt:    '2024-01-15T10:30:00Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  const onSelect = vi.fn()
  const onEdit   = vi.fn()
  const onDelete = vi.fn()
  const onTest   = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', () => true)
  })

  it('renders camera name', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })

  it('renders location when present', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('renders manufacturer and model meta', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2143G2')).toBeInTheDocument()
  })

  it('does not render manufacturer row when null', () => {
    render(<CameraCard camera={makeCamera({ manufacturer: null })} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.queryByText('Hikvision')).not.toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('clicking Live button calls onSelect with camera id', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /live/i }))
    expect(onSelect).toHaveBeenCalledWith('cam-1')
  })

  it('clicking Edit button calls onEdit with camera object', () => {
    const cam = makeCamera()
    render(<CameraCard camera={cam} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('clicking Test button calls onTest with camera id', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /test/i }))
    expect(onTest).toHaveBeenCalledWith('cam-1')
  })

  it('clicking Delete calls onDelete after confirm', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('cam-1')
  })

  it('does not call onDelete when confirm is cancelled', () => {
    vi.stubGlobal('confirm', () => false)
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows reachable test result badge', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />
    )
    expect(screen.getByText(/reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/42 ms/i)).toBeInTheDocument()
  })

  it('shows unreachable test result badge', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/connection refused/i)).toBeInTheDocument()
  })

  it('does not render test result when not provided', () => {
    const { container } = render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(container.querySelector('.bg-green-900')).not.toBeInTheDocument()
    expect(container.querySelector('.bg-red-900')).not.toBeInTheDocument()
  })
})
