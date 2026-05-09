import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders patrol personnel names', () => {
    render(<PersonnelPanel />)
    // Names rendered as "P01: Cpl. Sharma" — use queryAll to avoid multiple-match error
    const nameEls = screen.queryAllByText(/Sharma|Verma|Singh|Kumar|Rao/i)
    expect(nameEls.length).toBeGreaterThan(0)
  })

  it('renders personnel role labels', () => {
    render(<PersonnelPanel />)
    const roleEls = screen.queryAllByText(/Patrol Alpha|Patrol Bravo|Patrol Charlie|QRT Lead|Perimeter Watch/i)
    expect(roleEls.length).toBeGreaterThan(0)
  })

  it('renders battery percentage values for each person', () => {
    render(<PersonnelPanel />)
    const percentages = screen.queryAllByText(/%/)
    expect(percentages.length).toBeGreaterThan(0)
  })

  it('renders CEP accuracy values', () => {
    render(<PersonnelPanel />)
    const cepEls = screen.queryAllByText(/CEP:/i)
    expect(cepEls.length).toBeGreaterThan(0)
  })

  it('renders check-in time labels', () => {
    render(<PersonnelPanel />)
    const checkInEls = screen.queryAllByText(/Check-in:/i)
    expect(checkInEls.length).toBeGreaterThan(0)
  })

  it('renders personnel panel content section', () => {
    render(<PersonnelPanel />)
    // Panel renders — verify some content is present
    const divs = document.querySelectorAll('div')
    expect(divs.length).toBeGreaterThan(5)
  })

  it('does not crash when navicGpsBoard widget is disabled', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'navicGpsBoard' ? { ...w, visible: false } : w
      ),
    })
    expect(() => render(<PersonnelPanel />)).not.toThrow()
  })
})
