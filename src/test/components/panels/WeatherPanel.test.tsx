import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows initial weather condition in the header bar', () => {
    render(<WeatherPanel />)
    // Initial condition is "Partly Cloudy"
    expect(screen.getAllByText(/Partly Cloudy/i).length).toBeGreaterThan(0)
  })

  it('shows initial visibility reading in the header bar', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/8\.2 km/).length).toBeGreaterThan(0)
  })

  it('shows MOSDAC / IMD attribution text', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/MOSDAC \/ IMD/)).toBeInTheDocument()
  })

  it('shows Current view toggle button', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/🌡 Current/)).toBeInTheDocument()
  })

  it('shows 24h Forecast view toggle button', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/📅 24h Forecast/)).toBeInTheDocument()
  })

  it('shows current temperature reading in °C', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/28\.4°C/)).toBeInTheDocument()
  })

  it('shows dew point reading', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Dew point/i)).toBeInTheDocument()
  })

  it('shows humidity metric', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Humidity/i)).toBeInTheDocument()
  })

  it('shows wind metric', () => {
    render(<WeatherPanel />)
    // Wind dir and speed shown in WindCompass area
    expect(screen.getAllByText(/Wind/i).length).toBeGreaterThan(0)
  })

  it('switches to 24h Forecast view when clicked', () => {
    render(<WeatherPanel />)
    fireEvent.click(screen.getByText(/📅 24h Forecast/))
    // Forecast shows "24h forecast" summary heading
    expect(screen.getByText(/24h forecast/i)).toBeInTheDocument()
  })

  it('shows Sensor Recommendation heading in current view', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('renders wind compass SVG', () => {
    render(<WeatherPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
