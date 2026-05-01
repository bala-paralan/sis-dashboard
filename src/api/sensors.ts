/**
 * Sensor Registry API methods — typed REST wrappers for sensor management.
 */
import { apiFetch } from './client.js';
import type { SensorStatus, SensorModality } from '@/types/sensors';

export type { SensorStatus, SensorModality };

export interface SensorThresholds {
  minValue?:        number;
  maxValue?:        number;
  qualityMin?:      number;
  alertOnOffline?:  boolean;
  alertOnDegraded?: boolean;
}

export interface SensorConfig {
  sensor_id:    string;
  name:         string;
  site_id:      string;
  bop_id:       string;
  location:     string | null;
  modality:     SensorModality;
  status:       SensorStatus;
  active:       boolean;
  firmware_ver: string | null;
  lat:          number | null;
  lon:          number | null;
  thresholds:   SensorThresholds;
  last_seen_at: string | null;
  created_at:   string;
  updated_at:   string;
}

export interface SensorListParams {
  modality?: SensorModality;
  status?:   SensorStatus;
  siteId?:   string;
  active?:   boolean;
  search?:   string;
  page?:     number;
  limit?:    number;
}

export interface SensorListResponse {
  total:   number;
  page:    number;
  limit:   number;
  count:   number;
  sensors: SensorConfig[];
}

export interface UpdateSensorConfigInput {
  name?:     string;
  location?: string;
  lat?:      number;
  lon?:      number;
  active?:   boolean;
}

// ── List / fetch ───────────────────────────────────────────────────────────────

export const fetchSensors = (params?: SensorListParams): Promise<SensorListResponse> => {
  const q = new URLSearchParams();
  if (params?.modality) q.set('modality', params.modality);
  if (params?.status)   q.set('status',   params.status);
  if (params?.siteId)   q.set('siteId',   params.siteId);
  if (params?.active !== undefined) q.set('active', String(params.active));
  if (params?.search)   q.set('search',   params.search);
  if (params?.page)     q.set('page',     String(params.page));
  if (params?.limit)    q.set('limit',    String(params.limit));
  return apiFetch<SensorListResponse>(`/sensors?${q.toString()}`);
};

export const fetchSensor = (id: string): Promise<SensorConfig> =>
  apiFetch<SensorConfig>(`/sensors/${id}`);

// ── Update ─────────────────────────────────────────────────────────────────────

export const updateSensorConfig = (
  id: string,
  input: UpdateSensorConfigInput,
): Promise<SensorConfig> =>
  apiFetch<SensorConfig>(`/sensors/${id}`, {
    method: 'PUT',
    body:   JSON.stringify(input),
  });

export const setSensorThresholds = (
  id: string,
  thresholds: SensorThresholds,
): Promise<SensorConfig> =>
  apiFetch<SensorConfig>(`/sensors/${id}/thresholds`, {
    method: 'PUT',
    body:   JSON.stringify(thresholds),
  });

export const toggleSensorActive = (id: string, active: boolean): Promise<SensorConfig> =>
  apiFetch<SensorConfig>(`/sensors/${id}/active`, {
    method: 'PATCH',
    body:   JSON.stringify({ active }),
  });
