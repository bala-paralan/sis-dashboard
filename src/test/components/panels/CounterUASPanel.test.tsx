import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
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

  it('shows Alarm Off button initially', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Alarm Off/i)).toBeInTheDocument()
  })

  it('toggles alarm state when alarm button is clicked', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByText(/Alarm Off/i)
    fireEvent.click(alarmBtn)
    expect(screen.getByText(/ALARM ON/i)).toBeInTheDocument()
  })

  it('shows Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Notify QRT/i)).toBeInTheDocument()
  })

  it('shows Active UAS Contacts heading', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('shows either empty-state message or contact cards', () => {
    render(<CounterUASPanel />)
    const noContacts = screen.queryByText(/No UAS contacts detected/i)
    const contactCards = document.querySelectorAll('[class*="cursor-pointer"]')
    expect(noContacts !== null || contactCards.length > 0).toBe(true)
  })
})
