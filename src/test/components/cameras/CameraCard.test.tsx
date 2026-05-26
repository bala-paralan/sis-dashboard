import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Camera 1',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2',
    siteId:       'BOP-ALPHA-01',
    location:     'Gate 1 North',
    status:       'ONLINE',
    lastSeenAt:   '2026-04-11T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-04-11T10:00:00.000Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  it('renders without throwing', () => {
    const cam = makeCamera()
    const { container } = render(
      <CameraCard
        camera={cam}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows camera name', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('Gate Camera 1')).toBeInTheDocument()
  })

  it('shows the status badge', () => {
    render(
      <CameraCard
        camera={makeCamera({ status: 'ONLINE' })}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('shows location when provided', () => {
    render(
      <CameraCard
        camera={makeCamera({ location: 'Gate 1 North' })}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('Gate 1 North')).toBeInTheDocument()
  })

  it('calls onSelect when Live button is clicked', () => {
    const onSelect = vi.fn()
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={onSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /live/i }))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn()
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'cam-001' }))
  })

  it('calls onTest when Test button is clicked', () => {
    const onTest = vi.fn()
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={onTest}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /test/i }))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('shows test result when provided and reachable', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
        testResult={{ reachable: true, latency_ms: 15, message: 'OK' }}
      />
    )
    expect(screen.getByText(/15 ms/i)).toBeInTheDocument()
  })

  it('shows test result failure message when not reachable', () => {
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

  it('shows manufacturer when provided', () => {
    render(
      <CameraCard
        camera={makeCamera({ manufacturer: 'Hikvision' })}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })
})
