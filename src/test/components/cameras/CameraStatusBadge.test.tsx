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

  it('renders ONLINE with green colour class', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.firstChild).toHaveClass('text-green-300')
  })

  it('renders OFFLINE with gray colour class', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    expect(container.firstChild).toHaveClass('text-gray-400')
  })

  it('renders DEGRADED with yellow colour class', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.firstChild).toHaveClass('text-yellow-300')
  })

  it('renders ERROR with red colour class', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    expect(container.firstChild).toHaveClass('text-red-300')
  })

  it('renders MAINTENANCE with blue colour class', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(container.firstChild).toHaveClass('text-blue-300')
  })

  it('renders a status indicator dot', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('.h-1\\.5.w-1\\.5')
    expect(dot).toBeInTheDocument()
  })
})
