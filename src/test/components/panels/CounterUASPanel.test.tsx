import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS contact count text in the toolbar', () => {
    render(<CounterUASPanel />)
    // Matches "0 UAS Contacts", "1 UAS Contact", "2 UAS Contacts", etc.
    const matches = screen.getAllByText(/UAS Contact/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows alarm toggle button', () => {
    render(<CounterUASPanel />)
    // Button starts as "Alarm Off"
    expect(screen.getByRole('button', { name: /alarm/i })).toBeInTheDocument()
  })

  it('shows Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Notify QRT/i })).toBeInTheDocument()
  })

  it('shows Active UAS Contacts section header when counterUasThreatDisplay is visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('shows Track History section when droneTrackPlayback is visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })

  it('toggles alarm state when alarm button is clicked', () => {
    render(<CounterUASPanel />)
    const alarmButton = screen.getByRole('button', { name: /alarm/i })
    // Initial state should show "Alarm Off"
    expect(alarmButton).toHaveTextContent(/alarm off/i)
    fireEvent.click(alarmButton)
    expect(alarmButton).toHaveTextContent(/alarm on/i)
  })

  it('hides counterUasThreatDisplay section when widget is toggled off', () => {
    useSettingsStore.getState().toggleWidget('counterUasThreatDisplay')
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Active UAS Contacts/i)).not.toBeInTheDocument()
  })
})
