import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) =>
      w.id === 'visibilityWeatherForecast' ? { ...w, visible: true } : w
    ),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WeatherPanel', () => {
  it('renders without throwing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows current weather condition in the stats bar', () => {
    render(<WeatherPanel />)
    // Initial condition is "Partly Cloudy" — appears in both the outer span and inner strong
    const matches = screen.getAllByText(/Partly Cloudy/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows view toggle tabs', () => {
    render(<WeatherPanel />)
    expect(screen.getByRole('button', { name: /Current/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /24h Forecast/i })).toBeInTheDocument()
  })

  it('shows temperature in current view by default', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/28\.4°C/i)).toBeInTheDocument()
  })

  it('shows Sensor Recommendation section in current view', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('shows MOSDAC / IMD source attribution', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/MOSDAC \/ IMD/i)).toBeInTheDocument()
  })

  it('switches to 24h forecast view on tab click', () => {
    render(<WeatherPanel />)
    fireEvent.click(screen.getByRole('button', { name: /24h Forecast/i }))
    expect(screen.getByText(/24-hour hourly forecast/i)).toBeInTheDocument()
  })

  it('hides weather content and shows disabled message when widget is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'visibilityWeatherForecast' ? { ...w, visible: false } : w
      ),
    })
    render(<WeatherPanel />)
    expect(screen.getByText(/Weather widget disabled in Settings/i)).toBeInTheDocument()
  })

  it('shows humidity metric in current view', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
  })

  it('shows visibility metric in current view', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })
})
