import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login: storeLogin, setError, setLoading, isLoading, error, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      storeLogin(user)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-lg p-8"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        {/* Logo / title */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold tracking-widest mb-1" style={{ color: 'var(--accent-blue)' }}>
            IINVSYS
          </div>
          <div className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)' }}>
            SIS Tactical Dashboard
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
              Email / Username
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded px-3 py-2 text-sm"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded px-3 py-2 text-sm"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div
              className="rounded px-3 py-2 text-xs"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: 'var(--alert-critical)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="py-2 rounded font-bold text-sm tracking-wide"
            style={{
              background: isLoading ? 'rgba(59,130,246,0.4)' : 'var(--accent-blue)',
              border: 'none',
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          RESTRICTED ACCESS — Authorised Personnel Only
        </div>
      </div>
    </div>
  )
}
