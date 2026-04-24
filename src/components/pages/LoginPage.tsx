import { useState, type FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuthStore()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch {
      // error already set in store
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        {/* Logo / title */}
        <div className="mb-6 text-center">
          <div className="text-3xl mb-2">🛡</div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            IINVSYS SIS
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Situational Intelligence System
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@example.com"
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background:  'var(--bg-tertiary)',
                border:      '1px solid var(--border-color)',
                color:       'var(--text-primary)',
              }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background:  'var(--bg-tertiary)',
                border:      '1px solid var(--border-color)',
                color:       'var(--text-primary)',
              }}
            />
          </label>

          {error && (
            <p
              className="rounded-lg px-3 py-2 text-xs"
              style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--alert-critical)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent-blue)', color: '#fff' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          Authorised personnel only. All access is logged.
        </p>
      </div>
    </div>
  )
}
