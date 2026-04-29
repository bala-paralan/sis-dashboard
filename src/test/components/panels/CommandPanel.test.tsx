import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders node or BOP identifiers', () => {
    render(<CommandPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/BOP|node|sector/i)
  })

  it('renders sensor count info', () => {
    render(<CommandPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/sensor/i)
  })

  it('renders status labels (ONLINE / DEGRADED / OFFLINE)', () => {
    render(<CommandPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/ONLINE|DEGRADED|OFFLINE/i)
  })

  it('renders threat level indicators', () => {
    render(<CommandPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/CLEAR|LOW|MEDIUM|HIGH|CRITICAL|threat/i)
  })

  it('renders alert count info', () => {
    render(<CommandPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/alert/i)
  })

  it('renders contact or last-seen timing info', () => {
    render(<CommandPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/contact|ago|s ago/i)
  })

  it('renders a CIBMS or integration section', () => {
    render(<CommandPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/CIBMS|NATGRID|STANAG|interop/i)
  })
})
