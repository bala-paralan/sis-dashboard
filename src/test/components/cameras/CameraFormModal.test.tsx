import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Camera 1',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2',
    siteId:       'BOP-ALPHA-01',
    location:     'Gate 1 North',
    status:       'ONLINE',
    lastSeenAt:   '2026-04-11T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-04-11T10:00:00.000Z',
    ...overrides,
  }
}

describe('CameraFormModal', () => {
  it('renders without throwing in add mode', () => {
    const { container } = render(
      <CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders without throwing in edit mode', () => {
    const { container } = render(
      <CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Name label', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    const labels = screen.getAllByText(/^Name/i)
    expect(labels.length).toBeGreaterThan(0)
  })

  it('shows RTSP URL field by placeholder', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText(/rtsp:\/\//i)).toBeInTheDocument()
  })

  it('shows Location label', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/^Location$/i)).toBeInTheDocument()
  })

  it('pre-fills name in edit mode', () => {
    render(
      <CameraFormModal
        mode="edit"
        initial={makeCamera({ name: 'Gate Camera 1' })}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('Gate Camera 1')).toBeInTheDocument()
  })

  it('pre-fills manufacturer in edit mode', () => {
    render(
      <CameraFormModal
        mode="edit"
        initial={makeCamera({ manufacturer: 'Hikvision' })}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('Hikvision')).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows Add Camera title in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('shows Edit Camera title in edit mode', () => {
    render(
      <CameraFormModal
        mode="edit"
        initial={makeCamera()}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: /Edit Camera/i })).toBeInTheDocument()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    // Fill in the name input (first textbox)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'New Camera' } })
    // Fill RTSP URL (placeholder helps identify it)
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://192.168.1.100/stream' } })
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Camera', rtspUrl: 'rtsp://192.168.1.100/stream' })
      )
    })
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'New Camera' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://192.168.1.100/stream' } })
    fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument()
    })
  })
})
