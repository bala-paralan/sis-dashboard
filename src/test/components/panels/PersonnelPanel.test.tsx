import { describe, it, expect, act } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows personnel count in the stats bar', () => {
    render(<PersonnelPanel />)
    // Stats bar: "Personnel: 5"
    expect(screen.getByText(/Personnel:/)).toBeInTheDocument()
  })

  it('renders all 5 patrol member names', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Cpl\. Sharma/)).toBeInTheDocument()
    expect(screen.getByText(/Sgt\. Verma/)).toBeInTheDocument()
    expect(screen.getByText(/Pvt\. Singh/)).toBeInTheDocument()
    expect(screen.getByText(/Cpl\. Kumar/)).toBeInTheDocument()
    expect(screen.getByText(/Sgt\. Rao/)).toBeInTheDocument()
  })

  it('renders patrol role labels', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Patrol Alpha/)).toBeInTheDocument()
    expect(screen.getByText(/Patrol Bravo/)).toBeInTheDocument()
  })

  it('shows Personnel tab button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/👥 Personnel/)).toBeInTheDocument()
  })

  it('shows GPR tab button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/⛏ GPR/)).toBeInTheDocument()
  })

  it('shows MAD tab button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/🧲 MAD/)).toBeInTheDocument()
  })

  it('switches to MAD tab and renders 4 MAD sensor rows', () => {
    render(<PersonnelPanel />)
    fireEvent.click(screen.getByText(/🧲 MAD/))
    expect(screen.getByText('MAD-01')).toBeInTheDocument()
    expect(screen.getByText('MAD-02')).toBeInTheDocument()
    expect(screen.getByText('MAD-03')).toBeInTheDocument()
    expect(screen.getByText('MAD-04')).toBeInTheDocument()
  })

  it('switches to GPR tab and shows radar heading', () => {
    render(<PersonnelPanel />)
    fireEvent.click(screen.getByText(/⛏ GPR/))
    expect(screen.getByText(/Ground Penetrating Radar/i)).toBeInTheDocument()
  })

  it('renders mini-map SVG for personnel positioning', () => {
    render(<PersonnelPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows battery percentage indicators', () => {
    render(<PersonnelPanel />)
    // Battery emoji with % shown for each personnel
    const battLabels = screen.getAllByText(/🔋/)
    expect(battLabels.length).toBeGreaterThan(0)
  })
})
