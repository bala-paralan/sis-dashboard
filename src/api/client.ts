/**
 * Typed API client — thin fetch wrapper.
 * Reads/stores JWT tokens; auto-refreshes on 401.
 */

const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001';

const STORAGE_ACCESS  = 'sos_access_token';
const STORAGE_REFRESH = 'sos_refresh_token';

// ── Token storage ─────────────────────────────────────────────────────────────

export const storeTokens = (access: string, refresh: string): void => {
  localStorage.setItem(STORAGE_ACCESS,  access);
  localStorage.setItem(STORAGE_REFRESH, refresh);
};

export const clearTokens = (): void => {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
};

export const getAccessToken  = (): string | null => localStorage.getItem(STORAGE_ACCESS);
export const getRefreshToken = (): string | null => localStorage.getItem(STORAGE_REFRESH);

// ── Core fetch ────────────────────────────────────────────────────────────────

let refreshing: Promise<void> | null = null;

const doRefresh = async (): Promise<void> => {
  const refresh = getRefreshToken();
  if (!refresh) { clearTokens(); return; }
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) { clearTokens(); return; }
  const data = await res.json() as { access_token: string; refresh_token: string };
  storeTokens(data.access_token, data.refresh_token);
};

export const apiFetch = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const headers = new Headers(init.headers);
  const access = getAccessToken();
  if (access) headers.set('Authorization', `Bearer ${access}`);
  headers.set('Content-Type', 'application/json');

  let res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && getRefreshToken()) {
    if (!refreshing) {
      refreshing = doRefresh().finally(() => { refreshing = null; });
    }
    await refreshing;

    const newAccess = getAccessToken();
    if (newAccess) headers.set('Authorization', `Bearer ${newAccess}`);
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(body.error ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};
