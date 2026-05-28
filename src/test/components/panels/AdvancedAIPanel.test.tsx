import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useAlertStore } from '@/store/alertStore'

beforeEach(() => {
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders heatmap section', () => {
    render(<AdvancedAIPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/heatmap|pattern|behavioural/i)
  })

  it('renders false alarm section', () => {
    render(<AdvancedAIPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/false alarm|alarm rate/i)
  })

  it('renders model confidence section', () => {
    render(<AdvancedAIPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/confidence|model|YOLO|LSTM/i)
  })

  it('renders SVG elements for heatmap or charts', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('renders time window selector (1h / 6h / 24h)', () => {
    render(<AdvancedAIPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/1h|6h|24h/i)
  })

  it('renders model or tracker labels', () => {
    render(<AdvancedAIPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/YOLO|LSTM|model|tracker|FAR/i)
  })

  it('renders percentage or numeric values', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getAllByText(/%/).length).toBeGreaterThan(0)
  })
})
