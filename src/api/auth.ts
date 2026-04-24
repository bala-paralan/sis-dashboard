/**
 * Auth API methods.
 */
import { apiFetch, storeTokens, clearTokens, getRefreshToken } from './client.js';

export interface AuthTokens {
  access_token:  string;
  refresh_token: string;
  token_type:    string;
}

export interface MeResponse {
  id:          string;
  email:       string;
  displayName: string | null;
  role:        'ADMIN' | 'OPERATOR' | 'VIEWER';
  createdAt:   string;
}

export const login = async (email: string, password: string): Promise<MeResponse> => {
  const tokens = await apiFetch<AuthTokens>('/auth/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
  storeTokens(tokens.access_token, tokens.refresh_token);
  return apiFetch<MeResponse>('/auth/me');
};

export const logout = async (): Promise<void> => {
  const refresh = getRefreshToken();
  if (refresh) {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body:   JSON.stringify({ refresh_token: refresh }),
    }).catch(() => undefined);
  }
  clearTokens();
};

export const getMe = (): Promise<MeResponse> => apiFetch<MeResponse>('/auth/me');
