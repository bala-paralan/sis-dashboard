import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows current conditions tab button', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Current/i)).toBeInTheDocument()
  })

  it('shows 24h Forecast tab button', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/24h Forecast/i)).toBeInTheDocument()
  })

  it('shows humidity label in metrics grid', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
  })

  it('shows wind label in metrics grid', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('shows visibility label in metrics grid', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('shows pressure label in metrics grid', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Pressure')).toBeInTheDocument()
  })

  it('shows Sensor Recommendation section', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/Sensor Recommendation/i)).toBeInTheDocument()
  })

  it('shows MOSDAC / IMD attribution', () => {
    render(<WeatherPanel />)
    expect(screen.getByText(/MOSDAC/i)).toBeInTheDocument()
  })
})
