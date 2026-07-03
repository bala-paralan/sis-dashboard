import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Gate Alpha Camera',
  manufacturer: 'Hikvision',
  model: 'DS-2CD2143G2-I',
  siteId: 'SITE-A',
  location: 'Main Gate',
  status: 'ONLINE',
  lastSeenAt: '2026-04-11T10:00:00.000Z',
  createdBy: 'admin',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-11T10:00:00.000Z',
}

const noop = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraCard', () => {
  it('renders camera name', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Gate Alpha Camera')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('renders manufacturer', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })

  it('renders model', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('DS-2CD2143G2-I')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders Live button', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByRole('button', { name: /Live/i })).toBeInTheDocument()
  })

  it('renders Test button', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByRole('button', { name: /Test/i })).toBeInTheDocument()
  })

  it('renders Edit button', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
  })

  it('renders Delete button', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button is clicked', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    fireEvent.click(screen.getByRole('button', { name: /Live/i }))
    expect(noop).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest with camera id when Test button is clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /Test/i }))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit with camera when Edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={onEdit} onDelete={noop} onTest={noop} />)
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
    expect(onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('shows reachable test result when provided', () => {
    render(
      <CameraCard
        camera={mockCamera}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
        onTest={noop}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />,
    )
    expect(screen.getByText(/Reachable.*42 ms/i)).toBeInTheDocument()
  })

  it('shows unreachable test result when provided', () => {
    render(
      <CameraCard
        camera={mockCamera}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
        onTest={noop}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />,
    )
    expect(screen.getByText(/Connection refused/i)).toBeInTheDocument()
  })

  it('renders last seen timestamp when available', () => {
    render(<CameraCard camera={mockCamera} onSelect={noop} onEdit={noop} onDelete={noop} onTest={noop} />)
    expect(screen.getByText('Last seen')).toBeInTheDocument()
  })
})
