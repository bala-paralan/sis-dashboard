import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(): Camera {
  return {
    id:           'cam-edit-01',
    name:         'Perimeter Cam',
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'BETA-01',
    location:     'Fence Line',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2024-01-01T00:00:00Z',
    updatedAt:    '2024-01-01T00:00:00Z',
  }
}

describe('CameraFormModal — add mode', () => {
  it('renders "Add Camera" heading', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('has an empty name input initially', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    expect((inputs[0] as HTMLInputElement).value).toBe('')
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with correct payload when form is submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose  = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    const allInputs = screen.getAllByRole('textbox')
    fireEvent.change(allInputs[0], { target: { value: 'New Camera' } })
    fireEvent.change(allInputs[1], { target: { value: 'rtsp://10.0.0.1/live' } })

    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Camera', rtspUrl: 'rtsp://10.0.0.1/live' })
      )
    })
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Bad Cam' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://bad' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })
})

describe('CameraFormModal — edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Edit Camera" heading', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
  })

  it('pre-fills name from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('Perimeter Cam')).toBeInTheDocument()
  })

  it('pre-fills manufacturer from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('Axis')).toBeInTheDocument()
  })

  it('does NOT pre-fill RTSP URL (security — never shown)', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const allInputs = screen.getAllByRole('textbox')
    const rtspInput = allInputs[1]
    expect((rtspInput as HTMLInputElement).value).toBe('')
  })

  it('shows "Save Changes" submit button in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })
})
