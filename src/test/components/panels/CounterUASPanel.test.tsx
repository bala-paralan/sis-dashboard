import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
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

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS Contacts count in toolbar', () => {
    render(<CounterUASPanel />)
    expect(screen.getAllByText(/UAS Contact/i).length).toBeGreaterThan(0)
  })

  it('shows alarm toggle button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Alarm/i)).toBeInTheDocument()
  })

  it('shows Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Notify QRT/i)).toBeInTheDocument()
  })

  it('toggles alarm state when button is clicked', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByText(/Alarm/i)
    expect(alarmBtn.textContent).toMatch(/Alarm Off/i)
    fireEvent.click(alarmBtn)
    expect(screen.getByText(/ALARM ON/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/ALARM ON/i))
    expect(screen.getByText(/Alarm Off/i)).toBeInTheDocument()
  })

  it('shows Active UAS Contacts section heading', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('shows no-contact empty state or contact list', () => {
    render(<CounterUASPanel />)
    const noContact = screen.queryByText(/No UAS contacts detected/i)
    const uasLabel  = screen.queryByText(/UAS-/i)
    expect(noContact !== null || uasLabel !== null).toBe(true)
  })

  it('shows Track History section when droneTrackPlayback widget is enabled', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })

  it('hides threat display when counterUasThreatDisplay widget is disabled', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'counterUasThreatDisplay' ? { ...w, visible: false } : w
      ),
    })
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Active UAS Contacts/i)).not.toBeInTheDocument()
  })

  it('hides playback when droneTrackPlayback widget is disabled', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'droneTrackPlayback' ? { ...w, visible: false } : w
      ),
    })
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Track History/i)).not.toBeInTheDocument()
  })

  it('shows Export KML button in playback section', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Export KML/i)).toBeInTheDocument()
  })

  it('renders playback speed buttons', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText('1×')).toBeInTheDocument()
    expect(screen.getByText('2×')).toBeInTheDocument()
    expect(screen.getByText('4×')).toBeInTheDocument()
  })
})
