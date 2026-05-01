import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { SensorDetailModal } from '@/components/sensors/SensorDetailModal'
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
})

describe('SensorDetailModal', () => {
  it('renders sensor name and id in header', () => {
    render(<SensorDetailModal sensor={makeSensor()} onClose={vi.fn()} />)
    expect(screen.getByText('Geophone Alpha')).toBeInTheDocument()
    expect(screen.getByText('S02-GEO-001')).toBeInTheDocument()
  })

  it('shows status badge with correct status text', () => {
    render(<SensorDetailModal sensor={makeSensor({ status: 'DEGRADED' })} onClose={vi.fn()} />)
    expect(screen.getByTestId('sensor-status-badge')).toHaveTextContent('DEGRADED')
  })

  it('pre-fills name and location inputs', () => {
    const sensor = makeSensor({ name: 'Gate 3 Sensor', location: 'South entrance' })
    render(<SensorDetailModal sensor={sensor} onClose={vi.fn()} />)
    expect(screen.getByTestId('sensor-name-input')).toHaveValue('Gate 3 Sensor')
    expect(screen.getByTestId('sensor-location-input')).toHaveValue('South entrance')
  })

  it('shows modality and site in metadata grid', () => {
    render(<SensorDetailModal sensor={makeSensor()} onClose={vi.fn()} />)
    expect(screen.getByText('SEISMIC')).toBeInTheDocument()
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
  })

  it('active toggle reflects sensor.active = true', () => {
    render(<SensorDetailModal sensor={makeSensor({ active: true })} onClose={vi.fn()} />)
    expect(screen.getByTestId('sensor-active-toggle')).toBeChecked()
  })

  it('active toggle reflects sensor.active = false', () => {
    render(<SensorDetailModal sensor={makeSensor({ active: false })} onClose={vi.fn()} />)
    expect(screen.getByTestId('sensor-active-toggle')).not.toBeChecked()
  })

  it('calls onClose when Cancel button clicked', () => {
    const onClose = vi.fn()
    render(<SensorDetailModal sensor={makeSensor()} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when ✕ button clicked', () => {
    const onClose = vi.fn()
    render(<SensorDetailModal sensor={makeSensor()} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close modal'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls updateConfig and setThresholds on Save', async () => {
    const sensor = makeSensor()
    useSensorStore.setState({ registryList: [sensor] })
    ;(sensorsApi.updateSensorConfig as Mock).mockResolvedValueOnce({ ...sensor, name: 'Updated' })
    ;(sensorsApi.setSensorThresholds as Mock).mockResolvedValueOnce(sensor)
    render(<SensorDetailModal sensor={sensor} onClose={vi.fn()} />)

    const nameInput = screen.getByTestId('sensor-name-input')
    fireEvent.change(nameInput, { target: { value: 'Updated' } })
    fireEvent.click(screen.getByTestId('save-btn'))

    await waitFor(() => {
      expect(sensorsApi.updateSensorConfig).toHaveBeenCalledWith('S02-GEO-001', expect.objectContaining({ name: 'Updated' }))
      expect(sensorsApi.setSensorThresholds).toHaveBeenCalledWith('S02-GEO-001', expect.any(Object))
    })
  })

  it('shows saved confirmation after successful save', async () => {
    const sensor = makeSensor()
    useSensorStore.setState({ registryList: [sensor] })
    ;(sensorsApi.updateSensorConfig as Mock).mockResolvedValueOnce(sensor)
    ;(sensorsApi.setSensorThresholds as Mock).mockResolvedValueOnce(sensor)
    render(<SensorDetailModal sensor={sensor} onClose={vi.fn()} />)
    fireEvent.click(screen.getByTestId('save-btn'))
    await waitFor(() => screen.getByTestId('modal-saved'))
    expect(screen.getByTestId('modal-saved')).toHaveTextContent('Saved successfully')
  })

  it('shows error when save fails', async () => {
    const sensor = makeSensor()
    useSensorStore.setState({ registryList: [sensor] })
    ;(sensorsApi.updateSensorConfig as Mock).mockRejectedValueOnce(new Error('Network error'))
    ;(sensorsApi.setSensorThresholds as Mock).mockResolvedValue(sensor)
    render(<SensorDetailModal sensor={sensor} onClose={vi.fn()} />)
    fireEvent.click(screen.getByTestId('save-btn'))
    await waitFor(() => screen.getByTestId('modal-error'))
    expect(screen.getByTestId('modal-error')).toHaveTextContent('Network error')
  })

  it('Save button is disabled when name is empty', () => {
    const sensor = makeSensor({ name: '' })
    render(<SensorDetailModal sensor={sensor} onClose={vi.fn()} />)
    // clear the input
    fireEvent.change(screen.getByTestId('sensor-name-input'), { target: { value: '' } })
    expect(screen.getByTestId('save-btn')).toBeDisabled()
  })

  it('quality-min slider is present and reflects threshold', () => {
    const sensor = makeSensor({ thresholds: { qualityMin: 0.75 } })
    render(<SensorDetailModal sensor={sensor} onClose={vi.fn()} />)
    const slider = screen.getByTestId('quality-min-slider')
    expect(slider).toHaveValue('0.75')
  })
})
