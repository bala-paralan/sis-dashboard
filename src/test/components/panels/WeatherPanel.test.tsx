import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders some content', () => {
    render(<WeatherPanel />)
    const text = document.body.textContent ?? ''
    expect(text.length).toBeGreaterThan(10)
  })

  it('renders temperature value (°C appears in the panel)', () => {
    render(<WeatherPanel />)
    const elements = screen.getAllByText(/°C/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders humidity percentage', () => {
    render(<WeatherPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/%/)
  })

  it('renders wind speed (km/h)', () => {
    render(<WeatherPanel />)
    const elements = screen.getAllByText(/km\/h|kmh|wind/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders visibility information', () => {
    render(<WeatherPanel />)
    const elements = screen.getAllByText(/visibility|vis/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders forecast section', () => {
    render(<WeatherPanel />)
    const elements = screen.getAllByText(/forecast|hour/i)
    expect(elements.length).toBeGreaterThan(0)
  })

  it('renders pressure or terrain section', () => {
    render(<WeatherPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/hPa|pressure|terrain/i)
  })

  it('renders a wind compass SVG', () => {
    render(<WeatherPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
