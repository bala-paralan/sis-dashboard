/**
 * Sensor API methods — REST hydration for sensor list and status.
 */
import { apiFetch } from './client.js';
import type { SensorPayload, SensorStatus, SensorModality } from '@/types/sensors';

export interface SensorListResponse {
  total:   number;
  page:    number;
  limit:   number;
  count:   number;
  sensors: SensorPayload[];
}

export const fetchSensors = (params?: {
  siteId?:   string;
  bopId?:    string;
  status?:   SensorStatus;
  modality?: SensorModality;
  page?:     number;
  limit?:    number;
}): Promise<SensorListResponse> => {
  const q = new URLSearchParams();
  if (params?.siteId)   q.set('siteId',   params.siteId);
  if (params?.bopId)    q.set('bopId',    params.bopId);
  if (params?.status)   q.set('status',   params.status);
  if (params?.modality) q.set('modality', params.modality);
  if (params?.page)     q.set('page',     String(params.page));
  if (params?.limit)    q.set('limit',    String(params.limit));
  return apiFetch<SensorListResponse>(`/sensors?${q.toString()}`);
};

export const fetchSensor = (id: string): Promise<SensorPayload> =>
  apiFetch<SensorPayload>(`/sensors/${id}`);

export const acknowledgeSensor = (id: string): Promise<void> =>
  apiFetch<void>(`/sensors/${id}/acknowledge`, { method: 'POST' });
