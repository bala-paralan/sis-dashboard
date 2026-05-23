import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({
      ...w,
      visible: true,
    })),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows node count in stats bar', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('shows CIBMS LINK ACTIVE when widget enabled', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/CIBMS LINK ACTIVE/i)).toBeInTheDocument()
  })

  it('shows Nodes tab button', () => {
    render(<CommandPanel />)
    expect(screen.getAllByText(/Nodes/i).length).toBeGreaterThan(0)
  })

  it('shows Incident tab button', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Incident/i)).toBeInTheDocument()
  })

  it('shows Handover tab button', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Handover/i)).toBeInTheDocument()
  })

  it('shows BOP node IDs on nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-ECHO-01')).toBeInTheDocument()
  })

  it('shows ONLINE/DEGRADED/OFFLINE node statuses', () => {
    render(<CommandPanel />)
    expect(screen.getAllByText('ONLINE').length).toBeGreaterThan(0)
    expect(screen.getAllByText('OFFLINE').length).toBeGreaterThan(0)
  })

  it('shows OFFLINE warning badge when offline nodes exist', () => {
    render(<CommandPanel />)
    expect(screen.getAllByText(/OFFLINE/i).length).toBeGreaterThan(0)
  })

  it('switches to Incident tab and shows textarea', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/Incident/i))
    const textarea = screen.getByPlaceholderText(/Add narrative description/i)
    expect(textarea).toBeInTheDocument()
  })

  it('switches to Handover tab and shows textarea', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/Handover/i))
    const textarea = screen.getByPlaceholderText(/Key incidents and handover notes/i)
    expect(textarea).toBeInTheDocument()
  })

  it('can type in incident report textarea', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/Incident/i))
    const textarea = screen.getByPlaceholderText(/Add narrative description/i)
    fireEvent.change(textarea, { target: { value: 'Test incident report' } })
    expect((textarea as HTMLTextAreaElement).value).toBe('Test incident report')
  })

  it('shows sort options on nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Status/i)).toBeInTheDocument()
  })

  it('hides CIBMS when cibmsNatgridFeedMonitor widget is disabled', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'cibmsNatgridFeedMonitor' ? { ...w, visible: false } : w
      ),
    })
    render(<CommandPanel />)
    expect(screen.queryByText(/CIBMS LINK ACTIVE/i)).not.toBeInTheDocument()
  })
})
