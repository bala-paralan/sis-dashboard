import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Nodes stat in header bar', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('renders node cards', () => {
    render(<CommandPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
  })

  it('shows sort buttons', () => {
    render(<CommandPanel />)
    expect(screen.getByText('status')).toBeInTheDocument()
    expect(screen.getByText('threat')).toBeInTheDocument()
    expect(screen.getByText('alerts')).toBeInTheDocument()
  })

  it('switches to threat sort when button clicked', () => {
    render(<CommandPanel />)
    const threatBtn = screen.getByText('threat')
    fireEvent.click(threatBtn)
    expect(threatBtn.className).toContain('bg-accent-blue')
  })

  it('shows offline node status', () => {
    render(<CommandPanel />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('shows online node status', () => {
    render(<CommandPanel />)
    const onlineEls = screen.getAllByText('ONLINE')
    expect(onlineEls.length).toBeGreaterThan(0)
  })

  it('shows sub-tabs when multiple tabs enabled', () => {
    render(<CommandPanel />)
    const nodesTab = screen.getByText('▣ Nodes')
    expect(nodesTab).toBeInTheDocument()
  })
})
