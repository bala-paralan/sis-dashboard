import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const onSubmit = vi.fn()
const onClose  = vi.fn()

const existingCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Cam',
  manufacturer: 'Axis',
  model:        'P3245',
  siteId:       'site-alpha',
  location:     'North Gate',
  status:       'ONLINE',
  lastSeenAt:   null,
  createdBy:    'user-001',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraFormModal — add mode', () => {
  it('renders "Add Camera" heading', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('renders empty name input', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    // Use label text matcher — "Name" label is first in the form
    const nameInput = screen.getAllByRole('textbox')[0]
    expect(nameInput).toHaveValue('')
  })

  it('calls onSubmit with form values on submit', async () => {
    onSubmit.mockResolvedValue(undefined)
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'New Cam' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://192.168.1.1/stream' } })
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name:    'New Cam',
        rtspUrl: 'rtsp://192.168.1.1/stream',
      }))
    })
  })

  it('calls onClose when Cancel is clicked', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('displays error message when onSubmit rejects', async () => {
    onSubmit.mockRejectedValue(new Error('API error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Cam' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://x' } })
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument()
    })
  })
})

describe('CameraFormModal — edit mode', () => {
  it('renders "Edit Camera" heading', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: /edit camera/i })).toBeInTheDocument()
  })

  it('pre-fills name from existing camera', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('Gate Cam')
  })

  it('pre-fills manufacturer from existing camera', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={onSubmit} onClose={onClose} />)
    // Manufacturer is the 4th textbox: Name, RTSP URL, Username, Password, Manufacturer
    expect(screen.getByDisplayValue('Axis')).toBeInTheDocument()
  })

  it('does NOT pre-fill RTSP URL (encrypted at rest)', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByPlaceholderText(/rtsp:\/\//i)).toHaveValue('')
  })

  it('submit button reads "Save Changes" in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
