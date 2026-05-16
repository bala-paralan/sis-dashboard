import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-1',
    name:         'Gate Camera',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2',
    siteId:       'site-a',
    location:     'North Gate',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2024-01-01T00:00:00Z',
    updatedAt:    '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('CameraFormModal — add mode', () => {
  const onSubmit = vi.fn()
  const onClose  = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('renders "Add Camera" heading', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('has empty name field by default', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThan(0)
    expect(inputs[0]).toHaveValue('')
  })

  it('shows required asterisk on Name and RTSP URL', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    const stars = screen.getAllByText('*')
    expect(stars.length).toBeGreaterThanOrEqual(2)
  })

  it('clicking Cancel calls onClose', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('submitting with name + rtspUrl calls onSubmit', async () => {
    onSubmit.mockResolvedValueOnce(undefined)
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'New Cam' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp/i), { target: { value: 'rtsp://1.2.3.4/stream' } })
    const form = screen.getByRole('button', { name: /add camera/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Cam', rtspUrl: 'rtsp://1.2.3.4/stream' })
    )
  })

  it('shows error message when onSubmit rejects', async () => {
    onSubmit.mockRejectedValueOnce(new Error('Server error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Cam' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp/i), { target: { value: 'rtsp://x' } })
    const form = screen.getByRole('button', { name: /add camera/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('CameraFormModal — edit mode', () => {
  const onSubmit = vi.fn()
  const onClose  = vi.fn()
  const cam      = makeCamera()

  beforeEach(() => { vi.clearAllMocks() })

  it('renders "Edit Camera" heading', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: /edit camera/i })).toBeInTheDocument()
  })

  it('pre-fills name from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByDisplayValue('Gate Camera')).toBeInTheDocument()
  })

  it('pre-fills manufacturer from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByDisplayValue('Hikvision')).toBeInTheDocument()
  })

  it('pre-fills location from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByDisplayValue('North Gate')).toBeInTheDocument()
  })

  it('RTSP URL field is empty (never pre-filled)', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={onSubmit} onClose={onClose} />)
    const rtsp = screen.getByPlaceholderText(/rtsp/i)
    expect(rtsp).toHaveValue('')
  })

  it('submit button label is "Save Changes"', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('calls onClose after successful submit', async () => {
    onSubmit.mockResolvedValueOnce(undefined)
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={onSubmit} onClose={onClose} />)
    const form = screen.getByRole('button', { name: /save changes/i }).closest('form')!
    fireEvent.submit(form)
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
