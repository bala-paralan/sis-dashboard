import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    isWidgetVisible: () => true,
  })
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CounterUASPanel />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows UAS Contacts label', () => {
    render(<CounterUASPanel />)
    // toolbar + heading both contain "UAS Contact"
    expect(screen.getAllByText(/UAS Contact/i).length).toBeGreaterThan(0)
  })

  it('renders Alarm toggle button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Alarm/i)).toBeInTheDocument()
  })

  it('toggles alarm state on button click', () => {
    render(<CounterUASPanel />)
    const alarmBtn = screen.getByText(/Alarm Off/i)
    fireEvent.click(alarmBtn)
    expect(screen.getByText(/ALARM ON/i)).toBeInTheDocument()
  })

  it('renders Notify QRT button', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Notify QRT/i)).toBeInTheDocument()
  })

  it('renders Active UAS Contacts section', () => {
    render(<CounterUASPanel />)
    expect(screen.getAllByText(/Active UAS/i).length).toBeGreaterThan(0)
  })

  it('renders Export KML button in Track History', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Export KML/i)).toBeInTheDocument()
  })

  it('renders Track History section when widget visible', () => {
    render(<CounterUASPanel />)
    expect(screen.getByText(/Track History/i)).toBeInTheDocument()
  })
})
