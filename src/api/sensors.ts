/**
 * Sensor REST API — typed wrappers around apiFetch for sensor catalogue
 * and historical readings. Used as a fallback when WebSocket is unavailable.
 */
import { apiFetch } from './client.js'
import type { SensorPayload, SensorModality } from '@/types/sensors'

export interface SensorCatalogEntry {
  sensor_id: string
  modality: SensorModality
  site_id: string
  bop_id: string
  sensor_status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE'
  firmware_ver?: string
  lat?: number
  lon?: number
}

export const getSensors = (): Promise<SensorCatalogEntry[]> =>
  apiFetch<SensorCatalogEntry[]>('/sensors')

export const getSensorById = (id: string): Promise<SensorPayload> =>
  apiFetch<SensorPayload>(`/sensors/${encodeURIComponent(id)}`)

export const getSensorHistory = (
  id: string,
  from: string,
  to: string,
): Promise<SensorPayload[]> =>
  apiFetch<SensorPayload[]>(
    `/sensors/${encodeURIComponent(id)}/history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  )
