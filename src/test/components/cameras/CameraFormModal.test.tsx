import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-1',
  name: 'Perimeter Cam A',
  manufacturer: 'Hikvision',
  model: 'DS-2CD2T47G2',
  siteId: 'SITE-01',
  location: 'North Gate',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const onSubmit = vi.fn()
const onClose = vi.fn()

// Fill the two required fields by targeting them via position in the textbox list
function fillRequired() {
  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: 'Test Camera' } })
  fireEvent.change(inputs[1], { target: { value: 'rtsp://192.168.1.1/stream' } })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraFormModal', () => {
  it('renders "Add Camera" heading in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('renders "Edit Camera" heading in edit mode', () => {
    render(
      <CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />,
    )
    expect(screen.getByRole('heading', { name: 'Edit Camera' })).toBeInTheDocument()
  })

  it('pre-fills name and location from initial camera', () => {
    render(
      <CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />,
    )
    expect(screen.getByDisplayValue('Perimeter Cam A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('North Gate')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with form data and then onClose on success', async () => {
    onSubmit.mockResolvedValueOnce(undefined)
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fillRequired()
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
    const call = vi.mocked(onSubmit).mock.calls[0][0]
    expect(call.name).toBe('Test Camera')
    expect(call.rtspUrl).toBe('rtsp://192.168.1.1/stream')
  })

  it('shows error message when onSubmit rejects', async () => {
    onSubmit.mockRejectedValueOnce(new Error('Network error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fillRequired()
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('shows "Saving…" label while submitting', async () => {
    let resolve!: () => void
    onSubmit.mockReturnValueOnce(new Promise<void>((r) => { resolve = r }))

    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fillRequired()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add camera/i }))
    })

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()

    await act(async () => { resolve() })
  })

  it('submit button is labeled "Save Changes" in edit mode', () => {
    render(
      <CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />,
    )
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
