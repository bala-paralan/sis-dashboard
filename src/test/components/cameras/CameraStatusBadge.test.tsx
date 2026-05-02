import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

describe('CameraStatusBadge', () => {
  const statuses: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

  statuses.forEach((status) => {
    it(`renders label for ${status}`, () => {
      render(<CameraStatusBadge status={status} />)
      expect(screen.getByText(status)).toBeInTheDocument()
    })
  })

  it('applies green colour class for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.querySelector('.text-green-300')).toBeInTheDocument()
  })

  it('applies gray colour class for OFFLINE', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    expect(container.querySelector('.text-gray-400')).toBeInTheDocument()
  })

  it('applies yellow colour class for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.querySelector('.text-yellow-300')).toBeInTheDocument()
  })

  it('applies red colour class for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    expect(container.querySelector('.text-red-300')).toBeInTheDocument()
  })

  it('applies blue colour class for MAINTENANCE', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(container.querySelector('.text-blue-300')).toBeInTheDocument()
  })
})
