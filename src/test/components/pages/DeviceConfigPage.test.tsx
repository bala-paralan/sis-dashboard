import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeviceConfigPage } from '@/components/pages/DeviceConfigPage'

// matchMedia is not available in jsdom — provide a stub
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('DeviceConfigPage', () => {
  it('renders the page without crashing', () => {
    const { container } = render(<DeviceConfigPage />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows SensiConnect unit IDs on the Overview tab by default', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/SC-00/i).length).toBeGreaterThan(0)
  })

  it('renders the four tab buttons', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /port/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /data/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /deployment/i })).toBeInTheDocument()
  })

  it('switches to Port Configuration tab on click and shows interface types', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /port/i }))
    expect(screen.getAllByText(/RJ45|SMA|RS-485|GPIO/i).length).toBeGreaterThan(0)
  })

  it('switches to Data & Periodicity tab and shows rate or Hz info', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /data/i }))
    expect(screen.getAllByText(/period|rate|hz|kbps|stream/i).length).toBeGreaterThan(0)
  })

  it('switches to Deployment Topology tab and shows BOP node info', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /deployment/i }))
    expect(screen.getAllByText(/BOP|alpha|bravo/i).length).toBeGreaterThan(0)
  })
})
