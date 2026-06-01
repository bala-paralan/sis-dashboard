/**
 * Alert API methods — fetch, acknowledge, and dismiss alerts from the server.
 */
import { apiFetch } from './client.js';
import type { Alert, ThreatLevel, SensorFamily } from '@/types/sensors';

export interface AlertListResponse {
  total:  number;
  page:   number;
  limit:  number;
  count:  number;
  alerts: Alert[];
}

export const fetchAlerts = (params?: {
  threatLevel?:  ThreatLevel | 'ALL';
  sensorFamily?: SensorFamily | 'ALL';
  acknowledged?: boolean;
  page?:         number;
  limit?:        number;
}): Promise<AlertListResponse> => {
  const q = new URLSearchParams();
  if (params?.threatLevel  && params.threatLevel  !== 'ALL') q.set('threatLevel',  params.threatLevel);
  if (params?.sensorFamily && params.sensorFamily !== 'ALL') q.set('sensorFamily', params.sensorFamily);
  if (params?.acknowledged !== undefined) q.set('acknowledged', String(params.acknowledged));
  if (params?.page)  q.set('page',  String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  return apiFetch<AlertListResponse>(`/alerts?${q.toString()}`);
};

export const fetchAlert = (id: string): Promise<Alert> =>
  apiFetch<Alert>(`/alerts/${id}`);

export const acknowledgeAlert = (id: string, annotation?: string): Promise<Alert> =>
  apiFetch<Alert>(`/alerts/${id}/acknowledge`, {
    method: 'POST',
    body:   JSON.stringify({ annotation: annotation ?? '' }),
  });

export const dismissAlert = (id: string): Promise<void> =>
  apiFetch<void>(`/alerts/${id}`, { method: 'DELETE' });
