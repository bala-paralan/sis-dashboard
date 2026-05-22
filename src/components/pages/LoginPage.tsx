import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      setUser(user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8"
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--panel-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-accent-blue tracking-tight">SIS</span>
            <span className="text-xs text-text-muted tracking-widest font-bold uppercase">IINVSYS</span>
          </div>
          <p className="text-xs text-text-muted mt-1">Sensor Intelligence System</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="operator@example.com"
              className="px-3 py-2 rounded-lg border text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--panel-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--panel-border)' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="px-3 py-2 rounded-lg border text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--panel-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--panel-border)' }}
            />
          </div>

          {error && (
            <div
              className="text-xs px-3 py-2 rounded-lg border"
              style={{
                background: 'rgba(239,68,68,0.1)',
                borderColor: 'rgba(239,68,68,0.3)',
                color: 'var(--alert-critical)',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--accent-blue)',
              color: '#fff',
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-text-muted text-center mt-6">
          Classified system — authorised personnel only
        </p>
      </div>
    </div>
  )
}
