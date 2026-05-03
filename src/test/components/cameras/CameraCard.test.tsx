import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function mockCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id: 'cam-001',
    name: 'Gate A Camera',
    manufacturer: 'Hikvision',
    model: 'DS-2CD2143G2-I',
    siteId: 'SITE-01',
    location: 'Main Gate',
    status: 'ONLINE',
    lastSeenAt: '2026-05-03T10:00:00Z',
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-03T10:00:00Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  it('renders without crashing', () => {
    const cam = mockCamera()
    const { container } = render(
      <CameraCard camera={cam} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays camera name', () => {
    render(<CameraCard camera={mockCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Gate A Camera')).toBeInTheDocument()
  })

  it('displays camera location', () => {
    render(<CameraCard camera={mockCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('displays manufacturer and model', () => {
    render(<CameraCard camera={mockCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2143G2-I')).toBeInTheDocument()
  })

  it('shows the ONLINE status badge', () => {
    render(<CameraCard camera={mockCamera({ status: 'ONLINE' })} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('shows the OFFLINE status badge', () => {
    render(<CameraCard camera={mockCamera({ status: 'OFFLINE' })} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('calls onSelect when Live button clicked', () => {
    const onSelect = vi.fn()
    render(<CameraCard camera={mockCamera()} onSelect={onSelect} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /live/i }))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest when Test button clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={mockCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /test/i }))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button clicked', () => {
    const onEdit = vi.fn()
    const cam = mockCamera()
    render(<CameraCard camera={cam} onSelect={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} onTest={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('shows reachable testResult', () => {
    render(
      <CameraCard
        camera={mockCamera()}
        onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />
    )
    expect(screen.getByText(/42 ms/)).toBeInTheDocument()
  })

  it('shows unreachable testResult message', () => {
    render(
      <CameraCard
        camera={mockCamera()}
        onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })

  it('does not show testResult section when not provided', () => {
    render(<CameraCard camera={mockCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.queryByText(/Reachable/)).not.toBeInTheDocument()
  })

  it('does not show location when null', () => {
    render(<CameraCard camera={mockCamera({ location: null })} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.queryByText('Main Gate')).not.toBeInTheDocument()
  })
})
