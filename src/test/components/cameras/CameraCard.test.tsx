import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const makeCamera = (overrides?: Partial<Camera>): Camera => ({
  id:           'cam-1',
  name:         'Gate A',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2',
  siteId:       'site-1',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-04-24T10:00:00.000Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-04-24T10:00:00.000Z',
  ...overrides,
})

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Gate A')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('renders status badge with ONLINE text', () => {
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders manufacturer and model metadata', () => {
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2')).toBeInTheDocument()
  })

  it('does not render manufacturer row when null', () => {
    render(<CameraCard camera={makeCamera({ manufacturer: null })} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    expect(screen.queryByText('Manufacturer')).not.toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button is clicked', () => {
    const onSelect = vi.fn()
    render(<CameraCard camera={makeCamera()} onSelect={onSelect} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()} />)
    fireEvent.click(screen.getByText('▶ Live'))
    expect(onSelect).toHaveBeenCalledWith('cam-1')
  })

  it('calls onTest with camera id when Test button is clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-1')
  })

  it('calls onEdit with camera object when Edit button is clicked', () => {
    const onEdit = vi.fn()
    const cam = makeCamera()
    render(<CameraCard camera={cam} onSelect={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} onTest={vi.fn()} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('calls onDelete after confirm dialog when Delete is clicked', () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} onTest={vi.fn()} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-1')
    vi.restoreAllMocks()
  })

  it('does not call onDelete when confirm is cancelled', () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<CameraCard camera={makeCamera()} onSelect={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} onTest={vi.fn()} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('shows successful test result', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()}
        testResult={{ reachable: true, latency_ms: 14, message: 'OK' }}
      />
    )
    expect(screen.getByText(/14 ms/)).toBeInTheDocument()
  })

  it('shows failed test result', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        onSelect={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onTest={vi.fn()}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })
})
