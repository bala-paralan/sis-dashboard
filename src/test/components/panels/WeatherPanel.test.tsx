import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      w.id === 'visibilityWeatherForecast' ? { ...w, visible: true } : w
    ),
  }))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows temperature in °C', () => {
    render(<WeatherPanel />)
    const tempLabels = screen.getAllByText(/°C/)
    expect(tempLabels.length).toBeGreaterThan(0)
  })

  it('shows wind speed information', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('shows visibility information', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('shows humidity label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
  })

  it('shows Current and 24h Forecast tab buttons', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Current/i)).toBeInTheDocument()
    expect(screen.getByText(/24h Forecast/i)).toBeInTheDocument()
  })

  it('shows pressure reading', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Pressure')).toBeInTheDocument()
  })
})
