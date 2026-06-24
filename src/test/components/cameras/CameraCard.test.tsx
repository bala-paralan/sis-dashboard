import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate Camera',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2-L',
    siteId:       'site-01',
    location:     'Main Entrance',
    status:       'ONLINE',
    lastSeenAt:   '2026-04-24T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-04-24T10:00:00.000Z',
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
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('renders the camera name', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Front Gate Camera')).toBeInTheDocument()
  })

  it('renders the location when provided', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Main Entrance')).toBeInTheDocument()
  })

  it('does not render location element when location is null', () => {
    render(<CameraCard camera={makeCamera({ location: null })} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.queryByText('Main Entrance')).not.toBeInTheDocument()
  })

  it('renders manufacturer when provided', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })

  it('renders model when provided', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('DS-2CD2T47G2-L')).toBeInTheDocument()
  })

  it('renders status badge with ONLINE text', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('clicking Live button calls onSelect with camera id', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /live/i }))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('clicking Edit button calls onEdit with the camera object', () => {
    const cam = makeCamera()
    render(<CameraCard camera={cam} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('clicking Test button calls onTest with camera id', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /test/i }))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('clicking Delete and confirming calls onDelete with camera id', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('clicking Delete and cancelling does not call onDelete', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('renders reachable test result when testResult is provided', () => {
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
    expect(screen.getByText(/reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/42 ms/i)).toBeInTheDocument()
  })

  it('renders unreachable test result message when reachable is false', () => {
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
    expect(screen.getByText(/connection refused/i)).toBeInTheDocument()
  })

  it('does not render test result section when testResult is undefined', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.queryByText(/reachable/i)).not.toBeInTheDocument()
  })

  it('renders last-seen date when lastSeenAt is provided', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Last seen')).toBeInTheDocument()
  })

  it('renders OFFLINE status badge correctly', () => {
    render(<CameraCard camera={makeCamera({ status: 'OFFLINE' })} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })
})
