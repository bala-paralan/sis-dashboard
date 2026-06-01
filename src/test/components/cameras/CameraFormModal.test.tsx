import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Alpha',
  manufacturer: 'Hikvision',
  model:        'DS-2CD',
  siteId:       'site-a',
  location:     'North Gate',
  status:       'ONLINE',
  lastSeenAt:   null,
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-01-01T00:00:00.000Z',
}

describe('CameraFormModal — add mode', () => {
  it('renders "Add Camera" heading', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('renders Name and RTSP URL fields', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/Name/)).toBeInTheDocument()
    expect(screen.getByText(/RTSP URL/)).toBeInTheDocument()
  })

  it('Name and RTSP URL inputs start empty', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    const nameInput = inputs.find((i) => (i as HTMLInputElement).placeholder !== 'rtsp://192.168.1.x/stream')
    expect((nameInput as HTMLInputElement).value).toBe('')
  })

  it('submits with correct input when form filled and submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose  = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'My Camera' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://10.0.0.1/stream' } })

    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Camera', rtspUrl: 'rtsp://10.0.0.1/stream' })
      )
    })
  })

  it('calls onClose after successful submit', async () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn().mockResolvedValue(undefined)} onClose={onClose} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'X' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://x' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'X' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://x' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))
    await waitFor(() => expect(screen.getByText(/Server error/i)).toBeInTheDocument())
  })

  it('Cancel button calls onClose', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('CameraFormModal — edit mode', () => {
  it('renders "Edit Camera" heading', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Edit Camera/i })).toBeInTheDocument()
  })

  it('pre-fills name from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const nameInput = screen.getAllByRole('textbox')[0] as HTMLInputElement
    expect(nameInput.value).toBe('Gate Alpha')
  })

  it('pre-fills manufacturer from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('Hikvision')).toBeInTheDocument()
  })

  it('pre-fills location from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('North Gate')).toBeInTheDocument()
  })

  it('RTSP URL field is empty (not pre-filled for security)', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const rtspInput = screen.getByPlaceholderText(/rtsp:\/\//i) as HTMLInputElement
    expect(rtspInput.value).toBe('')
  })

  it('submit button shows "Save Changes" in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
  })
})
