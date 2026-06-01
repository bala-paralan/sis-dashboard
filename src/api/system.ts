/**
 * System API methods — health status and scenario control.
 */
import { apiFetch } from './client.js';
import type { SystemHealth, ScenarioType } from '@/types/sensors';

export interface ScenarioResponse {
  current:   ScenarioType;
  updatedAt: string;
}

export const fetchSystemHealth = (nodeId?: string): Promise<SystemHealth> => {
  const q = new URLSearchParams();
  if (nodeId) q.set('nodeId', nodeId);
  return apiFetch<SystemHealth>(`/system/health?${q.toString()}`);
};

export const fetchScenario = (): Promise<ScenarioResponse> =>
  apiFetch<ScenarioResponse>('/system/scenario');

export const setScenario = (scenario: ScenarioType): Promise<ScenarioResponse> =>
  apiFetch<ScenarioResponse>('/system/scenario', {
    method: 'POST',
    body:   JSON.stringify({ scenario }),
  });
