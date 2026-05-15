import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}))

function setupMocks(overrides: Record<string, boolean> = {}) {
  const defaults: Record<string, boolean> = {
    counterUasThreatDisplay: true,
    droneTrackPlayback: true,
    ...overrides,
  }
  const isWidgetVisible = (id: string) => defaults[id] ?? true
  ;(useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { isWidgetVisible: typeof isWidgetVisible }) => unknown) =>
    selector({ isWidgetVisible })
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  setupMocks()
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS Contacts count in the toolbar', () => {
    render(<CounterUASPanel />)
    // Multiple elements contain "UAS Contact" text; just assert at least one exists
    expect(screen.getAllByText(/UAS Contact/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows the Alarm toggle button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Alarm/i })).toBeInTheDocument()
  })

  it('shows the Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Notify QRT/i })).toBeInTheDocument()
  })

  it('shows Active UAS Contacts heading', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('clicking the Alarm button toggles alarm state', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByRole('button', { name: /Alarm/i })
    act(() => {
      fireEvent.click(alarmBtn)
    })
    // After click alarm should be "ON"
    expect(screen.getByRole('button', { name: /ALARM ON/i })).toBeInTheDocument()
  })

  it('shows Track History section when droneTrackPlayback widget is enabled', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })
})
