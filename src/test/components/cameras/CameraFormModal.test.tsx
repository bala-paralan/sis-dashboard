import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Roof Camera',
    manufacturer: 'Dahua',
    model:        'IPC-HDW2831T',
    siteId:       'SITE-B',
    location:     'Roof',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-04-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('CameraFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Add mode ────────────────────────────────────────────────────────────────

  describe('add mode', () => {
    it('renders "Add Camera" heading', () => {
      render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
      expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
    })

    it('renders submit button labelled "Add Camera"', () => {
      render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Add Camera' })).toBeInTheDocument()
    })

    it('renders required Name and RTSP URL fields', () => {
      render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
      expect(screen.getByText(/Name/)).toBeInTheDocument()
      expect(screen.getByText(/RTSP URL/)).toBeInTheDocument()
    })

    it('calls onClose when Cancel button clicked', () => {
      const onClose = vi.fn()
      render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onSubmit and onClose on successful submit', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      const inputs = screen.getAllByRole('textbox')
      // First input is Name
      fireEvent.change(inputs[0], { target: { value: 'New Cam' } })
      // Second input is RTSP URL
      fireEvent.change(inputs[1], { target: { value: 'rtsp://192.168.1.10/stream' } })

      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce()
        expect(onClose).toHaveBeenCalledOnce()
      })
    })

    it('shows error message when onSubmit rejects', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: 'Bad Cam' } })
      fireEvent.change(inputs[1], { target: { value: 'rtsp://bad' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('does not call onClose when onSubmit rejects', async () => {
      const onClose = vi.fn()
      const onSubmit = vi.fn().mockRejectedValue(new Error('Fail'))
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: 'X' } })
      fireEvent.change(inputs[1], { target: { value: 'rtsp://x' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // ── Edit mode ───────────────────────────────────────────────────────────────

  describe('edit mode', () => {
    it('renders "Edit Camera" heading', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
      expect(screen.getByText('Edit Camera')).toBeInTheDocument()
    })

    it('renders submit button labelled "Save Changes"', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    })

    it('pre-fills Name field from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera({ name: 'Roof Camera' })} onSubmit={vi.fn()} onClose={vi.fn()} />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveValue('Roof Camera')
    })

    it('pre-fills Manufacturer field from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera({ manufacturer: 'Dahua' })} onSubmit={vi.fn()} onClose={vi.fn()} />)
      expect(screen.getByDisplayValue('Dahua')).toBeInTheDocument()
    })

    it('does not pre-fill RTSP URL (AES-safe rule)', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
      // RTSP input should be empty string
      const inputs = screen.getAllByRole('textbox')
      // Index 1 is RTSP URL
      expect(inputs[1]).toHaveValue('')
    })

    it('calls onSubmit with updated fields', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={onSubmit} onClose={vi.fn()} />)

      const nameInput = screen.getAllByRole('textbox')[0]
      fireEvent.change(nameInput, { target: { value: 'Updated Cam' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce()
        const arg = onSubmit.mock.calls[0][0]
        expect(arg.name).toBe('Updated Cam')
      })
    })
  })

  // ── General behaviour ───────────────────────────────────────────────────────

  it('renders all optional field labels', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/Username/)).toBeInTheDocument()
    expect(screen.getByText(/Manufacturer/)).toBeInTheDocument()
    expect(screen.getByText(/Model/)).toBeInTheDocument()
    expect(screen.getByText(/Location/)).toBeInTheDocument()
    expect(screen.getByText(/Site ID/)).toBeInTheDocument()
  })

  it('submit button is disabled while saving', async () => {
    let resolveSubmit!: () => void
    const onSubmit = vi.fn(() => new Promise<void>((res) => { resolveSubmit = res }))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Cam' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://x' } })

    fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))
    await waitFor(() => expect(screen.getByText('Saving…')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()

    resolveSubmit()
  })
})
