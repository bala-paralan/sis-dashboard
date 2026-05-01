/**
 * Alert API methods — typed wrappers around the backend REST API.
 */
import { apiFetch } from './client.js';
import type { Alert, ThreatLevel, SensorFamily } from '@/types/sensors';

export type { Alert };

export interface AlertListParams {
  threatLevel?: ThreatLevel | 'ALL';
  sensorFamily?: SensorFamily | 'ALL';
  acknowledged?: boolean;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AlertListResponse {
  total:   number;
  page:    number;
  limit:   number;
  count:   number;
  alerts:  Alert[];
}

export interface AcknowledgeInput {
  comment?: string;
}

export interface BulkAcknowledgeInput {
  ids:      string[];
  comment?: string;
}

export interface BulkAcknowledgeResponse {
  acknowledged: number;
  ids:          string[];
}

// ── List / fetch ──────────────────────────────────────────────────────────────

export const fetchAlerts = (params?: AlertListParams): Promise<AlertListResponse> => {
  const q = new URLSearchParams();
  if (params?.threatLevel && params.threatLevel !== 'ALL') q.set('threatLevel', params.threatLevel);
  if (params?.sensorFamily && params.sensorFamily !== 'ALL') q.set('sensorFamily', params.sensorFamily);
  if (params?.acknowledged !== undefined) q.set('acknowledged', String(params.acknowledged));
  if (params?.from)  q.set('from',  params.from);
  if (params?.to)    q.set('to',    params.to);
  if (params?.page)  q.set('page',  String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  return apiFetch<AlertListResponse>(`/alerts?${q.toString()}`);
};

// ── Acknowledge ───────────────────────────────────────────────────────────────

export const acknowledgeAlertApi = (id: string, input: AcknowledgeInput = {}): Promise<Alert> =>
  apiFetch<Alert>(`/alerts/${id}/acknowledge`, {
    method: 'POST',
    body:   JSON.stringify(input),
  });

export const bulkAcknowledgeAlerts = (input: BulkAcknowledgeInput): Promise<BulkAcknowledgeResponse> =>
  apiFetch<BulkAcknowledgeResponse>('/alerts/bulk-acknowledge', {
    method: 'POST',
    body:   JSON.stringify(input),
  });

// ── Dismiss ───────────────────────────────────────────────────────────────────

export const dismissAlert = (id: string): Promise<void> =>
  apiFetch<void>(`/alerts/${id}`, { method: 'DELETE' });

// ── Export ────────────────────────────────────────────────────────────────────

export const fetchAlertsCsvUrl = (params?: Omit<AlertListParams, 'page' | 'limit'>): string => {
  const base = (import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001') + '/alerts/export';
  const q = new URLSearchParams();
  if (params?.threatLevel && params.threatLevel !== 'ALL') q.set('threatLevel', params.threatLevel);
  if (params?.sensorFamily && params.sensorFamily !== 'ALL') q.set('sensorFamily', params.sensorFamily);
  if (params?.acknowledged !== undefined) q.set('acknowledged', String(params.acknowledged));
  if (params?.from) q.set('from', params.from);
  if (params?.to)   q.set('to',   params.to);
  q.set('format', 'csv');
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
};
