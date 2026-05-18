import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('applies green classes for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.firstChild).toHaveClass('text-green-300')
  })

  it('applies gray classes for OFFLINE', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    expect(container.firstChild).toHaveClass('text-gray-400')
  })

  it('applies yellow classes for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.firstChild).toHaveClass('text-yellow-300')
  })
})
