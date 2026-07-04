import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera, CreateCameraInput } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Existing Camera',
    manufacturer: 'Axis',
    model:        'P3245-V',
    siteId:       'SITE-02',
    location:     'Roof NE',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-04-01T00:00:00.000Z',
    ...overrides,
  }
}

const noop = async () => {}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraFormModal', () => {
  describe('add mode', () => {
    it('renders "Add Camera" as the heading', () => {
      render(<CameraFormModal mode="add" onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
    })

    it('renders "Add Camera" as submit button text', () => {
      render(<CameraFormModal mode="add" onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.getByRole('button', { name: /add camera/i })).toBeInTheDocument()
    })

    it('shows Name and RTSP URL as required fields', () => {
      render(<CameraFormModal mode="add" onSubmit={noop} onClose={vi.fn()} />)
      // Required marker is rendered as a <span>*</span> next to label text
      expect(screen.getAllByText('*').length).toBeGreaterThanOrEqual(2)
    })

    it('starts with empty fields', () => {
      render(<CameraFormModal mode="add" onSubmit={noop} onClose={vi.fn()} />)
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach((input) => {
        expect((input as HTMLInputElement).value).toBe('')
      })
    })
  })

  describe('edit mode', () => {
    it('renders "Edit Camera" as the heading', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.getByRole('heading', { name: /edit camera/i })).toBeInTheDocument()
    })

    it('renders "Save Changes" as submit button text', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('pre-fills name from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera({ name: 'Existing Camera' })} onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.getByDisplayValue('Existing Camera')).toBeInTheDocument()
    })

    it('pre-fills location from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera({ location: 'Roof NE' })} onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.getByDisplayValue('Roof NE')).toBeInTheDocument()
    })

    it('pre-fills manufacturer from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera({ manufacturer: 'Axis' })} onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.getByDisplayValue('Axis')).toBeInTheDocument()
    })

    it('pre-fills model from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera({ model: 'P3245-V' })} onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.getByDisplayValue('P3245-V')).toBeInTheDocument()
    })

    it('does not pre-fill RTSP URL (never exposed)', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={noop} onClose={vi.fn()} />)
      expect(screen.queryByDisplayValue(/rtsp:\/\//)).not.toBeInTheDocument()
    })
  })

  describe('submission', () => {
    it('calls onSubmit with form data on valid submit', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const onClose  = vi.fn()

      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      // Fill Name input (first textbox)
      const textboxes = screen.getAllByRole('textbox')
      fireEvent.change(textboxes[0], { target: { value: 'Test Cam' } })
      // Fill RTSP URL
      fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), { target: { value: 'rtsp://10.0.0.1/stream' } })

      fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
      const arg = onSubmit.mock.calls[0]?.[0] as CreateCameraInput
      expect(arg.name).toBe('Test Cam')
      expect(arg.rtspUrl).toBe('rtsp://10.0.0.1/stream')
    })

    it('calls onClose after successful submission', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      const onClose  = vi.fn()

      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      const textboxes = screen.getAllByRole('textbox')
      fireEvent.change(textboxes[0], { target: { value: 'My Cam' } })
      fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), { target: { value: 'rtsp://x' } })

      fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('shows error message when onSubmit rejects', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))

      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

      const textboxes = screen.getAllByRole('textbox')
      fireEvent.change(textboxes[0], { target: { value: 'Bad Cam' } })
      fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), { target: { value: 'rtsp://x' } })

      fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument()
      })
    })

    it('strips empty optional fields before submitting', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)

      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

      const textboxes = screen.getAllByRole('textbox')
      // Only fill required fields
      fireEvent.change(textboxes[0], { target: { value: 'Minimal Cam' } })
      fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), { target: { value: 'rtsp://x' } })

      fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())

      const arg = onSubmit.mock.calls[0]?.[0] as CreateCameraInput
      expect(arg).not.toHaveProperty('manufacturer')
      expect(arg).not.toHaveProperty('model')
      expect(arg).not.toHaveProperty('location')
    })
  })

  describe('cancel', () => {
    it('calls onClose when Cancel button is clicked', () => {
      const onClose = vi.fn()
      render(<CameraFormModal mode="add" onSubmit={noop} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onSubmit when Cancel is clicked', () => {
      const onSubmit = vi.fn()
      const onClose  = vi.fn()
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('saving state', () => {
    it('disables the submit button while saving', async () => {
      let resolve!: () => void
      const onSubmit = vi.fn(() => new Promise<void>((r) => { resolve = r }))
      const onClose  = vi.fn()

      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      const textboxes = screen.getAllByRole('textbox')
      fireEvent.change(textboxes[0], { target: { value: 'Cam' } })
      fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), { target: { value: 'rtsp://x' } })

      fireEvent.click(screen.getByRole('button', { name: /add camera/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      })

      resolve()
    })
  })
})
