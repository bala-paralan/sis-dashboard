import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  })
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows temperature value', () => {
    render(<WeatherPanel />)
    expect(document.body.textContent).toMatch(/°C/)
  })

  it('shows humidity value', () => {
    render(<WeatherPanel />)
    expect(document.body.textContent).toMatch(/Humidity|humidity|%/i)
  })

  it('shows wind speed or direction', () => {
    render(<WeatherPanel />)
    expect(document.body.textContent).toMatch(/Wind|wind|km\/h|km.h/i)
  })

  it('shows visibility value', () => {
    render(<WeatherPanel />)
    expect(document.body.textContent).toMatch(/Visibility|visibility|km/i)
  })

  it('shows pressure value', () => {
    render(<WeatherPanel />)
    expect(document.body.textContent).toMatch(/Pressure|pressure|hPa/i)
  })

  it('shows weather condition label', () => {
    render(<WeatherPanel />)
    const conditions = ['Clear', 'Partly Cloudy', 'Overcast', 'Fog', 'Rain', 'Drizzle']
    const body = document.body.textContent ?? ''
    const hasCondition = conditions.some((c) => body.includes(c))
    expect(hasCondition).toBe(true)
  })

  it('shows hourly forecast section', () => {
    render(<WeatherPanel />)
    expect(document.body.textContent).toMatch(/Forecast|forecast|Hour/i)
  })

  it('shows wind direction compass point', () => {
    render(<WeatherPanel />)
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const body = document.body.textContent ?? ''
    const hasDir = dirs.some((d) => body.includes(d))
    expect(hasDir).toBe(true)
  })

  it('renders without crashing when weather widget is disabled', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'visibilityWeatherForecast' ? { ...w, visible: false } : w
      ),
    })
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
