import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CameraCard } from '@/components/cameras/CameraCard'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Front Gate Cam',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2347G2-LU',
  siteId:       'site-alpha',
  location:     'Gate A',
  status:       'ONLINE',
  lastSeenAt:   '2026-05-01T12:00:00.000Z',
  createdBy:    'user-001',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-05-01T12:00:00.000Z',
}

const onSelect  = vi.fn()
const onEdit    = vi.fn()
const onDelete  = vi.fn()
const onTest    = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

function renderCard(overrides?: Partial<Camera>, testResult?: { reachable: boolean; latency_ms: number | null; message: string }) {
  return render(
    <CameraCard
      camera={{ ...mockCamera, ...overrides }}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
      onTest={onTest}
      testResult={testResult}
    />,
  )
}

describe('CameraCard', () => {
  it('renders camera name', () => {
    renderCard()
    expect(screen.getByText('Front Gate Cam')).toBeInTheDocument()
  })

  it('renders camera location', () => {
    renderCard()
    expect(screen.getByText('Gate A')).toBeInTheDocument()
  })

  it('renders manufacturer and model in the meta section', () => {
    renderCard()
    expect(screen.getByText('Hikvision')).toBeInTheDocument()
    expect(screen.getByText('DS-2CD2347G2-LU')).toBeInTheDocument()
  })

  it('renders CameraStatusBadge with correct status', () => {
    renderCard()
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('calls onSelect with camera id when Live button is clicked', () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /live/i }))
    expect(onSelect).toHaveBeenCalledWith('cam-001')
  })

  it('calls onEdit with camera when Edit button is clicked', () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'cam-001' }))
  })

  it('calls onTest with camera id when Test button is clicked', () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /test/i }))
    expect(onTest).toHaveBeenCalledWith('cam-001')
  })

  it('calls onDelete when Delete is clicked and user confirms', () => {
    vi.stubGlobal('confirm', vi.fn(() => true))
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('cam-001')
    vi.unstubAllGlobals()
  })

  it('does not call onDelete when user cancels confirmation', () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('shows reachable test result', () => {
    renderCard({}, { reachable: true, latency_ms: 15, message: 'OK' })
    expect(screen.getByText(/reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/15 ms/i)).toBeInTheDocument()
  })

  it('shows failure test result message', () => {
    renderCard({}, { reachable: false, latency_ms: null, message: 'Connection refused' })
    expect(screen.getByText(/connection refused/i)).toBeInTheDocument()
  })

  it('does not render test result section when no testResult', () => {
    renderCard()
    expect(screen.queryByText(/reachable/i)).not.toBeInTheDocument()
  })
})
