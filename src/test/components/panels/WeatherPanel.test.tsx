import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    isWidgetVisible: () => true,
  })
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows temperature label', () => {
    render(<WeatherPanel />)
    // temp and dew point both show °C
    expect(screen.getAllByText(/°C/).length).toBeGreaterThan(0)
  })

  it('shows humidity label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Humidity/i)).toBeInTheDocument()
  })

  it('shows wind label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Wind/i)).toBeInTheDocument()
  })

  it('shows visibility label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Visibility/i)).toBeInTheDocument()
  })

  it('shows pressure label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Pressure/i)).toBeInTheDocument()
  })

  it('shows forecast view toggle', () => {
    render(<WeatherPanel />)
    // the "24h Forecast" view toggle button is always visible
    expect(screen.getAllByText(/Forecast/i).length).toBeGreaterThan(0)
  })

  it('shows sensor recommendation section', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('shows MOSDAC / IMD data source label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/MOSDAC/i)).toBeInTheDocument()
  })
})
