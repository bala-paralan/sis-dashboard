import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      ['navicGpsBoard', 'personnelTracker', 'gprScanViewer', 'madFieldStrengthMap', 'emergencyAlertDispatcher'].includes(w.id)
        ? { ...w, visible: true }
        : w,
    ),
  }))
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders personnel names from the patrol list', () => {
    render(<PersonnelPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Sharma|Verma|Singh|Kumar|Rao/)
  })

  it('renders patrol roles', () => {
    render(<PersonnelPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Patrol Alpha|Patrol Bravo|Patrol Charlie/)
  })

  it('shows Personnel tab label with count', () => {
    render(<PersonnelPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Personnel/)
  })

  it('shows battery percentage for personnel', () => {
    render(<PersonnelPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/%/)
  })

  it('renders CEP accuracy values for personnel', () => {
    render(<PersonnelPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/CEP:/)
  })

  it('renders GPR B-Scan section tab', () => {
    render(<PersonnelPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/GPR/i)
  })

  it('renders MAD field tab label', () => {
    render(<PersonnelPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/MAD/i)
  })

  it('renders node statistics bar', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Personnel:/i)).toBeInTheDocument()
  })

  it('renders check-in time information for personnel', () => {
    render(<PersonnelPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Check-in:/)
  })
})
