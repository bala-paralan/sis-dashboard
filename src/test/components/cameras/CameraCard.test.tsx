import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2-L',
    siteId:       'site-alpha',
    location:     'Main entrance',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-01T12:00:00Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00Z',
    updatedAt:    '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('CameraCard', () => {
  let onSelect: ReturnType<typeof vi.fn>
  let onEdit: ReturnType<typeof vi.fn>
  let onDelete: ReturnType<typeof vi.fn>
  let onTest: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSelect = vi.fn()
    onEdit   = vi.fn()
    onDelete = vi.fn()
    onTest   = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  function renderCard(overrides: Partial<Camera> = {}, testResult?: { reachable: boolean; latency_ms: number | null; message: string }) {
    return render(
      <CameraCard
        camera={makeCamera(overrides)}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
        testResult={testResult}
      />
    )
  }

  it('renders camera name', () => {
    renderCard()
    expect(screen.getByText('Front Gate')).toBeInTheDocument()
  })

  it('renders location when provided', () => {
    renderCard({ location: 'Main entrance' })
    expect(screen.getByText('Main entrance')).toBeInTheDocument()
  })

  it('does not render location row when location is null', () => {
    renderCard({ location: null })
    expect(screen.queryByText('Main entrance')).not.toBeInTheDocument()
  })

  it('renders manufacturer and model', () => {
    renderCard()
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2T47G2-L')).toBeInTheDocument()
  })

  it('renders ONLINE status badge', () => {
    renderCard({ status: 'ONLINE' })
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

  it('calls onEdit with camera object when Edit button clicked', () => {
    const cam = makeCamera()
    render(
      <CameraCard
        camera={cam}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onTest={onTest}
      />
    )
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(cam)
  })

  it('calls onDelete with camera id after confirm', () => {
    renderCard()
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
  })

  it('does not call onDelete when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderCard()
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows reachable test result in green', () => {
    renderCard({}, { reachable: true, latency_ms: 42, message: 'OK' })
    expect(screen.getByText(/Reachable/)).toBeInTheDocument()
    expect(screen.getByText(/42 ms/)).toBeInTheDocument()
  })

  it('shows unreachable test result in red', () => {
    renderCard({}, { reachable: false, latency_ms: null, message: 'Connection refused' })
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
  })

  it('does not render test result section when testResult is undefined', () => {
    renderCard()
    expect(screen.queryByText(/Reachable/)).not.toBeInTheDocument()
    expect(screen.queryByText(/ms/)).not.toBeInTheDocument()
  })
})
