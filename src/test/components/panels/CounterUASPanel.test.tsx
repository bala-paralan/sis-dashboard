import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      w.id === 'counterUasThreatDisplay' || w.id === 'droneTrackPlayback'
        ? { ...w, visible: true }
        : w
    ),
  }))
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS contacts count label in toolbar', () => {
    render(<CounterUASPanel />)
    expect(screen.getAllByText(/UAS Contact/i).length).toBeGreaterThan(0)
  })

  it('renders alarm toggle button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Alarm Off|ALARM ON/i })).toBeInTheDocument()
  })

  it('renders Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Notify QRT/i })).toBeInTheDocument()
  })

  it('toggles alarm state on button click', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByRole('button', { name: /Alarm Off/i })
    fireEvent.click(alarmBtn)
    expect(screen.getByRole('button', { name: /ALARM ON/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /ALARM ON/i }))
    expect(screen.getByRole('button', { name: /Alarm Off/i })).toBeInTheDocument()
  })

  it('shows Active UAS Contacts heading', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('shows Track History section when droneTrackPlayback is visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })

  it('renders Export KML button in track history', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Export KML/i })).toBeInTheDocument()
  })

  it('renders playback speed buttons 1× 2× 4×', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText('1×')).toBeInTheDocument()
    expect(screen.getByText('2×')).toBeInTheDocument()
    expect(screen.getByText('4×')).toBeInTheDocument()
  })

  it('does not show threat display section when counterUasThreatDisplay is disabled', () => {
    useSettingsStore.setState((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === 'counterUasThreatDisplay' ? { ...w, visible: false } : w
      ),
    }))
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Active UAS Contacts/i)).not.toBeInTheDocument()
  })
})
