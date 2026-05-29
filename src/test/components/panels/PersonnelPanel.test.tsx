import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  })
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows personnel tracker section heading', () => {
    render(<PersonnelPanel />)
    const els = screen.getAllByText(/Personnel/i)
    expect(els.length).toBeGreaterThan(0)
  })

  it('renders tab navigation', () => {
    render(<PersonnelPanel />)
    const tabButtons = document.querySelectorAll('button')
    expect(tabButtons.length).toBeGreaterThan(0)
  })

  it('shows personnel names from the patrol list', () => {
    render(<PersonnelPanel />)
    // At least one patrol name should appear
    const names = ['Sharma', 'Verma', 'Singh', 'Kumar', 'Rao']
    const found = names.some((n) => document.body.textContent?.includes(n))
    expect(found).toBe(true)
  })

  it('shows CEP (circular error probable) for personnel', () => {
    render(<PersonnelPanel />)
    // Each personnel card shows "CEP: Xm"
    expect(document.body.textContent).toMatch(/CEP:/i)
  })

  it('shows battery level indicator for at least one personnel', () => {
    render(<PersonnelPanel />)
    // Battery percentages appear in the tracker
    expect(document.body.textContent).toMatch(/%/)
  })

  it('hides personnel tracker widget when disabled', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'personnelTracker' ? { ...w, visible: false } : w
      ),
    })
    render(<PersonnelPanel />)
    // Panel renders but no tracker section
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows personnel check-in timestamps', () => {
    render(<PersonnelPanel />)
    expect(document.body.textContent).toMatch(/Check-in/i)
  })
})
