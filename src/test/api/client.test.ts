import { describe, it, expect, beforeEach, vi } from 'vitest'

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok:     status >= 200 && status < 300,
    status,
    json:   () => Promise.resolve(body),
    text:   () => Promise.resolve(JSON.stringify(body)),
    statusText: status === 401 ? 'Unauthorized' : 'OK',
  } as Response
}

// ── Reset module state and localStorage between tests ─────────────────────────
beforeEach(async () => {
  localStorage.clear()
  vi.unstubAllEnvs()
  vi.stubEnv('VITE_API_URL', 'http://test-api')

  // Re-import module fresh each test so module-level state (refreshing) resets
  vi.resetModules()
})

// ── Token storage helpers ─────────────────────────────────────────────────────
describe('token storage', () => {
  it('storeTokens writes access and refresh tokens to localStorage', async () => {
    const { storeTokens } = await import('@/api/client')
    storeTokens('access-abc', 'refresh-xyz')
    expect(localStorage.getItem('sos_access_token')).toBe('access-abc')
    expect(localStorage.getItem('sos_refresh_token')).toBe('refresh-xyz')
  })

  it('clearTokens removes both tokens from localStorage', async () => {
    const { storeTokens, clearTokens } = await import('@/api/client')
    storeTokens('acc', 'ref')
    clearTokens()
    expect(localStorage.getItem('sos_access_token')).toBeNull()
    expect(localStorage.getItem('sos_refresh_token')).toBeNull()
  })

  it('getAccessToken returns null when nothing stored', async () => {
    const { getAccessToken } = await import('@/api/client')
    expect(getAccessToken()).toBeNull()
  })

  it('getAccessToken returns stored access token', async () => {
    const { storeTokens, getAccessToken } = await import('@/api/client')
    storeTokens('my-token', 'my-refresh')
    expect(getAccessToken()).toBe('my-token')
  })

  it('getRefreshToken returns null when nothing stored', async () => {
    const { getRefreshToken } = await import('@/api/client')
    expect(getRefreshToken()).toBeNull()
  })

  it('getRefreshToken returns stored refresh token', async () => {
    const { storeTokens, getRefreshToken } = await import('@/api/client')
    storeTokens('acc', 'my-refresh')
    expect(getRefreshToken()).toBe('my-refresh')
  })
})

// ── apiFetch ──────────────────────────────────────────────────────────────────
describe('apiFetch', () => {
  it('makes a fetch call to BASE_URL + path', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({ ok: true }))
    const { apiFetch } = await import('@/api/client')
    await apiFetch('/test-path')
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/test-path'),
      expect.any(Object)
    )
  })

  it('attaches Authorization header when access token is present', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({ data: 'ok' }))
    const { storeTokens, apiFetch } = await import('@/api/client')
    storeTokens('bearer-token-abc', 'refresh-xyz')
    await apiFetch('/protected')
    const call = fetchSpy.mock.calls[0]
    const headers = call[1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer bearer-token-abc')
  })

  it('does not set Authorization header when no access token', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({ data: 'ok' }))
    const { apiFetch } = await import('@/api/client')
    await apiFetch('/public')
    const call = fetchSpy.mock.calls[0]
    const headers = call[1]?.headers as Headers
    expect(headers.get('Authorization')).toBeNull()
  })

  it('sets Content-Type to application/json', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({ x: 1 }))
    const { apiFetch } = await import('@/api/client')
    await apiFetch('/data')
    const headers = fetchSpy.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('returns parsed JSON on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({ value: 42 }))
    const { apiFetch } = await import('@/api/client')
    const result = await apiFetch<{ value: number }>('/data')
    expect(result.value).toBe(42)
  })

  it('throws an Error on non-2xx response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({ error: 'Not Found' }, 404))
    const { apiFetch } = await import('@/api/client')
    await expect(apiFetch('/missing')).rejects.toThrow('Not Found')
  })

  it('returns undefined (as T) for 204 No Content', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, status: 204, json: vi.fn(), statusText: 'No Content',
    } as unknown as Response)
    const { apiFetch } = await import('@/api/client')
    const result = await apiFetch<void>('/delete-op')
    expect(result).toBeUndefined()
  })

  it('forwards POST body to fetch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({ created: true }))
    const { apiFetch } = await import('@/api/client')
    await apiFetch('/resource', { method: 'POST', body: JSON.stringify({ name: 'test' }) })
    const init = fetchSpy.mock.calls[0][1]
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ name: 'test' }))
  })

  it('on 401, attempts token refresh and retries the original request', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      // first call → 401
      .mockResolvedValueOnce(mockResponse({ error: 'Unauthorized' }, 401))
      // refresh call → 200 with new tokens
      .mockResolvedValueOnce(mockResponse({ access_token: 'new-acc', refresh_token: 'new-ref' }))
      // retry call → 200 with data
      .mockResolvedValueOnce(mockResponse({ ok: true }))

    const { storeTokens, apiFetch } = await import('@/api/client')
    storeTokens('old-access', 'valid-refresh')

    await apiFetch('/protected')
    // fetch called 3 times: original, refresh, retry
    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  it('clears tokens and throws when refresh fails on 401', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(mockResponse({ error: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(mockResponse({ error: 'Invalid refresh' }, 401))
      // third call (retry after failed refresh) → 401 again → throws
      .mockResolvedValueOnce(mockResponse({ error: 'Still unauthorized' }, 401))

    const { storeTokens, apiFetch, getAccessToken } = await import('@/api/client')
    storeTokens('old-access', 'bad-refresh')

    await expect(apiFetch('/protected')).rejects.toThrow()
    expect(getAccessToken()).toBeNull()
  })
})
