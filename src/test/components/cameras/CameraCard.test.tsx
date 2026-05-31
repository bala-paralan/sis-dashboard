import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Camera',
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'site-01',
    location:     'Main Gate',
    status:       'ONLINE',
    lastSeenAt:   '2026-01-01T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })

  it('renders camera location when present', () => {
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('renders manufacturer when present', () => {
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Axis')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button is clicked', () => {
    const onSelect = vi.fn()
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    fireEvent.click(screen.getByText(/Live/i))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest with camera id when Test button is clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit with the camera object when Edit button is clicked', () => {
    const onEdit = vi.fn()
    const cam = makeCamera()
    render(<CameraCard camera={cam} onSelect={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} onTest={vi.fn()} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('shows a reachable test result with latency', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/42/)).toBeInTheDocument()
  })

  it('shows an unreachable test result with message', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/i)).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<CameraCard camera={makeCamera({ status: 'DEGRADED' })} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('DEGRADED')).toBeInTheDocument()
  })
})
