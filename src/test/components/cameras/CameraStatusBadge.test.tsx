import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders label for status %s', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('applies green class for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.querySelector('span')?.className).toContain('green')
  })

  it('applies red class for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    expect(container.querySelector('span')?.className).toContain('red')
  })

  it('applies yellow class for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.querySelector('span')?.className).toContain('yellow')
  })

  it('applies gray class for OFFLINE', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    expect(container.querySelector('span')?.className).toContain('gray')
  })

  it('applies blue class for MAINTENANCE', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(container.querySelector('span')?.className).toContain('blue')
  })

  it('renders a dot indicator inside the badge', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dots = container.querySelectorAll('span span')
    expect(dots.length).toBeGreaterThanOrEqual(1)
  })
})
