import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders %s label', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('renders a coloured dot indicator', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('span.rounded-full')
    expect(dot).toBeInTheDocument()
  })

  it('applies green classes for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('green')
  })

  it('applies red classes for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('red')
  })

  it('applies yellow classes for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('yellow')
  })

  it('applies blue classes for MAINTENANCE', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('blue')
  })
})
