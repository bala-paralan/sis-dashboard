import { describe, it, expect, beforeEach } from 'vitest'
import { useGeofenceStore } from '@/store/geofenceStore'

const VERTICES: [number, number][] = [[21.9, 88.1], [21.9, 88.2], [21.8, 88.2], [21.8, 88.1]]

describe('geofenceStore', () => {
  beforeEach(() => {
    useGeofenceStore.setState({ zones: [] })
    localStorage.clear()
  })

  it('starts with empty zones', () => {
    expect(useGeofenceStore.getState().zones).toHaveLength(0)
  })

  it('addZone creates a zone with id and createdAt', () => {
    const zone = useGeofenceStore.getState().addZone({
      name: 'Test Zone',
      type: 'alert',
      color: '#F59E0B',
      vertices: VERTICES,
    })
    expect(zone.id).toBeTruthy()
    expect(zone.createdAt).toBeTruthy()
    expect(zone.name).toBe('Test Zone')
    expect(zone.type).toBe('alert')
    expect(useGeofenceStore.getState().zones).toHaveLength(1)
  })

  it('addZone persists to localStorage', () => {
    useGeofenceStore.getState().addZone({ name: 'Persist', type: 'exclusion', color: '#EF4444', vertices: VERTICES })
    const stored = JSON.parse(localStorage.getItem('sis-geofences') ?? '[]') as unknown[]
    expect(stored).toHaveLength(1)
  })

  it('deleteZone removes the zone', () => {
    const z = useGeofenceStore.getState().addZone({ name: 'Del', type: 'inclusion', color: '#10B981', vertices: VERTICES })
    useGeofenceStore.getState().deleteZone(z.id)
    expect(useGeofenceStore.getState().zones).toHaveLength(0)
  })

  it('updateZone changes name', () => {
    const z = useGeofenceStore.getState().addZone({ name: 'Old', type: 'alert', color: '#F59E0B', vertices: VERTICES })
    useGeofenceStore.getState().updateZone(z.id, { name: 'New' })
    const updated = useGeofenceStore.getState().zones.find((z2) => z2.id === z.id)
    expect(updated?.name).toBe('New')
  })

  it('can manage multiple zones', () => {
    useGeofenceStore.getState().addZone({ name: 'Z1', type: 'alert', color: '#F59E0B', vertices: VERTICES })
    useGeofenceStore.getState().addZone({ name: 'Z2', type: 'exclusion', color: '#EF4444', vertices: VERTICES })
    expect(useGeofenceStore.getState().zones).toHaveLength(2)
  })
})
