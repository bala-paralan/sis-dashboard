import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id: 'cam-001',
    name: 'Existing Camera',
    manufacturer: 'Axis',
    model: 'P3245',
    siteId: 'SITE-01',
    location: 'Perimeter',
    status: 'ONLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('CameraFormModal', () => {
  it('renders the add form title', () => {
    render(
      <CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('renders name and RTSP URL fields', () => {
    render(
      <CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    const nameLabels = screen.getAllByText(/^name/i)
    expect(nameLabels.length).toBeGreaterThan(0)
    expect(screen.getAllByText(/rtsp/i).length).toBeGreaterThan(0)
  })

  it('pre-fills name and location in edit mode', () => {
    render(
      <CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByDisplayValue('Existing Camera')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Perimeter')).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn()
    render(
      <CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with form data on save', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'My Camera' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://192.168.1.1/stream' } })
    fireEvent.click(screen.getByRole('button', { name: /save|add/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })

  it('shows error message when onSubmit throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(
      <CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Cam' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://x' } })
    fireEvent.click(screen.getByRole('button', { name: /save|add/i }))
    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })

  it('disables save button while saving', async () => {
    const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}))
    render(
      <CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Cam' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://x' } })
    fireEvent.click(screen.getByRole('button', { name: /save|add/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled())
  })
})
