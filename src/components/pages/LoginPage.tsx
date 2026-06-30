import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
    } catch {
      // error is set in store
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-xl border"
        style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
      >
        {/* Logo */}
        <div className="flex items-baseline gap-1.5 mb-8 justify-center">
          <span className="text-[28px] font-black text-accent-blue tracking-[-0.02em] leading-none">
            SIS
          </span>
          <span className="text-[11px] text-text-muted tracking-[0.14em] font-bold uppercase">
            IINVSYS
          </span>
        </div>

        <h1 className="text-[14px] font-semibold text-text-primary mb-6 text-center">
          Sign in to your account
        </h1>

        <form onSubmit={handleSubmit} aria-label="Login form">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-[12px] font-medium text-text-secondary mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="operator@example.com"
              className="w-full px-3 py-2 text-[13px] rounded-[6px] border outline-none focus:ring-1 focus:ring-accent-blue"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-[12px] font-medium text-text-secondary mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-[13px] rounded-[6px] border outline-none focus:ring-1 focus:ring-accent-blue"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 px-3 py-2 rounded-[6px] text-[12px] font-medium"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--alert-critical)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-[6px] text-[13px] font-semibold transition-opacity disabled:opacity-60"
            style={{ background: 'var(--accent-blue)', color: '#fff' }}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
