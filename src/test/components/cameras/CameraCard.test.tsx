import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera A',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2T47G2',
  siteId:       'site-01',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-04-26T10:00:00.000Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-04-26T10:00:00.000Z',
}

describe('CameraCard', () => {
  const onSelect = vi.fn()
  const onEdit   = vi.fn()
  const onDelete = vi.fn()
  const onTest   = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('renders without crashing', () => {
    const { container } = render(
      <CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the camera name', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Gate Camera A')).toBeInTheDocument()
  })

  it('renders the camera location', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('renders the manufacturer', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })

  it('renders the model', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('DS-2CD2T47G2')).toBeInTheDocument()
  })

  it('renders ONLINE status badge', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('calls onSelect when Live button clicked', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    const liveBtn = screen.getByText(/▶ Live/i)
    fireEvent.click(liveBtn)
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button clicked', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('calls onTest when Test button clicked', () => {
    render(<CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('shows reachable test result when provided', () => {
    const testResult = { reachable: true, latency_ms: 42, message: 'OK' }
    render(
      <CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} testResult={testResult} />
    )
    expect(screen.getByText(/42 ms/i)).toBeInTheDocument()
  })

  it('shows unreachable test result when provided', () => {
    const testResult = { reachable: false, latency_ms: null, message: 'Connection refused' }
    render(
      <CameraCard camera={mockCamera} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} testResult={testResult} />
    )
    expect(screen.getByText(/Connection refused/i)).toBeInTheDocument()
  })

  it('renders without optional fields gracefully', () => {
    const minimal: Camera = { ...mockCamera, manufacturer: null, model: null, location: null, lastSeenAt: null }
    expect(() =>
      render(<CameraCard camera={minimal} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onTest={onTest} />)
    ).not.toThrow()
  })
})
