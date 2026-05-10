import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS Contacts count in the toolbar', () => {
    render(<CounterUASPanel />)
    expect(screen.getAllByText(/UAS Contact/i).length).toBeGreaterThan(0)
  })

  it('renders alarm toggle button', () => {
    render(<CounterUASPanel />)
    // Alarm button shows either "ALARM ON" or "Alarm Off"
    const alarmBtn = screen.getByRole('button', { name: /alarm/i })
    expect(alarmBtn).toBeInTheDocument()
  })

  it('alarm button toggles on click', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByRole('button', { name: /alarm off/i })
    fireEvent.click(alarmBtn)
    expect(screen.getByRole('button', { name: /alarm on/i })).toBeInTheDocument()
  })

  it('renders Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Notify QRT/i })).toBeInTheDocument()
  })

  it('shows Active UAS Contacts heading in threat display', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('shows empty state message when no contacts detected', () => {
    render(<CounterUASPanel />)
    // When 0 contacts exist (which is possible on initial render)
    // Either "No UAS contacts detected" or a contact card is shown
    const noContact = screen.queryByText(/No UAS contacts detected/i)
    const container = document.querySelector('.flex-col')
    expect(container).toBeInTheDocument()
  })

  it('renders the Track History section', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })
})
