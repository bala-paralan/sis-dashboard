import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function mockCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Alpha',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2-I',
    siteId:       'SITE-01',
    location:     'North Gate',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-01T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  let onSelect: ReturnType<typeof vi.fn>
  let onEdit:   ReturnType<typeof vi.fn>
  let onDelete: ReturnType<typeof vi.fn>
  let onTest:   ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSelect = vi.fn()
    onEdit   = vi.fn()
    onDelete = vi.fn()
    onTest   = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  const renderCard = (cam: Camera = mockCamera(), testResult?: Parameters<typeof CameraCard>[0]['testResult']) =>
    render(
      <CameraCard
        camera={cam}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
        testResult={testResult}
      />
    )

  it('renders without crashing', () => {
    expect(() => renderCard()).not.toThrow()
  })

  it('shows the camera name', () => {
    renderCard()
    expect(screen.getByText('Gate Alpha')).toBeInTheDocument()
  })

  it('shows location when provided', () => {
    renderCard()
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('does not show location element when location is null', () => {
    renderCard(mockCamera({ location: null }))
    expect(screen.queryByText('North Gate')).not.toBeInTheDocument()
  })

  it('shows manufacturer in metadata', () => {
    renderCard()
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
  })

  it('shows model in metadata', () => {
    renderCard()
    expect(screen.getByText('DS-2CD2143G2-I')).toBeInTheDocument()
  })

  it('renders the ONLINE status badge', () => {
    renderCard()
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button clicked', () => {
    renderCard()
    fireEvent.click(screen.getByText('▶ Live'))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onTest with camera id when Test button clicked', () => {
    renderCard()
    fireEvent.click(screen.getByText('Test'))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit with the camera object when Edit button clicked', () => {
    const cam = mockCamera()
    renderCard(cam)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('calls onDelete with camera id when Delete confirmed', () => {
    renderCard()
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('does not call onDelete when confirm dialog is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderCard()
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows green test result when reachable', () => {
    renderCard(mockCamera(), { reachable: true, latency_ms: 12, message: 'OK' })
    expect(screen.getByText(/Reachable/)).toBeInTheDocument()
    expect(screen.getByText(/12 ms/)).toBeInTheDocument()
  })

  it('shows red test result when not reachable', () => {
    renderCard(mockCamera(), { reachable: false, latency_ms: null, message: 'Timeout' })
    expect(screen.getByText(/Timeout/)).toBeInTheDocument()
  })

  it('does not render test result section when testResult is undefined', () => {
    renderCard()
    expect(screen.queryByText(/Reachable/)).not.toBeInTheDocument()
  })
})
