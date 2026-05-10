import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'North Gate',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2-I',
    siteId:       'BOP-ALPHA-01',
    location:     'Gate 1 North',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-10T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-05-10T10:00:00.000Z',
    ...overrides,
  }
}

const noop = vi.fn()

describe('CameraCard', () => {
  it('renders the camera name', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('renders the camera location', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Gate 1 North')).toBeInTheDocument()
  })

  it('renders the manufacturer in the meta table', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Manufacturer')).toBeInTheDocument()
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })

  it('renders the model in the meta table', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2143G2-I')).toBeInTheDocument()
  })

  it('shows the ONLINE status badge', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('shows OFFLINE status badge for offline cameras', () => {
    render(<CameraCard camera={makeCamera({ status: 'OFFLINE' })} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button is clicked', () => {
    const onSelect = vi.fn()
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={noop} onDelete={noop} onTest={noop} />)
    fireEvent.click(screen.getByRole('button', { name: /Live/i }))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest with camera id when Test button is clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /^Test$/ }))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit with camera when Edit button is clicked', () => {
    const onEdit = vi.fn()
    const cam = makeCamera()
    render(<CameraCard camera={cam} onSelect={noop} onEdit={onEdit} onDelete={noop} onTest={noop} />)
    fireEvent.click(screen.getByRole('button', { name: /^Edit$/ }))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('shows test result reachable message when testResult is provided', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
        testResult={{ reachable: true, latency_ms: 45, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/45 ms/)).toBeInTheDocument()
  })

  it('shows failure message when testResult is not reachable', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })

  it('does not show test result section when testResult is undefined', () => {
    render(<CameraCard camera={makeCamera()} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.queryByText(/Reachable/i)).not.toBeInTheDocument()
  })
})
