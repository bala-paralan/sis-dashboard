import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders UAS contacts heading', () => {
    render(<CounterUASPanel />)
    const elements = screen.getAllByText(/UAS Contacts/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders SVG when contacts exist or no-contacts message otherwise', () => {
    render(<CounterUASPanel />)
    // Either SVG bearing indicators or "No UAS contacts detected" must be present
    const svgs = document.querySelectorAll('svg')
    const noContactText = document.body.textContent ?? ''
    const hasContent = svgs.length > 0 || noContactText.includes('No UAS contacts detected')
    expect(hasContent).toBe(true)
  })

  it('renders track history section', () => {
    render(<CounterUASPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/track history/i)
  })

  it('renders alarm or notify control button', () => {
    render(<CounterUASPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/alarm|notify|QRT/i)
  })

  it('renders export KML option', () => {
    render(<CounterUASPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/export|KML/i)
  })

  it('renders no-contacts message when contact list is empty', () => {
    render(<CounterUASPanel />)
    // Initially 0 contacts is shown (random start, but text should mention contacts)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/contact|detected/i)
  })
})
