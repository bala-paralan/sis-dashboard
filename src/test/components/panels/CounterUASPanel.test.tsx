import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows UAS Contacts status in toolbar', () => {
    render(<CounterUASPanel />)
    expect(screen.getAllByText(/UAS Contact/i).length).toBeGreaterThan(0)
  })

  it('shows Active UAS Contacts section heading when threat display is visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Active UAS Contacts/i)).toBeInTheDocument()
  })

  it('shows Track History section when drone track playback widget is visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })

  it('shows alarm toggle button', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.queryByText(/ALARM ON/i) || screen.queryByText(/Alarm Off/i)
    expect(alarmBtn).toBeInTheDocument()
  })

  it('shows Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Notify QRT/i)).toBeInTheDocument()
  })

  it('shows AIRSPACE CLEAR / No UAS contacts detected when no contacts', () => {
    render(<CounterUASPanel />)
    const clearMsg = screen.queryByText(/No UAS contacts detected/i)
    const contactItems = screen.queryAllByText(/COMMERCIAL|MILITARY|UNKNOWN/)
    expect(clearMsg !== null || contactItems.length > 0).toBe(true)
  })

  it('does not show drone track playback section when widget is hidden', () => {
    useSettingsStore.getState().toggleWidget('droneTrackPlayback')
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Track History/i)).not.toBeInTheDocument()
  })

  it('does not show UAS contacts section when counterUasThreatDisplay widget is hidden', () => {
    useSettingsStore.getState().toggleWidget('counterUasThreatDisplay')
    render(<CounterUASPanel />)
    expect(screen.queryByText(/Active UAS Contacts/i)).not.toBeInTheDocument()
  })
})
