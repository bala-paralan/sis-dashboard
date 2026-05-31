import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('WeatherPanel', () => {
  it('renders without crashing when widget is visible', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows disabled message when visibilityWeatherForecast widget is off', () => {
    useSettingsStore.getState().toggleWidget('visibilityWeatherForecast')
    render(<WeatherPanel />)
    expect(screen.getByText(/Weather widget disabled in Settings/i)).toBeInTheDocument()
  })

  it('shows current temperature reading with °C', () => {
    render(<WeatherPanel />)
    // Initial temperature is 28.4°C — appears in both stats area and main reading
    expect(screen.getAllByText(/°C/).length).toBeGreaterThan(0)
  })

  it('shows current weather condition in stats bar', () => {
    render(<WeatherPanel />)
    // Initial condition is "Partly Cloudy" — may appear in stats bar and main reading
    expect(screen.getAllByText('Partly Cloudy').length).toBeGreaterThan(0)
  })

  it('shows MOSDAC / IMD data source label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/MOSDAC \/ IMD/i)).toBeInTheDocument()
  })

  it('shows view toggle buttons (Current and Forecast)', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Current/i)).toBeInTheDocument()
    expect(screen.getByText(/24h Forecast/i)).toBeInTheDocument()
  })

  it('shows sensor recommendation section in current view', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('shows weather metrics (Humidity, Visibility, Pressure, Wind)', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
    expect(screen.getByText('Visibility')).toBeInTheDocument()
    expect(screen.getByText('Pressure')).toBeInTheDocument()
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('switches to forecast view and shows 24-hour heading', () => {
    render(<WeatherPanel />)
    fireEvent.click(screen.getByText(/24h Forecast/i))
    expect(screen.getByText(/24-hour hourly forecast/i)).toBeInTheDocument()
  })

  it('shows wind compass SVG', () => {
    render(<WeatherPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
