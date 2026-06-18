import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const cam: Camera = {
  id:           'cam-1',
  name:         'Gate Camera',
  manufacturer: 'Axis',
  model:        'P3245',
  siteId:       'SITE-A',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-01-01T12:00:00Z',
  createdBy:    'user-1',
  createdAt:    '2026-01-01T00:00:00Z',
  updatedAt:    '2026-01-01T12:00:00Z',
}

function makeProps(overrides = {}) {
  return {
    camera:   cam,
    onSelect: vi.fn(),
    onEdit:   vi.fn(),
    onDelete: vi.fn(),
    onTest:   vi.fn(),
    ...overrides,
  }
}

describe('CameraCard', () => {
  beforeEach(() => {
    // confirm is called for delete
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('renders camera name and location', () => {
    render(<CameraCard {...makeProps()} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CameraCard {...makeProps()} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders manufacturer and model metadata', () => {
    render(<CameraCard {...makeProps()} />)
    expect(screen.getByText('Axis')).toBeInTheDocument()
    expect(screen.getByText('P3245')).toBeInTheDocument()
  })

  it('calls onSelect when Live button clicked', () => {
    const onSelect = vi.fn()
    render(<CameraCard {...makeProps({ onSelect })} />)
    fireEvent.click(screen.getByRole('button', { name: /live/i }))
    expect(onSelect).toHaveBeenCalledWith('cam-1')
  })

  it('calls onTest when Test button clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard {...makeProps({ onTest })} />)
    fireEvent.click(screen.getByRole('button', { name: /test/i }))
    expect(onTest).toHaveBeenCalledWith('cam-1')
  })

  it('calls onEdit with the camera when Edit clicked', () => {
    const onEdit = vi.fn()
    render(<CameraCard {...makeProps({ onEdit })} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('calls onDelete after confirm', () => {
    const onDelete = vi.fn()
    render(<CameraCard {...makeProps({ onDelete })} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('cam-1')
  })

  it('does NOT call onDelete when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const onDelete = vi.fn()
    render(<CameraCard {...makeProps({ onDelete })} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('renders reachable test result', () => {
    render(
      <CameraCard
        {...makeProps()}
        testResult={{ reachable: true, latency_ms: 42, message: 'ok' }}
      />,
    )
    expect(screen.getByText(/42 ms/)).toBeInTheDocument()
  })

  it('renders unreachable test result with error message', () => {
    render(
      <CameraCard
        {...makeProps()}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />,
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })
})
