import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders the %s status text', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('renders a dot indicator', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('.rounded-full')
    expect(dot).toBeInTheDocument()
  })

  it('applies green classes for ONLINE status', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.firstChild).toHaveClass('text-green-300')
  })

  it('applies red classes for ERROR status', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    expect(container.firstChild).toHaveClass('text-red-300')
  })

  it('applies yellow classes for DEGRADED status', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.firstChild).toHaveClass('text-yellow-300')
  })

  it('applies blue classes for MAINTENANCE status', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(container.firstChild).toHaveClass('text-blue-300')
  })
})
