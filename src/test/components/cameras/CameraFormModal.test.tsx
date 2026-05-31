import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Existing Camera',
    manufacturer: 'Dahua',
    model:        'SD49425XB',
    siteId:       'site-01',
    location:     'Perimeter East',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('CameraFormModal', () => {
  it('renders without crashing in add mode', () => {
    const { container } = render(
      <CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the Add Camera heading in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('shows the Edit Camera heading in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/Edit Camera/i)).toBeInTheDocument()
  })

  it('pre-fills the name field when editing an existing camera', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const nameInput = screen.getByDisplayValue('Existing Camera')
    expect(nameInput).toBeInTheDocument()
  })

  it('calls onClose when the close/cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    // Click the × close button (aria label or title attribute)
    const closeButtons = screen.getAllByRole('button')
    const cancelOrClose = closeButtons.find((b) =>
      b.textContent?.includes('×') || b.textContent?.includes('Cancel') || b.textContent?.toLowerCase().includes('close')
    )
    if (cancelOrClose) fireEvent.click(cancelOrClose)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    // Fill required fields (Name has no placeholder; RTSP URL has the rtsp placeholder)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'New Cam' } })
    fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), {
      target: { value: 'rtsp://192.168.1.1/stream' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })

  it('shows an error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    // Fill required fields and submit
    const inputs = screen.getAllByRole('textbox')
    if (inputs[0]) fireEvent.change(inputs[0], { target: { value: 'Cam' } })
    if (inputs[1]) fireEvent.change(inputs[1], { target: { value: 'rtsp://x' } })

    const submitBtn = screen.getByRole('button', { name: /Add Camera|Save/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument()
    })
  })
})
