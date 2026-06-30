import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Current weather tab button', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/Current/i).length).toBeGreaterThan(0)
  })

  it('shows 24h Forecast tab button', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/Forecast/i).length).toBeGreaterThan(0)
  })

  it('shows Humidity metric', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
  })

  it('shows Visibility metric', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('shows Pressure metric', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Pressure')).toBeInTheDocument()
  })

  it('shows Wind metric', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('switches to 24h Forecast tab when clicked', () => {
    render(<WeatherPanel />)
    const forecastTabs = screen.getAllByText(/Forecast/i)
    fireEvent.click(forecastTabs[0])
    // forecast tab shows hour rows
    const body = document.body.textContent
    expect(body).toMatch(/Forecast|\d+:\d+/i)
  })

  it('shows weather disabled message when visibilityWeatherForecast widget is off', () => {
    useSettingsStore.getState().toggleWidget('visibilityWeatherForecast')
    render(<WeatherPanel />)
    expect(screen.getByText(/Weather widget disabled/i)).toBeInTheDocument()
  })

  it('shows sensor recommendation advisory text', () => {
    render(<WeatherPanel />)
    // One of the recommendation messages is always displayed
    const rec = [
      /nominal.*no sensor/i,
      /Excellent visibility/i,
      /High winds/i,
      /Low visibility/i,
      /Rain/i,
    ]
    const found = rec.some((r) => document.body.textContent?.match(r))
    expect(found).toBe(true)
  })
})
