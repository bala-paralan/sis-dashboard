import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WeatherPanel', () => {
  it('renders without crashing when widget is enabled', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders temperature value in °C', () => {
    render(<WeatherPanel />)
    const tempEls = screen.queryAllByText(/°C/)
    expect(tempEls.length).toBeGreaterThan(0)
  })

  it('renders humidity percentage', () => {
    render(<WeatherPanel />)
    const humidityEls = screen.queryAllByText(/%/)
    expect(humidityEls.length).toBeGreaterThan(0)
  })

  it('renders a wind speed in km/h', () => {
    render(<WeatherPanel />)
    const windEls = screen.queryAllByText(/km\/h/)
    expect(windEls.length).toBeGreaterThan(0)
  })

  it('renders view toggle buttons (Current and 24h Forecast)', () => {
    render(<WeatherPanel />)
    const currentEls = screen.queryAllByText(/Current/i)
    const forecastEls = screen.queryAllByText(/Forecast/i)
    expect(currentEls.length).toBeGreaterThan(0)
    expect(forecastEls.length).toBeGreaterThan(0)
  })

  it('renders weather condition text', () => {
    render(<WeatherPanel />)
    const conditions = ['Clear', 'Partly Cloudy', 'Overcast', 'Fog', 'Rain', 'Drizzle']
    const found = conditions.some((c) => screen.queryAllByText(c).length > 0)
    expect(found).toBe(true)
  })

  it('shows a sensor recommendation section', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('renders visibility in km', () => {
    render(<WeatherPanel />)
    const visEls = screen.queryAllByText(/km/)
    expect(visEls.length).toBeGreaterThan(0)
  })

  it('shows disabled message when visibilityWeatherForecast widget is hidden', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'visibilityWeatherForecast' ? { ...w, visible: false } : w
      ),
    })
    render(<WeatherPanel />)
    expect(screen.getByText(/Weather widget disabled/i)).toBeInTheDocument()
  })
})
