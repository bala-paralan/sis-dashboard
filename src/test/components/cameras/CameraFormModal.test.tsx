import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Gate Camera',
  manufacturer: 'Axis',
  model: 'P3245',
  siteId: 'site-B',
  location: 'Main entrance',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('CameraFormModal', () => {
  it('shows "Add Camera" heading in add mode', () => {
    render(
      <CameraFormModal
        mode="add"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('shows "Edit Camera" heading in edit mode', () => {
    render(
      <CameraFormModal
        mode="edit"
        initial={mockCamera}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
  })

  it('pre-fills name field in edit mode', () => {
    render(
      <CameraFormModal
        mode="edit"
        initial={mockCamera}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('Gate Camera')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(
      <CameraFormModal
        mode="add"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with form values on submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(
      <CameraFormModal
        mode="add"
        onSubmit={onSubmit}
        onClose={onClose}
      />
    )
    fireEvent.change(screen.getAllByRole('textbox', { name: /name/i })[0], {
      target: { value: 'New Camera' },
    })
    fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), {
      target: { value: 'rtsp://10.0.0.1/live' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })

  it('displays error message when onSubmit throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(
      <CameraFormModal
        mode="add"
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    )
    fireEvent.change(screen.getAllByRole('textbox', { name: /name/i })[0], {
      target: { value: 'Cam' },
    })
    fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), {
      target: { value: 'rtsp://10.0.0.1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})
