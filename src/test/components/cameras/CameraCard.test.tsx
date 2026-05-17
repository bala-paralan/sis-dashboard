import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2347G2',
    siteId:       'SITE-A',
    location:     'Gate 1',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-01T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-05-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  const noop = vi.fn()

  it('renders camera name', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Front Gate')).toBeInTheDocument()
  })

  it('renders camera location when present', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Gate 1')).toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2347G2')).toBeInTheDocument()
  })

  it('renders last seen date', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    // Just check the "Last seen" label is present
    expect(screen.getByText('Last seen')).toBeInTheDocument()
  })

  it('renders ONLINE status badge', () => {
    render(<CameraCard camera={makeCamera({ status: 'ONLINE' })} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders OFFLINE status badge', () => {
    render(<CameraCard camera={makeCamera({ status: 'OFFLINE' })} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button clicked', () => {
    const onSelect = vi.fn()
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={noop} onDelete={noop} onTest={noop} />)
    fireEvent.click(screen.getByText('▶ Live'))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest with camera id when Test button clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit with full camera object when Edit button clicked', () => {
    const onEdit = vi.fn()
    const cam = makeCamera()
    render(<CameraCard camera={cam} onSelect={noop} onEdit={onEdit} onDelete={noop} onTest={noop} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('calls onDelete when Delete button clicked and user confirms', () => {
    const onDelete = vi.fn()
    vi.stubGlobal('confirm', vi.fn(() => true))
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={onDelete} onTest={noop} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
    vi.unstubAllGlobals()
  })

  it('does not call onDelete when user cancels confirmation', () => {
    const onDelete = vi.fn()
    vi.stubGlobal('confirm', vi.fn(() => false))
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={onDelete} onTest={noop} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('shows reachable test result in green', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable.*42 ms/)).toBeInTheDocument()
  })

  it('shows unreachable test result in red', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })

  it('does not render test result section when testResult is absent', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.queryByText(/Reachable/)).not.toBeInTheDocument()
  })

  it('renders without location when location is null', () => {
    expect(() =>
      render(<CameraCard camera={makeCamera({ location: null })} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    ).not.toThrow()
  })

  it('renders without manufacturer / model when they are null', () => {
    render(<CameraCard camera={makeCamera({ manufacturer: null, model: null })} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.queryByText('Manufacturer')).not.toBeInTheDocument()
    expect(screen.queryByText('Model')).not.toBeInTheDocument()
  })
})
