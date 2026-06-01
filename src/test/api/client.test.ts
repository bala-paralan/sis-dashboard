import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiFetch, storeTokens, clearTokens, getAccessToken, getRefreshToken } from '@/api/client'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    statusText: status === 200 ? 'OK' : status === 401 ? 'Unauthorized' : 'Error',
  } as Response
}

describe('storeTokens / clearTokens / getAccessToken / getRefreshToken', () => {
  it('storeTokens stores both tokens in localStorage', () => {
    storeTokens('acc-123', 'ref-456')
    expect(getAccessToken()).toBe('acc-123')
    expect(getRefreshToken()).toBe('ref-456')
  })

  it('clearTokens removes both tokens', () => {
    storeTokens('acc-123', 'ref-456')
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})

describe('apiFetch — success', () => {
  it('returns parsed JSON on 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse({ id: '1', name: 'Test' }))
    const result = await apiFetch<{ id: string; name: string }>('/test')
    expect(result).toEqual({ id: '1', name: 'Test' })
  })

  it('returns undefined on 204 No Content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null), statusText: 'No Content' } as Response)
    const result = await apiFetch<void>('/delete')
    expect(result).toBeUndefined()
  })

  it('sets Authorization header when access token stored', async () => {
    storeTokens('my-access-token', 'my-refresh-token')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse({}))
    await apiFetch('/secure')
    const headers = fetchSpy.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer my-access-token')
  })

  it('sets Content-Type header to application/json', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse({}))
    await apiFetch('/endpoint')
    const headers = fetchSpy.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('passes method and body from init', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse({}))
    await apiFetch('/cameras', { method: 'POST', body: JSON.stringify({ name: 'Cam' }) })
    expect(fetchSpy.mock.calls[0][1]?.method).toBe('POST')
    expect(fetchSpy.mock.calls[0][1]?.body).toBe(JSON.stringify({ name: 'Cam' }))
  })
})

describe('apiFetch — error handling', () => {
  it('throws Error with server error message on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: 'Validation failed' }),
    } as Response)
    await expect(apiFetch('/bad')).rejects.toThrow('Validation failed')
  })

  it('throws Error with statusText when body has no error field', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('parse fail')),
    } as Response)
    await expect(apiFetch('/fail')).rejects.toThrow('Internal Server Error')
  })
})

describe('apiFetch — 401 token refresh', () => {
  it('retries request after refreshing token on 401', async () => {
    storeTokens('expired-token', 'valid-refresh')
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: RequestInfo | URL) => {
      const urlStr = url.toString()
      if (urlStr.includes('/auth/refresh')) {
        storeTokens('new-access-token', 'valid-refresh')
        return makeResponse({ access_token: 'new-access-token', refresh_token: 'valid-refresh' })
      }
      callCount++
      if (callCount === 1) return makeResponse({}, 401)
      return makeResponse({ data: 'ok' })
    })

    const result = await apiFetch<{ data: string }>('/secure-endpoint')
    expect(result.data).toBe('ok')
  })

  it('does not retry when no refresh token available', async () => {
    clearTokens()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse({}, 401))
    await expect(apiFetch('/secure')).rejects.toThrow()
  })
})
