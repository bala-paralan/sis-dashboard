import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function mockCamera(): Camera {
  return {
    id: 'cam-001',
    name: 'Perimeter Cam',
    manufacturer: 'Axis',
    model: 'P3245',
    siteId: 'SITE-02',
    location: 'North Fence',
    status: 'ONLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  }
}

describe('CameraFormModal — add mode', () => {
  it('renders "Add Camera" heading', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('renders Name and RTSP URL required fields', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /^name/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/rtsp:\/\//i)).toBeInTheDocument()
  })

  it('submit button reads "Add Camera"', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /add camera/i })).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onSubmit with form data on valid submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    fireEvent.change(screen.getByRole('textbox', { name: /^name/i }), { target: { value: 'East Gate' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://192.168.1.1/stream' } })
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'East Gate', rtspUrl: 'rtsp://192.168.1.1/stream' })
      )
    })
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    fireEvent.change(screen.getByRole('textbox', { name: /^name/i }), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://x/s' } })
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('disables submit button while saving', async () => {
    let resolveSubmit!: () => void
    const onSubmit = vi.fn().mockReturnValue(new Promise<void>((res) => { resolveSubmit = res }))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    fireEvent.change(screen.getByRole('textbox', { name: /^name/i }), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://x/s' } })
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })

    resolveSubmit()
  })
})

describe('CameraFormModal — edit mode', () => {
  it('renders "Edit Camera" heading', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
  })

  it('pre-fills name field with existing value', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /^name/i })).toHaveValue('Perimeter Cam')
  })

  it('pre-fills location field', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const locationInput = screen.getByDisplayValue('North Fence')
    expect(locationInput).toBeInTheDocument()
  })

  it('submit button reads "Save Changes"', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('does not pre-fill RTSP URL (encrypted at rest)', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText(/rtsp:\/\//i)).toHaveValue('')
  })
})
