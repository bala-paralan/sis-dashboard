import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Front Gate',
  manufacturer: 'Hikvision',
  model: 'DS-2CD2143',
  siteId: 'site-A',
  location: 'North perimeter',
  status: 'ONLINE',
  lastSeenAt: '2026-05-01T10:00:00.000Z',
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-05-01T10:00:00.000Z',
}

function renderCard(overrides?: Partial<Camera>) {
  const camera = { ...mockCamera, ...overrides }
  const onSelect = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onTest = vi.fn()
  render(
    <CameraCard
      camera={camera}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
      onTest={onTest}
    />
  )
  return { onSelect, onEdit, onDelete, onTest }
}

describe('CameraCard', () => {
  it('renders camera name', () => {
    renderCard()
    expect(screen.getByText('Front Gate')).toBeInTheDocument()
  })

  it('renders location when present', () => {
    renderCard()
    expect(screen.getByText('North perimeter')).toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    renderCard()
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2143')).toBeInTheDocument()
  })

  it('calls onSelect when Live button is clicked', () => {
    const { onSelect } = renderCard()
    fireEvent.click(screen.getByText('▶ Live'))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest when Test button is clicked', () => {
    const { onTest } = renderCard()
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit when Edit button is clicked', () => {
    const { onEdit } = renderCard()
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(mockCamera)
  })

  it('shows test result when provided', () => {
    const onSelect = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onTest = vi.fn()
    render(
      <CameraCard
        camera={mockCamera}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
        testResult={{ reachable: true, latency_ms: 45, message: 'OK' }}
      />
    )
    expect(screen.getByText(/Reachable/)).toBeInTheDocument()
    expect(screen.getByText(/45 ms/)).toBeInTheDocument()
  })

  it('shows unreachable message when test fails', () => {
    const onSelect = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onTest = vi.fn()
    render(
      <CameraCard
        camera={mockCamera}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
        testResult={{ reachable: false, latency_ms: null, message: 'Connection refused' }}
      />
    )
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })
})
