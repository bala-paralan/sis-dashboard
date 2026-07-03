import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useSystemStore.setState({
    theme: 'dark',
    scenario: 'NORMAL',
    connectionStatus: 'connected',
    health: null,
    sidebarCollapsed: false,
    activePanel: 'settings',
  })
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders all top-level tabs', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Widgets/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Panels/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Display/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Layout/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thresholds/i })).toBeInTheDocument()
  })

  it('shows Widgets tab content by default', () => {
    render(<SettingsPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Video|Mapping|Alerts|Radar|Acoustic/i)
  })

  it('switches to Panels tab when clicked', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Panels/i }))
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Live Tactical Map|Alert Management|Video/)
  })

  it('switches to Display tab when clicked', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Display/i }))
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Theme|Dark|Light/i)
  })

  it('renders theme toggle in Display tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Display/i }))
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Theme/i)
  })

  it('switches to Layout tab when clicked', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Layout/i }))
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Default Expanded|expanded/i)
  })

  it('switches to Thresholds tab when clicked', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Thresholds/i }))
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/CPU|GPU|RAM|Temperature/i)
  })

  it('renders Reset to Defaults button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
  })

  it('renders widget category sections in Widgets tab', () => {
    render(<SettingsPanel />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Video & Imaging|Alerts & Prioritisation/)
  })

  it('renders panel list in Panels tab with core panels', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Panels/i }))
    expect(screen.getByText(/Live Tactical Map/i)).toBeInTheDocument()
  })
})
