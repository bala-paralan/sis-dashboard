import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const navigate   = useNavigate()
  const login      = useAuthStore((s) => s.login)
  const loading    = useAuthStore((s) => s.loading)
  const error      = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch {
      // error is set in the store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ background: 'var(--panel-header-bg)', border: '1px solid var(--panel-border)' }}
      >
        {/* Logo / title */}
        <div className="mb-8 text-center">
          <div className="text-3xl font-black tracking-tighter text-white mb-1">
            IINVSYS <span style={{ color: 'var(--accent-blue)' }}>SIS</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Sensor Intelligence System — Secure Access
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@iinvsys.in"
              className="rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
              }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
              }}
            />
          </label>

          {error && (
            <p
              className="rounded-lg px-3 py-2 text-xs"
              role="alert"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--alert-critical)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent-blue)' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Authorised personnel only · IINVSYS v1.0
        </p>
      </div>
    </div>
  )
}
