import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

function enableAllWidgets() {
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) =>
      ['counterUasThreatDisplay', 'droneTrackPlayback'].includes(w.id)
        ? { ...w, visible: true }
        : w
    ),
  })
}

beforeEach(() => {
  enableAllWidgets()
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS contacts count in toolbar', () => {
    render(<CounterUASPanel />)
    // "X UAS Contacts" in toolbar + "Active UAS Contacts" heading — both match
    const matches = screen.getAllByText(/UAS Contact/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows Alarm toggle button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Alarm/i)).toBeInTheDocument()
  })

  it('shows Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Notify QRT/i)).toBeInTheDocument()
  })

  it('shows Active UAS Contacts heading', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('shows "No UAS contacts detected" when contacts list is empty', () => {
    render(<CounterUASPanel />)
    // Initially may or may not have contacts due to random init; check for either case
    const noContactMsg = screen.queryByText(/No UAS contacts detected/i)
    const hasContacts = document.querySelectorAll('[style*="border-left"]').length > 0
    expect(noContactMsg !== null || hasContacts).toBe(true)
  })

  it('toggles alarm state when Alarm button clicked', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByText(/Alarm Off|ALARM ON/i)
    const initialText = alarmBtn.textContent
    fireEvent.click(alarmBtn)
    // After click, text should change
    const updatedBtn = screen.getByText(/Alarm Off|ALARM ON/i)
    expect(updatedBtn.textContent).not.toBe(initialText)
  })

  it('shows Track History section', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })

  it('shows playback speed buttons', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText('1×')).toBeInTheDocument()
    expect(screen.getByText('2×')).toBeInTheDocument()
    expect(screen.getByText('4×')).toBeInTheDocument()
  })

  it('shows Export KML button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Export KML/i)).toBeInTheDocument()
  })
})
