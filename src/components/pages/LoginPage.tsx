import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      void navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 shadow-2xl"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        {/* Logo / Title */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-widest" style={{ color: 'var(--accent-blue)' }}>
            IINVSYS
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            SIS Situational Dashboard
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} aria-label="Login form">
          <div className="mb-4 flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="operator@example.com"
            />
          </div>

          <div className="mb-6 flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg px-3 py-2 text-sm"
              style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--alert-critical)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--accent-blue)' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
          IINVSYS SIS v1.0 — Authorised access only
        </p>
      </div>
    </div>
  )
}
