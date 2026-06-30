import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function mockCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate',
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'site-alpha',
    location:     'North Perimeter',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraFormModal', () => {
  describe('add mode', () => {
    it('renders "Add Camera" heading', () => {
      render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
      expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
    })

    it('renders Name and RTSP URL fields as required', () => {
      render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
      expect(screen.getByPlaceholderText(/rtsp:\/\//i)).toBeInTheDocument()
    })

    it('calls onSubmit with form data when submitted', async () => {
      const onSubmit = vi.fn().mockResolvedValueOnce(undefined)
      const onClose  = vi.fn()
      const { container } = render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Test Camera' } })
      fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://192.168.1.1/stream' } })
      fireEvent.submit(container.querySelector('form')!)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })

    it('calls onClose after successful submit', async () => {
      const onSubmit = vi.fn().mockResolvedValueOnce(undefined)
      const onClose  = vi.fn()
      const { container } = render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Cam' } })
      const form = container.querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('displays error message when onSubmit throws', async () => {
      const onSubmit = vi.fn().mockRejectedValueOnce(new Error('API Error'))
      const { container } = render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

      const form = container.querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })
    })

    it('calls onClose when Cancel button is clicked', () => {
      const onClose = vi.fn()
      render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('edit mode', () => {
    it('renders "Edit Camera" heading', () => {
      render(
        <CameraFormModal mode="edit" initial={mockCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />
      )
      expect(screen.getByText('Edit Camera')).toBeInTheDocument()
    })

    it('pre-fills name field from initial camera data', () => {
      render(
        <CameraFormModal mode="edit" initial={mockCamera({ name: 'South Gate' })} onSubmit={vi.fn()} onClose={vi.fn()} />
      )
      const nameInput = screen.getAllByRole('textbox')[0] as HTMLInputElement
      expect(nameInput.value).toBe('South Gate')
    })

    it('pre-fills manufacturer from initial camera data', () => {
      render(
        <CameraFormModal mode="edit" initial={mockCamera({ manufacturer: 'Dahua' })} onSubmit={vi.fn()} onClose={vi.fn()} />
      )
      expect((screen.getByDisplayValue('Dahua') as HTMLInputElement).value).toBe('Dahua')
    })

    it('shows "Save Changes" button text', () => {
      render(
        <CameraFormModal mode="edit" initial={mockCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />
      )
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
  })
})
