import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      w.id === 'visibilityWeatherForecast' ? { ...w, visible: true } : w
    ),
  }))
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows MOSDAC / IMD source label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/MOSDAC \/ IMD/i)).toBeInTheDocument()
  })

  it('renders Current and 24h Forecast toggle tabs', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Current/i)).toBeInTheDocument()
    expect(screen.getByText(/24h Forecast/i)).toBeInTheDocument()
  })

  it('shows temperature in °C in current view', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/°C/).length).toBeGreaterThan(0)
  })

  it('shows Sensor Recommendation section', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('shows weather metric labels: Humidity, Visibility, Pressure, Wind', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
    expect(screen.getByText('Visibility')).toBeInTheDocument()
    expect(screen.getByText('Pressure')).toBeInTheDocument()
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('shows Dew point label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Dew point/i)).toBeInTheDocument()
  })

  it('switches to forecast view and shows 24-hour hourly forecast heading', () => {
    render(<WeatherPanel />)
    fireEvent.click(screen.getByText(/24h Forecast/i))
    expect(screen.getByText(/24-hour hourly forecast/i)).toBeInTheDocument()
  })

  it('renders SVG wind compass', () => {
    render(<WeatherPanel />)
    expect(document.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  it('shows "Weather widget disabled" when visibilityWeatherForecast is hidden', () => {
    useSettingsStore.setState((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === 'visibilityWeatherForecast' ? { ...w, visible: false } : w
      ),
    }))
    render(<WeatherPanel />)
    expect(screen.getByText(/Weather widget disabled/i)).toBeInTheDocument()
  })
})
