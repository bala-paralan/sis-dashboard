import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders label text for status %s', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('ONLINE badge includes green colour classes', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const span = container.firstChild as HTMLElement
    expect(span.className).toContain('green')
  })

  it('OFFLINE badge includes gray colour classes', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    const span = container.firstChild as HTMLElement
    expect(span.className).toContain('gray')
  })

  it('DEGRADED badge includes yellow colour classes', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    const span = container.firstChild as HTMLElement
    expect(span.className).toContain('yellow')
  })

  it('ERROR badge includes red colour classes', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    const span = container.firstChild as HTMLElement
    expect(span.className).toContain('red')
  })

  it('MAINTENANCE badge includes blue colour classes', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    const span = container.firstChild as HTMLElement
    expect(span.className).toContain('blue')
  })

  it('renders an indicator dot inside the badge', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dots = container.querySelectorAll('span span')
    expect(dots.length).toBeGreaterThanOrEqual(1)
  })
})
