import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      ['counterUasThreatDisplay', 'droneTrackPlayback'].includes(w.id)
        ? { ...w, visible: true }
        : w,
    ),
  }))
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS contact count in toolbar', () => {
    render(<CounterUASPanel />)
    // text is "N UAS Contact(s)" inside body
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/UAS Contact/i)
  })

  it('renders the alarm toggle button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /alarm/i })).toBeInTheDocument()
  })

  it('renders the Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Notify QRT/i })).toBeInTheDocument()
  })

  it('toggles alarm state when alarm button is clicked', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByRole('button', { name: /alarm off/i })
    fireEvent.click(alarmBtn)
    expect(screen.getByRole('button', { name: /alarm on/i })).toBeInTheDocument()
    // Toggle back
    fireEvent.click(screen.getByRole('button', { name: /alarm on/i }))
    expect(screen.getByRole('button', { name: /alarm off/i })).toBeInTheDocument()
  })

  it('renders Active UAS Contacts section heading when widget is enabled', () => {
    render(<CounterUASPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Active UAS Contacts/i)
  })

  it('renders Track History section when droneTrackPlayback is enabled', () => {
    render(<CounterUASPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Track History/i)
  })

  it('hides Track History section when widget is disabled', () => {
    useSettingsStore.setState((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === 'droneTrackPlayback' ? { ...w, visible: false } : w,
      ),
    }))
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Track History/i)).not.toBeInTheDocument()
  })

  it('shows no contacts message or contact list', () => {
    render(<CounterUASPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/UAS Contact|No UAS contacts/i)
  })

  it('renders export KML button in track history', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: /Export KML/i })).toBeInTheDocument()
  })

  it('renders playback speed buttons', () => {
    render(<CounterUASPanel />)
    expect(screen.getByRole('button', { name: '1×' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2×' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4×' })).toBeInTheDocument()
  })
})
