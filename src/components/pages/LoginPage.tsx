import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
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
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-widest mb-1" style={{ color: 'var(--accent-blue)' }}>
            IINVSYS
          </div>
          <div className="text-sm text-text-secondary tracking-wider uppercase">
            SIS Tactical Dashboard
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="login-form">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs text-text-secondary uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="px-3 py-2 rounded text-sm"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              placeholder="operator@iinvsys.mil"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="px-3 py-2 rounded text-sm"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              className="text-xs px-3 py-2 rounded"
              role="alert"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid var(--alert-critical)',
                color: 'var(--alert-critical)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded font-semibold text-sm tracking-wider uppercase disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            style={{ background: 'var(--accent-blue)', color: '#fff' }}
          >
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-secondary">
          Authorised personnel only · All access is logged
        </p>
      </div>
    </div>
  )
}
