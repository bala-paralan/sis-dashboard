import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  storeTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  apiFetch,
} from '@/api/client'

// ── helpers ──────────────────────────────────────────────────

function mockFetch(...responses: Array<Partial<Response>>) {
  const queue = responses.map((r) =>
    Promise.resolve({
      ok: r.ok ?? true,
      status: r.status ?? 200,
      statusText: r.statusText ?? 'OK',
      json: r.json ?? (() => Promise.resolve({})),
      headers: new Headers(),
      ...r,
    } as Response)
  )
  let idx = 0
  return vi.fn(() => queue[idx++] ?? queue[queue.length - 1])
}

beforeEach(() => {
  clearTokens()
  vi.restoreAllMocks()
})

afterEach(() => {
  clearTokens()
})

// ── Token storage ──────────────────────────────────────────────────────────────

describe('storeTokens / getAccessToken / getRefreshToken', () => {
  it('stores and retrieves access token', () => {
    storeTokens('acc-123', 'ref-456')
    expect(getAccessToken()).toBe('acc-123')
  })

  it('stores and retrieves refresh token', () => {
    storeTokens('acc-123', 'ref-456')
    expect(getRefreshToken()).toBe('ref-456')
  })

  it('clearTokens removes both tokens', () => {
    storeTokens('acc-123', 'ref-456')
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('returns null when no tokens stored', () => {
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})

// ── apiFetch — happy path ──────────────────────────────────────────────────────

describe('apiFetch — happy path', () => {
  it('returns parsed JSON on 200', async () => {
    global.fetch = mockFetch({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ hello: 'world' }),
    })
    const result = await apiFetch<{ hello: string }>('/test')
    expect(result).toEqual({ hello: 'world' })
  })

  it('returns undefined on 204 (no content)', async () => {
    global.fetch = mockFetch({
      ok: true,
      status: 204,
      json: () => Promise.resolve(null),
    })
    const result = await apiFetch<undefined>('/test')
    expect(result).toBeUndefined()
  })

  it('sets Content-Type: application/json header', async () => {
    const spy = mockFetch({ ok: true, status: 200, json: () => Promise.resolve({}) })
    global.fetch = spy
    await apiFetch('/test')
    const headers = spy.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('attaches Authorization Bearer header when access token exists', async () => {
    storeTokens('my-access-token', 'ref')
    const spy = mockFetch({ ok: true, status: 200, json: () => Promise.resolve({}) })
    global.fetch = spy
    await apiFetch('/test')
    const headers = spy.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer my-access-token')
  })

  it('does not set Authorization header when no token', async () => {
    const spy = mockFetch({ ok: true, status: 200, json: () => Promise.resolve({}) })
    global.fetch = spy
    await apiFetch('/test')
    const headers = spy.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Authorization')).toBeNull()
  })
})

// ── apiFetch — error handling ──────────────────────────────────────────────────

describe('apiFetch — error handling', () => {
  it('throws with server error message when response is not ok', async () => {
    global.fetch = mockFetch({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: 'Validation failed' }),
    })
    await expect(apiFetch('/test')).rejects.toThrow('Validation failed')
  })

  it('throws with statusText when error body has no error field', async () => {
    global.fetch = mockFetch({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    })
    await expect(apiFetch('/test')).rejects.toThrow('Internal Server Error')
  })

  it('throws with statusText when error body is not valid JSON', async () => {
    global.fetch = mockFetch({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: () => Promise.reject(new SyntaxError('not json')),
    })
    await expect(apiFetch('/test')).rejects.toThrow('Service Unavailable')
  })
})

// ── apiFetch — 401 auto-refresh ────────────────────────────────────────────────

describe('apiFetch — 401 auto-refresh', () => {
  it('retries with new token after 401 and successful refresh', async () => {
    storeTokens('old-access', 'valid-refresh')

    let callCount = 0
    global.fetch = vi.fn().mockImplementation((url: string) => {
      callCount++
      if (url.endsWith('/auth/refresh')) {
        // Refresh succeeds → store new tokens
        storeTokens('new-access', 'valid-refresh')
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ access_token: 'new-access', refresh_token: 'valid-refresh' }),
        } as Response)
      }
      if (callCount === 1) {
        // First call — return 401
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({ error: 'Unauthorized' }),
        } as Response)
      }
      // Second (retry) call — succeed
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'ok' }),
      } as Response)
    })

    const result = await apiFetch<{ data: string }>('/protected')
    expect(result).toEqual({ data: 'ok' })
    expect(callCount).toBeGreaterThanOrEqual(3) // first call + refresh + retry
  })

  it('clears tokens and throws when refresh token is missing on 401', async () => {
    // No tokens stored
    global.fetch = mockFetch({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    })
    await expect(apiFetch('/protected')).rejects.toThrow()
  })
})
