import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Alpha',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2',
    siteId:       'ALPHA-01',
    location:     'Main Gate',
    status:       'ONLINE',
    lastSeenAt:   '2024-06-15T12:00:00Z',
    createdBy:    'admin',
    createdAt:    '2024-01-01T00:00:00Z',
    updatedAt:    '2024-06-15T12:00:00Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  const onSelect  = vi.fn()
  const onEdit    = vi.fn()
  const onDelete  = vi.fn()
  const onTest    = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('renders camera name', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
  })

  it('renders location', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2143G2')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button clicked', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText(/Live/))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit with camera when Edit button clicked', () => {
    const cam = makeCamera()
    render(<CameraCard camera={cam} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('calls onDelete after confirm when Delete button clicked', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('does not call onDelete when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('calls onTest with camera id when Test button clicked', () => {
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('shows reachable test result', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest}
        testResult={{ reachable: true, latency_ms: 12, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable/)).toBeInTheDocument()
    expect(screen.getByText(/12 ms/)).toBeInTheDocument()
  })

  it('shows unreachable test result', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest}
        testResult={{ reachable: false, latency_ms: null, message: 'Timed out' }}
      />
    )
    expect(screen.getByText(/Timed out/)).toBeInTheDocument()
  })
})
