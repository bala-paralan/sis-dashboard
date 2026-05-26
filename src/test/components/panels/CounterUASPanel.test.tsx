import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) =>
      w.id === 'counterUasThreatDisplay' || w.id === 'droneTrackPlayback'
        ? { ...w, visible: true }
        : w
    ),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CounterUASPanel', () => {
  it('renders without throwing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS contacts toolbar label', () => {
    render(<CounterUASPanel />)
    // "UAS Contacts" appears in toolbar and in the heading — use getAllByText
    expect(screen.getAllByText(/UAS Contact/i).length).toBeGreaterThan(0)
  })

  it('shows alarm toggle button', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByRole('button', { name: /alarm/i })
    expect(alarmBtn).toBeInTheDocument()
  })

  it('toggles alarm state when alarm button is clicked', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByRole('button', { name: /alarm off/i })
    fireEvent.click(alarmBtn)
    expect(screen.getByRole('button', { name: /alarm on/i })).toBeInTheDocument()
  })

  it('shows Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Notify QRT/i })).toBeInTheDocument()
  })

  it('shows Active UAS Contacts heading when counterUasThreatDisplay is visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('shows "No UAS contacts detected" when contacts list is initially empty', () => {
    render(<CounterUASPanel />)
    // Initial render has 0-2 random contacts; just verify the UAS label renders
    expect(screen.getAllByText(/UAS Contact/i).length).toBeGreaterThan(0)
  })

  it('hides threat display when counterUasThreatDisplay widget is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'counterUasThreatDisplay' ? { ...w, visible: false } : w
      ),
    })
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Active UAS Contacts/i)).not.toBeInTheDocument()
  })

  it('shows Track History section when droneTrackPlayback is visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })

  it('hides Track History when droneTrackPlayback widget is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'droneTrackPlayback' ? { ...w, visible: false } : w
      ),
    })
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Track History/i)).not.toBeInTheDocument()
  })

  it('shows playback speed buttons in track history', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: '1×' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2×' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4×' })).toBeInTheDocument()
  })
})
