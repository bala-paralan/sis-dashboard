import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera, CreateCameraInput } from '@/api/cameras'

const cam: Camera = {
  id:           'cam-2',
  name:         'Perimeter Cam',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2',
  siteId:       'SITE-B',
  location:     'Perimeter South',
  status:       'ONLINE',
  lastSeenAt:   null,
  createdBy:    'u-1',
  createdAt:    '2026-01-01T00:00:00Z',
  updatedAt:    '2026-01-01T00:00:00Z',
}

describe('CameraFormModal — add mode', () => {
  it('renders "Add Camera" title', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit and then onClose on valid submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose  = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    fireEvent.change(screen.getByRole('textbox', { name: /^name/i }), {
      target: { value: 'New Cam' },
    })
    // RTSP URL field (placeholder contains rtsp://)
    const rtspInput = screen.getByPlaceholderText(/rtsp:\/\//i)
    fireEvent.change(rtspInput, { target: { value: 'rtsp://192.168.1.1/stream' } })

    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const arg = onSubmit.mock.calls[0][0] as CreateCameraInput
    expect(arg.name).toBe('New Cam')
    expect(arg.rtspUrl).toBe('rtsp://192.168.1.1/stream')
    expect(onClose).toHaveBeenCalled()
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    fireEvent.change(screen.getByRole('textbox', { name: /^name/i }), {
      target: { value: 'Bad Cam' },
    })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), {
      target: { value: 'rtsp://bad' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})

describe('CameraFormModal — edit mode', () => {
  it('renders "Edit Camera" title', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /edit camera/i })).toBeInTheDocument()
  })

  it('pre-fills name from initial', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const nameInput = screen.getByRole('textbox', { name: /^name/i }) as HTMLInputElement
    expect(nameInput.value).toBe('Perimeter Cam')
  })

  it('pre-fills location from initial', () => {
    render(<CameraFormModal mode="edit" initial={cam} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('Perimeter South')).toBeInTheDocument()
  })
})
