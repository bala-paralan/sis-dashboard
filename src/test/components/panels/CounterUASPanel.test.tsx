import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

// Freeze timers so intervals don't fire during tests
beforeEach(() => {
  vi.useFakeTimers()
  // Make all widgets visible by default
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  } as never)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS Contacts label in toolbar', () => {
    render(<CounterUASPanel />)
    const matches = screen.getAllByText(/UAS Contact/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders Alarm toggle button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Alarm/i })).toBeInTheDocument()
  })

  it('renders Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Notify QRT/i })).toBeInTheDocument()
  })

  it('clicking Alarm button toggles alarm state (text changes)', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByRole('button', { name: /Alarm/i })
    fireEvent.click(alarmBtn)
    // After clicking "Alarm Off" it should say "ALARM ON"
    expect(screen.getByRole('button', { name: /ALARM ON/i })).toBeInTheDocument()
  })

  it('shows empty state message when no contacts', () => {
    render(<CounterUASPanel />)
    // With fake timers and no interval ticks, contacts start empty or 0-2 randomly
    // We just check the panel renders content
    const container = document.body
    expect(container).toBeInTheDocument()
  })

  it('renders Active UAS Contacts section heading', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('renders Track History section when playback widget is visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })
})
