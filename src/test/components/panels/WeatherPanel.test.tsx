import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WeatherPanel } from '@/components/panels/WeatherPanel'
import { useSettingsStore } from '@/store/settingsStore'

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}))

function setupMocks(weatherVisible = true) {
  const isWidgetVisible = (id: string) => {
    if (id === 'visibilityWeatherForecast') return weatherVisible
    return true
  }
  ;(useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { isWidgetVisible: typeof isWidgetVisible }) => unknown) =>
    selector({ isWidgetVisible })
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  setupMocks()
})

describe('WeatherPanel', () => {
  it('renders without crashing when weather widget is enabled', () => {
    const { container } = render(<WeatherPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows temperature in degrees Celsius', () => {
    render(<WeatherPanel />)
    // Initial temp is 28.4°C
    expect(screen.getByText(/28\.4°C/)).toBeInTheDocument()
  })

  it('shows humidity metric label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Humidity')).toBeInTheDocument()
  })

  it('shows wind metric label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('shows Visibility metric label', () => {
    render(<WeatherPanel />)
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('shows Current and Forecast view toggle buttons', () => {
    render(<WeatherPanel />)
    expect(screen.getByRole('button', { name: /Current/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /24h Forecast/i })).toBeInTheDocument()
  })

  it('clicking Forecast tab shows forecast content', () => {
    render(<WeatherPanel />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /24h Forecast/i }))
    })
    expect(screen.getByText(/24-hour hourly forecast/i)).toBeInTheDocument()
  })

  it('shows disabled message when weather widget is off', () => {
    setupMocks(false)
    render(<WeatherPanel />)
    expect(screen.getByText(/Weather widget disabled/i)).toBeInTheDocument()
  })
})
