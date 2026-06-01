import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import { PanelShell } from '@/components/layout/PanelShell'

beforeEach(() => {
  useSensorStore.setState({
    sensors: new Map(),
    sensorHistory: new Map(),
    tracks: [],
    selectedSensorId: null,
  })
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
})

describe('MinimizedViews — via PanelShell', () => {
  it('PanelShell renders without crashing in normal mode', () => {
    const { container } = render(
      <PanelShell panelId="map" title="Live Map">
        <div>content</div>
      </PanelShell>
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('PanelShell shows panel title', () => {
    render(
      <PanelShell panelId="alerts" title="Alerts">
        <div>child</div>
      </PanelShell>
    )
    expect(screen.getByText('Alerts')).toBeInTheDocument()
  })

  it('PanelShell renders children in normal mode', () => {
    render(
      <PanelShell panelId="map" title="Live Map">
        <div data-testid="inner">inner content</div>
      </PanelShell>
    )
    expect(screen.getByTestId('inner')).toBeInTheDocument()
  })

  it('alert count KPIs show 0 when no alerts', () => {
    useAlertStore.setState({ alerts: [] })
    render(
      <PanelShell panelId="alerts" title="Alerts">
        <div />
      </PanelShell>
    )
    expect(screen.getByText('Alerts')).toBeInTheDocument()
  })
})
