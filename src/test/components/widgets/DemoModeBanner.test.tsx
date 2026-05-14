import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DemoModeBanner } from '@/components/widgets/DemoModeBanner'
import { useSystemStore } from '@/store/systemStore'

beforeEach(() => {
  useSystemStore.setState({ connectionStatus: 'disconnected' })
})

describe('DemoModeBanner', () => {
  it('renders when connection is disconnected', () => {
    useSystemStore.setState({ connectionStatus: 'disconnected' })
    render(<DemoModeBanner />)
    expect(screen.getByText(/DEMO MODE/i)).toBeTruthy()
  })

  it('renders when connection is connecting', () => {
    useSystemStore.setState({ connectionStatus: 'connecting' })
    render(<DemoModeBanner />)
    expect(screen.getByText(/DEMO MODE/i)).toBeTruthy()
  })

  it('renders when connection is reconnecting', () => {
    useSystemStore.setState({ connectionStatus: 'reconnecting' })
    render(<DemoModeBanner />)
    expect(screen.getByText(/DEMO MODE/i)).toBeTruthy()
  })

  it('does NOT render when connection is connected', () => {
    useSystemStore.setState({ connectionStatus: 'connected' })
    render(<DemoModeBanner />)
    expect(screen.queryByText(/DEMO MODE/i)).toBeNull()
  })

  it('shows the current connection status', () => {
    useSystemStore.setState({ connectionStatus: 'reconnecting' })
    render(<DemoModeBanner />)
    expect(screen.getByText(/reconnecting/i)).toBeTruthy()
  })
})
