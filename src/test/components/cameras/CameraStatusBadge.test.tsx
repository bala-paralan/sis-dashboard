import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders label for %s status', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('applies green class for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.firstChild).toHaveClass('text-green-300')
  })

  it('applies gray class for OFFLINE', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    expect(container.firstChild).toHaveClass('text-gray-400')
  })

  it('applies yellow class for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.firstChild).toHaveClass('text-yellow-300')
  })

  it('applies red class for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    expect(container.firstChild).toHaveClass('text-red-300')
  })

  it('applies blue class for MAINTENANCE', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(container.firstChild).toHaveClass('text-blue-300')
  })

  it('renders the dot indicator span', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('span > span')
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveClass('rounded-full')
  })
})
