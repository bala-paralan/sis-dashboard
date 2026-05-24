import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id: 'cam-001',
    name: 'Main Gate PTZ',
    manufacturer: 'Hikvision',
    model: 'DS-2DE4A425IWG',
    siteId: 'BOP-ALPHA-01',
    location: 'Gate A North',
    status: 'ONLINE',
    lastSeenAt: '2026-01-15T10:30:00.000Z',
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-15T10:30:00.000Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the camera name', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('Main Gate PTZ')).toBeInTheDocument()
  })

  it('shows the camera location when provided', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('Gate A North')).toBeInTheDocument()
  })

  it('shows status badge', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('shows manufacturer when provided', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })

  it('shows model when provided', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText('DS-2DE4A425IWG')).toBeInTheDocument()
  })

  it('shows Live, Test, Edit, Delete buttons', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.getByText(/Live/i)).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
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
    fireEvent.click(screen.getByText(/Live/i))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
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
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn()
    const cam = makeCamera()
    render(
      <CameraCard
        camera={cam}
        onSelect={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('shows successful test result when reachable', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
        testResult={{ reachable: true, latency_ms: 24, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/24 ms/i)).toBeInTheDocument()
  })

  it('shows failed test result when not reachable', () => {
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

  it('does not show location when location is null', () => {
    render(
      <CameraCard
        camera={makeCamera({ location: null })}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTest={vi.fn()}
      />
    )
    expect(screen.queryByText('Gate A North')).not.toBeInTheDocument()
  })
})
