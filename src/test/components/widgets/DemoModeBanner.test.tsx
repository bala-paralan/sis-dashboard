import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DemoModeBanner } from '@/components/widgets/DemoModeBanner'

describe('DemoModeBanner', () => {
  it('renders with the demo-mode-banner test id', () => {
    render(<DemoModeBanner />)
    expect(screen.getByTestId('demo-mode-banner')).toBeInTheDocument()
  })

  it('contains "DEMO MODE" text', () => {
    render(<DemoModeBanner />)
    expect(screen.getByText(/DEMO MODE/i)).toBeInTheDocument()
  })

  it('mentions that backend is not connected', () => {
    render(<DemoModeBanner />)
    expect(screen.getByText(/not connected/i)).toBeInTheDocument()
  })

  it('renders as a visible element', () => {
    render(<DemoModeBanner />)
    const banner = screen.getByTestId('demo-mode-banner')
    expect(banner).toBeVisible()
  })
})
