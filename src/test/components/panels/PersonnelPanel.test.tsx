import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    expect(() => render(<PersonnelPanel />)).not.toThrow()
  })

  it('shows personnel names', () => {
    render(<PersonnelPanel />)
    // Uses hardcoded patrol names — at least one should be present
    const names = ['Sharma', 'Verma', 'Singh', 'Kumar', 'Rao']
    const found = names.some((n) => screen.queryAllByText(new RegExp(n, 'i')).length > 0)
    expect(found).toBe(true)
  })

  it('shows battery percentage for personnel', () => {
    render(<PersonnelPanel />)
    expect(document.body.textContent).toMatch(/%/)
  })

  it('shows tab navigation', () => {
    render(<PersonnelPanel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders without crash when widgets are hidden', () => {
    useSettingsStore.getState().toggleWidget('personnelTracker')
    expect(() => render(<PersonnelPanel />)).not.toThrow()
  })

  it('shows status indicators for each person', () => {
    render(<PersonnelPanel />)
    expect(document.body.textContent).toMatch(/ACTIVE|EMERGENCY|MISSED/i)
  })
})
