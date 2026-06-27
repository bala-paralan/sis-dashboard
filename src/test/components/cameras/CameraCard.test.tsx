import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-01',
  name:         'Gate Alpha',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2T47G2',
  siteId:       'SITE-01',
  location:     'Gate A',
  status:       'ONLINE',
  lastSeenAt:   '2026-06-27T10:00:00.000Z',
  createdBy:    'admin',
  createdAt:    '2026-06-01T00:00:00.000Z',
  updatedAt:    '2026-06-27T10:00:00.000Z',
}

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard camera={mockCamera} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
  })

  it('renders location', () => {
    render(<CameraCard camera={mockCamera} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Gate A')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CameraCard camera={mockCamera} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    render(<CameraCard camera={mockCamera} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2T47G2')).toBeInTheDocument()
  })

  it('calls onSelect when Live button clicked', () => {
    const onSelect = vi.fn()
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    fireEvent.click(screen.getByText(/Live/i))
    expect(onSelect).toHaveBeenCalledWith('cam-01')
  })

  it('calls onTest when Test button clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={mockCamera} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-01')
  })

  it('calls onEdit when Edit button clicked', () => {
    const onEdit = vi.fn()
    render(<CameraCard camera={mockCamera} onSelect={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} onTest={vi.fn()} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('shows reachable test result', () => {
    render(
      <CameraCard
        camera={mockCamera}
        onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/42 ms/)).toBeInTheDocument()
  })

  it('shows unreachable test result', () => {
    render(
      <CameraCard
        camera={mockCamera}
        onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/i)).toBeInTheDocument()
  })

  it('renders without optional fields', () => {
    const minimal: Camera = { ...mockCamera, manufacturer: null, model: null, location: null, lastSeenAt: null }
    render(<CameraCard camera={minimal} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
  })
})
