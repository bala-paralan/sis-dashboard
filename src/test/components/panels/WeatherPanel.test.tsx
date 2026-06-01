import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  } as never)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders current/forecast tab buttons', () => {
    render(<WeatherPanel />)
    expect(screen.getByRole('button', { name: /Current/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Forecast/i })).toBeInTheDocument()
  })

  it('shows temperature reading (°C)', () => {
    render(<WeatherPanel />)
    // The temperature is rendered as `{wx.temp_c}°C`
    const allText = document.body.textContent ?? ''
    expect(allText).toMatch(/°C/)
  })

  it('shows humidity reading label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
  })

  it('shows wind speed label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('shows visibility label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('renders sensor recommendation section', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('renders 24-hour hourly forecast in forecast view', () => {
    render(<WeatherPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Forecast/i }))
    const allText = document.body.textContent ?? ''
    expect(allText).toMatch(/24-hour/i)
  })

  it('shows condition name from initial state (Partly Cloudy) in stats bar', () => {
    render(<WeatherPanel />)
    // Multiple "Partly Cloudy" text instances may appear
    const matches = screen.getAllByText(/Partly Cloudy/i)
    expect(matches.length).toBeGreaterThan(0)
  })
})
