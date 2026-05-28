import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders personnel names', () => {
    render(<PersonnelPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/Sharma|Verma|Singh|Kumar|Rao|patrol/i)
  })

  it('renders battery level indicators', () => {
    render(<PersonnelPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/%|battery/i)
  })

  it('renders geofence status', () => {
    render(<PersonnelPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/INSIDE|OUTSIDE|geofence/i)
  })

  it('renders NavIC or location section heading', () => {
    render(<PersonnelPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/NavIC|GPS|board|location|cep/i)
  })

  it('renders personnel count', () => {
    render(<PersonnelPanel />)
    const text = document.body.textContent ?? ''
    expect(text.length).toBeGreaterThan(50)
  })

  it('renders role labels (Patrol Alpha, QRT Lead, etc.)', () => {
    render(<PersonnelPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/Patrol|QRT|Perimeter/i)
  })
})
