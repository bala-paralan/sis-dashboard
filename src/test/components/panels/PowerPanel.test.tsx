import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders node identifiers (BOP-ALPHA etc.)', () => {
    render(<PowerPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/BOP-ALPHA|BOP-BETA|BOP-GAMMA|BOP-DELTA/i)
  })

  it('renders battery percentage values', () => {
    render(<PowerPanel />)
    expect(screen.getAllByText(/%/).length).toBeGreaterThan(0)
  })

  it('renders solar wattage', () => {
    render(<PowerPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/solar|W\b|watt/i)
  })

  it('renders vehicle section', () => {
    render(<PowerPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/vehicle|fuel|callsign/i)
  })

  it('renders generator status', () => {
    render(<PowerPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/generator|ON|OFF|FAULT/i)
  })

  it('renders load or power values', () => {
    render(<PowerPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/load|power|W\b|kW|energy/i)
  })
})
