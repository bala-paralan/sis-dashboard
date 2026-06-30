import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

describe('CameraStatusBadge', () => {
  const statuses: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

  statuses.forEach((status) => {
    it(`renders "${status}" label text`, () => {
      render(<CameraStatusBadge status={status} />)
      expect(screen.getByText(status)).toBeInTheDocument()
    })
  })

  it('applies green class for ONLINE status', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('green')
  })

  it('applies gray class for OFFLINE status', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('gray')
  })

  it('applies yellow class for DEGRADED status', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('yellow')
  })

  it('applies red class for ERROR status', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('red')
  })

  it('applies blue class for MAINTENANCE status', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('blue')
  })

  it('renders a dot indicator element', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    // The dot is a span with rounded-full class
    const dot = container.querySelector('span span')
    expect(dot).toBeInTheDocument()
    expect(dot?.className).toContain('rounded-full')
  })
})
