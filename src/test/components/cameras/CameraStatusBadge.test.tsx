import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders status label for %s', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('includes a coloured dot indicator', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('span span')
    expect(dot).toBeInTheDocument()
  })
})
