import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'
import { useAuthStore } from '@/store/authStore'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id: 'cam-001',
    name: 'Gate Camera',
    manufacturer: 'Hikvision',
    model: 'DS-2CD2143G2',
    siteId: 'SITE-01',
    location: 'Main Gate',
    status: 'ONLINE',
    lastSeenAt: '2024-05-15T10:00:00Z',
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-05-15T10:00:00Z',
    ...overrides,
  }
}

const defaultProps = {
  onSelect: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onTest: vi.fn(),
}

describe('CameraCard', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: { id: 'u1', email: 'op@test.com', displayName: 'Operator', role: 'OPERATOR' } })
  })

  it('renders camera name', () => {
    render(<CameraCard camera={makeCamera()} {...defaultProps} />)
    expect(screen.getByText('Gate Camera')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    render(<CameraCard camera={makeCamera()} {...defaultProps} />)
    expect(screen.getByText('Main Gate')).toBeInTheDocument()
  })

  it('renders camera status badge', () => {
    render(<CameraCard camera={makeCamera({ status: 'ONLINE' })} {...defaultProps} />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    render(<CameraCard camera={makeCamera()} {...defaultProps} />)
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2143G2')).toBeInTheDocument()
  })

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<CameraCard camera={makeCamera()} {...defaultProps} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'cam-001' }))
  })

  it('calls onDelete when Delete button is clicked', () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<CameraCard camera={makeCamera()} {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest when Test button is clicked', () => {
    const onTest = vi.fn()
    render(<CameraCard camera={makeCamera()} {...defaultProps} onTest={onTest} />)
    fireEvent.click(screen.getByRole('button', { name: /test/i }))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('shows test result when provided', () => {
    render(
      <CameraCard
        camera={makeCamera()}
        {...defaultProps}
        testResult={{ reachable: true, latency_ms: 42, message: 'OK' }}
      />
    )
    expect(screen.getByText(/42 ms/)).toBeInTheDocument()
  })
})
