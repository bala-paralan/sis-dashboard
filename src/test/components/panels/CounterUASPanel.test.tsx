import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      ['counterUasThreatDisplay', 'droneTrackPlayback'].includes(w.id)
        ? { ...w, visible: true }
        : w
    ),
  }))
  // Math.random() = 0.1 → Math.floor(0.1 * 3) = 0 initial contacts
  vi.spyOn(Math, 'random').mockReturnValue(0.1)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS Contacts count in the toolbar', () => {
    render(<CounterUASPanel />)
    // Multiple elements may include "UAS Contact" — verify at least one is present
    const matches = screen.getAllByText(/UAS Contact/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows zero contacts state when no drones detected', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/No UAS contacts detected/i)).toBeInTheDocument()
  })

  it('shows Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Notify QRT/i)).toBeInTheDocument()
  })

  it('shows alarm toggle button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/alarm/i)).toBeInTheDocument()
  })

  it('shows Active UAS Contacts section heading', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })
})
