import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({
      ...w,
      visible: true,
    })),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Current tab button', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Current/i)).toBeInTheDocument()
  })

  it('shows 24h Forecast tab button', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/Forecast/i).length).toBeGreaterThan(0)
  })

  it('renders weather condition in stats bar', () => {
    render(<WeatherPanel />)
    // Initial condition is 'Partly Cloudy' — may appear in stats bar and main card
    expect(screen.getAllByText('Partly Cloudy').length).toBeGreaterThan(0)
  })

  it('shows temperature reading on current tab', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/°C/).length).toBeGreaterThan(0)
  })

  it('shows Humidity metric card', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
  })

  it('shows Visibility metric card', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('shows Pressure metric card', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Pressure')).toBeInTheDocument()
  })

  it('shows Wind metric card', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('shows Sensor Recommendation section', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('switches to forecast view when Forecast tab is clicked', () => {
    render(<WeatherPanel />)
    // Click the tab button specifically (role=button)
    const forecastButtons = screen.getAllByRole('button', { name: /Forecast/i })
    fireEvent.click(forecastButtons[0])
    expect(screen.getByText(/24-hour hourly forecast/i)).toBeInTheDocument()
  })

  it('shows disabled message when visibilityWeatherForecast widget is off', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'visibilityWeatherForecast' ? { ...w, visible: false } : w
      ),
    })
    render(<WeatherPanel />)
    expect(screen.getByText(/Weather widget disabled in Settings/i)).toBeInTheDocument()
  })

  it('shows MOSDAC / IMD attribution in stats bar', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/MOSDAC/i)).toBeInTheDocument()
  })

  it('renders wind compass SVG', () => {
    render(<WeatherPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
