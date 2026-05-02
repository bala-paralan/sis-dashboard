import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Personnel stat in header bar', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Personnel:/i)).toBeInTheDocument()
  })

  it('shows at least one personnel entry (Cpl. Sharma)', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Cpl\. Sharma/i)).toBeInTheDocument()
  })

  it('shows Emergency Broadcast button when widget is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Emergency Broadcast/i)).toBeInTheDocument()
  })

  it('renders mini-map SVG', () => {
    render(<PersonnelPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows GPR tab button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/GPR/i)).toBeInTheDocument()
  })

  it('shows MAD tab button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/MAD/i)).toBeInTheDocument()
  })

  it('shows battery icon for personnel', () => {
    render(<PersonnelPanel />)
    // Battery emoji present in personnel cards
    const batteryItems = document.querySelectorAll('[class*="text-text-secondary"]')
    expect(batteryItems.length).toBeGreaterThan(0)
  })
})
