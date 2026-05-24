import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(): Camera {
  return {
    id: 'cam-001',
    name: 'Existing Camera',
    manufacturer: 'Axis',
    model: 'P3245-V',
    siteId: 'BOP-ALPHA-01',
    location: 'North Perimeter',
    status: 'ONLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('CameraFormModal — add mode', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows "Add Camera" heading', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('shows Name input field', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    // The "Name *" label span
    const labels = document.querySelectorAll('label')
    const nameLabel = Array.from(labels).find((l) => l.textContent?.includes('Name'))
    expect(nameLabel).toBeDefined()
  })

  it('shows RTSP URL input field', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText(/rtsp:\/\//i)).toBeInTheDocument()
  })

  it('shows Cancel button', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('shows Add Camera submit button', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onSubmit with form values on submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    // Fill name (first textbox input) and RTSP URL (has placeholder)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Test Camera' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://192.168.1.5/stream1' } })

    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      const call = onSubmit.mock.calls[0][0]
      expect(call.rtspUrl).toBe('rtsp://192.168.1.5/stream1')
    })
  })

  it('shows error message when onSubmit throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Camera already exists'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://x' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))

    await waitFor(() => {
      expect(screen.getByText(/Camera already exists/i)).toBeInTheDocument()
    })
  })
})

describe('CameraFormModal — edit mode', () => {
  it('shows "Edit Camera" heading', () => {
    render(
      <CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
  })

  it('pre-fills name field with existing camera name', () => {
    render(
      <CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    const nameInput = screen.getAllByRole('textbox')[0] as HTMLInputElement
    expect(nameInput.value).toBe('Existing Camera')
  })

  it('shows Save Changes submit button', () => {
    render(
      <CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
  })

  it('pre-fills manufacturer from existing camera', () => {
    render(
      <CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    const inputs = screen.getAllByRole('textbox')
    const manufacturerInput = inputs.find((el) => (el as HTMLInputElement).value === 'Axis')
    expect(manufacturerInput).toBeDefined()
  })
})
