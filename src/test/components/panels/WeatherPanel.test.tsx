import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WeatherPanel', () => {
  it('renders without crashing', () => {
    expect(() => render(<WeatherPanel />)).not.toThrow()
  })

  it('shows a temperature value (°C)', () => {
    render(<WeatherPanel />)
    expect(document.body.textContent).toMatch(/°C/)
  })

  it('shows humidity label', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/Humidity/i).length).toBeGreaterThan(0)
  })

  it('shows wind label', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/Wind/i).length).toBeGreaterThan(0)
  })

  it('shows visibility label', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/Visibility/i).length).toBeGreaterThan(0)
  })

  it('shows pressure label', () => {
    render(<WeatherPanel />)
    expect(screen.getAllByText(/Pressure/i).length).toBeGreaterThan(0)
  })

  it('shows a Forecast tab or section', () => {
    render(<WeatherPanel />)
    expect(document.body.textContent).toMatch(/Forecast/i)
  })

  it('shows weather condition (at least one known condition string)', () => {
    render(<WeatherPanel />)
    const conditionTexts = ['Clear', 'Partly Cloudy', 'Overcast', 'Fog', 'Rain', 'Drizzle']
    const found = conditionTexts.some((c) => screen.queryAllByText(new RegExp(c, 'i')).length > 0)
    expect(found).toBe(true)
  })
})
