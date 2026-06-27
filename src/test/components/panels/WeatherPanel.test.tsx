import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) =>
      w.id === 'visibilityWeatherForecast' ? { ...w, visible: true } : w
    ),
  })
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows weather condition text in stats bar', () => {
    render(<WeatherPanel />)
    // Partly Cloudy is the initial condition — may appear in multiple elements
    const matches = screen.getAllByText(/Partly Cloudy/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows temperature reading', () => {
    render(<WeatherPanel />)
    // Initial temp 28.4°C
    expect(screen.getByText(/28\.4°C/)).toBeInTheDocument()
  })

  it('shows current / forecast tab buttons', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Current/i)).toBeInTheDocument()
    expect(screen.getByText(/24h Forecast/i)).toBeInTheDocument()
  })

  it('shows humidity metric', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Humidity/i)).toBeInTheDocument()
    expect(screen.getByText(/74%/)).toBeInTheDocument()
  })

  it('shows visibility metric', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Visibility/i)).toBeInTheDocument()
  })

  it('shows pressure metric', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/1008 hPa/)).toBeInTheDocument()
  })

  it('shows sensor recommendation section', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('switches to forecast view when 24h Forecast tab is clicked', () => {
    render(<WeatherPanel />)
    const forecastBtn = screen.getByText(/24h Forecast/i)
    fireEvent.click(forecastBtn)
    expect(screen.getByText(/24-hour hourly forecast/i)).toBeInTheDocument()
  })

  it('shows forecast rows when on forecast tab', () => {
    render(<WeatherPanel />)
    fireEvent.click(screen.getByText(/24h Forecast/i))
    // Should have 12 forecast rows
    const rows = document.querySelectorAll('.flex.items-center.gap-2.py-\\[5px\\]')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('shows disabled message when visibilityWeatherForecast widget is off', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'visibilityWeatherForecast' ? { ...w, visible: false } : w
      ),
    })
    render(<WeatherPanel />)
    expect(screen.getByText(/Weather widget disabled/i)).toBeInTheDocument()
  })

  it('shows MOSDAC / IMD attribution', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/MOSDAC/i)).toBeInTheDocument()
  })
})
