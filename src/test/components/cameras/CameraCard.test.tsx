import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function mockCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate Camera',
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'site-alpha',
    location:     'North Perimeter',
    status:       'ONLINE',
    lastSeenAt:   '2026-06-30T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

const noop = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(
      <CameraCard
        camera={mockCamera({ name: 'Rear Gate' })}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
      />
    )
    expect(screen.getByText('Rear Gate')).toBeInTheDocument()
  })

  it('renders location when provided', () => {
    render(
      <CameraCard
        camera={mockCamera({ location: 'South Fence' })}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
      />
    )
    expect(screen.getByText('South Fence')).toBeInTheDocument()
  })

  it('does not render location row when location is null', () => {
    render(
      <CameraCard
        camera={mockCamera({ location: null })}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
      />
    )
    expect(screen.queryByText('North Perimeter')).not.toBeInTheDocument()
  })

  it('renders manufacturer and model when provided', () => {
    render(
      <CameraCard
        camera={mockCamera({ manufacturer: 'Hikvision', model: 'DS-2CD2143' })}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
      />
    )
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2143')).toBeInTheDocument()
  })

  it('shows status badge with correct status', () => {
    render(
      <CameraCard
        camera={mockCamera({ status: 'DEGRADED' })}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
      />
    )
    expect(screen.getByText('DEGRADED')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button clicked', () => {
    const onSelect = vi.fn()
    render(
      <CameraCard
        camera={mockCamera({ id: 'cam-999' })}
        onSelect={onSelect} onEdit={noop} onDelete={noop} onTest={noop}
      />
    )
    fireEvent.click(screen.getByText('▶ Live'))
    expect(onSelect).toHaveBeenCalledWith('cam-999')
  })

  it('calls onTest with camera id when Test button clicked', () => {
    const onTest = vi.fn()
    render(
      <CameraCard
        camera={mockCamera({ id: 'cam-test' })}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={onTest}
      />
    )
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-test')
  })

  it('calls onEdit with full camera object when Edit button clicked', () => {
    const onEdit = vi.fn()
    const cam = mockCamera()
    render(
      <CameraCard
        camera={cam}
        onSelect={noop} onEdit={onEdit} onDelete={noop} onTest={noop}
      />
    )
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('shows reachable test result with latency', () => {
    render(
      <CameraCard
        camera={mockCamera()}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
        testResult={{ reachable: true, latency_ms: 38, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable.*38 ms/)).toBeInTheDocument()
  })

  it('shows unreachable test result with message', () => {
    render(
      <CameraCard
        camera={mockCamera()}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })

  it('does not show test result when testResult prop is absent', () => {
    render(
      <CameraCard
        camera={mockCamera()}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
      />
    )
    expect(screen.queryByText(/Reachable/)).not.toBeInTheDocument()
  })
})
