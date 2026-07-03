import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      w.id === 'visibilityWeatherForecast' ? { ...w, visible: true } : w,
    ),
  }))
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders temperature reading', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/°C/)
  })

  it('renders humidity reading', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Humidity/i)
  })

  it('renders wind information', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Wind|km\/h/i)
  })

  it('renders visibility reading', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Visibility/i)
  })

  it('renders pressure reading', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Pressure|hPa/i)
  })

  it('renders current weather condition text', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Clear|Cloudy|Overcast|Fog|Rain|Drizzle/)
  })

  it('renders 24-hour forecast section', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/24h Forecast/i)
  })

  it('renders sensor mode recommendations section', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Sensor Recommendation|Conditions nominal/i)
  })

  it('renders dewpoint reading', () => {
    render(<WeatherPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Dew point/i)
  })

  it('shows disabled message when visibilityWeatherForecast widget is off', () => {
    useSettingsStore.setState((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === 'visibilityWeatherForecast' ? { ...w, visible: false } : w,
      ),
    }))
    render(<WeatherPanel />)
    // When the widget is disabled the panel shows a placeholder/disabled view
    const body = document.body.textContent ?? ''
    expect(body).not.toMatch(/24h Forecast/)
  })
})
