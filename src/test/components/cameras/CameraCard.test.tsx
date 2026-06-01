import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera Alpha',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2143G2-I',
  siteId:       'site-north',
  location:     'North Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-06-01T10:00:00.000Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-06-01T10:00:00.000Z',
}

function makeHandlers() {
  return {
    onSelect: vi.fn(),
    onEdit:   vi.fn(),
    onDelete: vi.fn(),
    onTest:   vi.fn(),
  }
}

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard camera={mockCamera} {...makeHandlers()} />)
    expect(screen.getByText('Gate Camera Alpha')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    render(<CameraCard camera={mockCamera} {...makeHandlers()} />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('renders manufacturer metadata', () => {
    render(<CameraCard camera={mockCamera} {...makeHandlers()} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })

  it('renders model metadata', () => {
    render(<CameraCard camera={mockCamera} {...makeHandlers()} />)
    expect(screen.getByText('DS-2CD2143G2-I')).toBeInTheDocument()
  })

  it('renders status badge with correct status', () => {
    render(<CameraCard camera={mockCamera} {...makeHandlers()} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders lastSeenAt as a human-readable date', () => {
    render(<CameraCard camera={mockCamera} {...makeHandlers()} />)
    // The date is formatted via toLocaleString so just check it's not the raw ISO string
    const dd = screen.queryByText('2026-06-01T10:00:00.000Z')
    expect(dd).not.toBeInTheDocument()
  })

  it('clicking Live button calls onSelect with camera id', () => {
    const handlers = makeHandlers()
    render(<CameraCard camera={mockCamera} {...handlers} />)
    fireEvent.click(screen.getByRole('button', { name: /Live/i }))
    expect(handlers.onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('clicking Edit button calls onEdit with camera object', () => {
    const handlers = makeHandlers()
    render(<CameraCard camera={mockCamera} {...handlers} />)
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
    expect(handlers.onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('clicking Test button calls onTest with camera id', () => {
    const handlers = makeHandlers()
    render(<CameraCard camera={mockCamera} {...handlers} />)
    fireEvent.click(screen.getByRole('button', { name: /Test/i }))
    expect(handlers.onTest).toHaveBeenCalledWith('cam-001')
  })

  it('clicking Delete button — confirm=true — calls onDelete with camera id', () => {
    const handlers = makeHandlers()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<CameraCard camera={mockCamera} {...handlers} />)
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
    expect(handlers.onDelete).toHaveBeenCalledWith('cam-001')
    vi.restoreAllMocks()
  })

  it('clicking Delete button — confirm=false — does NOT call onDelete', () => {
    const handlers = makeHandlers()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<CameraCard camera={mockCamera} {...handlers} />)
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
    expect(handlers.onDelete).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('shows reachable test result with latency', () => {
    const testResult = { reachable: true, latency_ms: 42, message: 'OK' }
    render(<CameraCard camera={mockCamera} testResult={testResult} {...makeHandlers()} />)
    expect(screen.getByText(/Reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/42/)).toBeInTheDocument()
  })

  it('shows unreachable test result with message', () => {
    const testResult = { reachable: false, latency_ms: null, message: 'Connection refused' }
    render(<CameraCard camera={mockCamera} testResult={testResult} {...makeHandlers()} />)
    expect(screen.getByText(/Connection refused/i)).toBeInTheDocument()
  })

  it('does not render test result section when testResult is undefined', () => {
    render(<CameraCard camera={mockCamera} {...makeHandlers()} />)
    expect(screen.queryByText(/Reachable/i)).not.toBeInTheDocument()
  })

  it('renders without optional fields (manufacturer, model, location null)', () => {
    const minimal: Camera = { ...mockCamera, manufacturer: null, model: null, location: null, lastSeenAt: null }
    expect(() => render(<CameraCard camera={minimal} {...makeHandlers()} />)).not.toThrow()
  })
})
