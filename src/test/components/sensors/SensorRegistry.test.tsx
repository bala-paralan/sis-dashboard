import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { SensorRegistry } from '@/components/sensors/SensorRegistry'
import { useSensorStore } from '@/store/sensorStore'
import * as sensorsApi from '@/api/sensors'
import type { SensorConfig } from '@/api/sensors'

vi.mock('@/api/sensors')

function makeSensor(overrides?: Partial<SensorConfig>): SensorConfig {
  return {
    sensor_id:    'S02-GEO-001',
    name:         'Geophone Alpha',
    site_id:      'BOP-ALPHA-01',
    bop_id:       'BOP-001',
    location:     'North perimeter',
    modality:     'SEISMIC',
    status:       'ONLINE',
    active:       true,
    firmware_ver: '2.1.0',
    lat:          21.9452,
    lon:          88.1234,
    thresholds:   { qualityMin: 0.5, alertOnOffline: true, alertOnDegraded: true },
    last_seen_at: '2026-04-11T10:00:00.000Z',
    created_at:   '2026-01-01T00:00:00.000Z',
    updated_at:   '2026-04-11T10:00:00.000Z',
    ...overrides,
  }
}

const emptyResponse = { total: 0, page: 1, limit: 30, count: 0, sensors: [] }

beforeEach(() => {
  vi.clearAllMocks()
  useSensorStore.setState({
    sensors:            new Map(),
    sensorHistory:      new Map(),
    tracks:             [],
    selectedSensorId:   null,
    registryList:       [],
    registryTotal:      0,
    registryPage:       1,
    registryLimit:      30,
    registryLoading:    false,
    registryError:      null,
    selectedRegistryId: null,
  })
  // Default: return empty list
  ;(sensorsApi.fetchSensors as Mock).mockResolvedValue(emptyResponse)
})

describe('SensorRegistry', () => {
  it('renders the registry container', async () => {
    render(<SensorRegistry />)
    await waitFor(() => {
      expect(screen.getByTestId('sensor-registry')).toBeInTheDocument()
    })
  })

  it('shows empty state when no sensors match', async () => {
    ;(sensorsApi.fetchSensors as Mock).mockResolvedValueOnce(emptyResponse)
    render(<SensorRegistry />)
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })
  })

  it('renders sensor rows when data loads', async () => {
    ;(sensorsApi.fetchSensors as Mock).mockResolvedValue({
      total: 2, page: 1, limit: 30, count: 2,
      sensors: [
        makeSensor({ sensor_id: 'S-1', name: 'Sensor One' }),
        makeSensor({ sensor_id: 'S-2', name: 'Sensor Two' }),
      ],
    })
    render(<SensorRegistry />)
    await waitFor(() => {
      expect(screen.getByTestId('sensor-row-S-1')).toBeInTheDocument()
      expect(screen.getByTestId('sensor-row-S-2')).toBeInTheDocument()
    })
    expect(screen.getByText('Sensor One')).toBeInTheDocument()
    expect(screen.getByText('Sensor Two')).toBeInTheDocument()
  })

  it('shows loading skeletons while loading', async () => {
    let resolveLoad!: (v: unknown) => void
    ;(sensorsApi.fetchSensors as Mock).mockReturnValueOnce(
      new Promise((res) => { resolveLoad = res })
    )
    render(<SensorRegistry />)
    // Set loading manually to verify skeleton renders
    useSensorStore.setState({ registryLoading: true, registryList: [] })
    // Skeleton rows have animate-pulse class
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
    resolveLoad(emptyResponse)
  })

  it('shows error banner when registryError is set', async () => {
    ;(sensorsApi.fetchSensors as Mock).mockRejectedValueOnce(new Error('API down'))
    render(<SensorRegistry />)
    await waitFor(() => {
      expect(screen.getByTestId('registry-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('registry-error')).toHaveTextContent('API down')
  })

  it('search input updates and triggers load on submit', async () => {
    ;(sensorsApi.fetchSensors as Mock).mockResolvedValue(emptyResponse)
    render(<SensorRegistry />)
    // Wait for initial load to complete
    await waitFor(() => expect(sensorsApi.fetchSensors).toHaveBeenCalledTimes(1))

    const callCount = (sensorsApi.fetchSensors as Mock).mock.calls.length
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'geo' } })
    fireEvent.submit(searchInput.closest('form')!)
    await waitFor(() =>
      expect(sensorsApi.fetchSensors).toHaveBeenCalledTimes(callCount + 1)
    )
    const lastCall = (sensorsApi.fetchSensors as Mock).mock.calls.at(-1)![0]
    expect(lastCall).toMatchObject({ search: 'geo' })
  })

  it('modality filter triggers reload', async () => {
    ;(sensorsApi.fetchSensors as Mock).mockResolvedValue(emptyResponse)
    render(<SensorRegistry />)
    await waitFor(() => expect(sensorsApi.fetchSensors).toHaveBeenCalledTimes(1))

    const callCount = (sensorsApi.fetchSensors as Mock).mock.calls.length
    const modalitySelect = screen.getByTestId('modality-filter')
    fireEvent.change(modalitySelect, { target: { value: 'ACOUSTIC' } })
    await waitFor(() =>
      expect(sensorsApi.fetchSensors).toHaveBeenCalledTimes(callCount + 1)
    )
    const lastCall = (sensorsApi.fetchSensors as Mock).mock.calls.at(-1)![0]
    expect(lastCall).toMatchObject({ modality: 'ACOUSTIC' })
  })

  it('clicking a sensor row opens the detail modal', async () => {
    ;(sensorsApi.fetchSensors as Mock).mockResolvedValue({
      total: 1, page: 1, limit: 30, count: 1,
      sensors: [makeSensor({ sensor_id: 'S-1', name: 'Gate Sensor' })],
    })
    render(<SensorRegistry />)
    await waitFor(() => screen.getByTestId('sensor-row-S-1'))
    fireEvent.click(screen.getByTestId('sensor-row-S-1'))
    await waitFor(() => screen.getByTestId('sensor-detail-modal'))
    expect(screen.getByTestId('sensor-detail-modal')).toBeInTheDocument()
  })

  it('pagination shows total count', async () => {
    ;(sensorsApi.fetchSensors as Mock).mockResolvedValue({
      total: 75, page: 1, limit: 30, count: 30,
      sensors: Array.from({ length: 30 }, (_, i) => makeSensor({ sensor_id: `S-${i}` })),
    })
    render(<SensorRegistry />)
    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toHaveTextContent('75 sensors total')
    })
  })
})
