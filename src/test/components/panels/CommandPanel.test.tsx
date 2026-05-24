import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  })
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows node overview section', () => {
    render(<CommandPanel />)
    // Multi-node overview or similar section
    expect(document.body.textContent).toMatch(/Node|BOP|Sector/i)
  })

  it('shows incident report section', () => {
    render(<CommandPanel />)
    expect(document.body.textContent).toMatch(/Incident|Report|incident/i)
  })

  it('shows shift handover section', () => {
    render(<CommandPanel />)
    expect(document.body.textContent).toMatch(/Shift|Handover|Summary/i)
  })

  it('shows BOP node identifiers', () => {
    render(<CommandPanel />)
    const body = document.body.textContent ?? ''
    const hasNode = ['BOP-ALPHA', 'BOP-BETA', 'BOP-GAMMA'].some((n) => body.includes(n))
    expect(hasNode).toBe(true)
  })

  it('shows sensors online/total for nodes', () => {
    render(<CommandPanel />)
    // Node cards show "Sensors: X/Y" format
    expect(document.body.textContent).toMatch(/Sensors:/i)
  })

  it('shows online/degraded/offline status indicators', () => {
    render(<CommandPanel />)
    const body = document.body.textContent ?? ''
    const hasStatus = ['ONLINE', 'DEGRADED', 'OFFLINE'].some((s) => body.includes(s))
    expect(hasStatus).toBe(true)
  })

  it('renders without crashing when multi-node widget is disabled', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'multiNodeOverview' ? { ...w, visible: false } : w
      ),
    })
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
