import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

describe('CameraStatusBadge', () => {
  const statuses: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

  for (const status of statuses) {
    it(`renders label for status ${status}`, () => {
      render(<CameraStatusBadge status={status} />)
      expect(screen.getByText(status)).toBeInTheDocument()
    })
  }

  it('applies green class for ONLINE status', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.firstChild).toHaveClass('text-green-300')
  })

  it('applies red class for ERROR status', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    expect(container.firstChild).toHaveClass('text-red-300')
  })

  it('applies yellow class for DEGRADED status', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.firstChild).toHaveClass('text-yellow-300')
  })

  it('applies gray class for OFFLINE status', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    expect(container.firstChild).toHaveClass('text-gray-400')
  })

  it('applies blue class for MAINTENANCE status', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(container.firstChild).toHaveClass('text-blue-300')
  })
})
