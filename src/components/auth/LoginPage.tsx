import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch {
      // error already stored in authStore
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8 flex flex-col gap-6"
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--panel-border)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Brand */}
        <div className="text-center flex flex-col gap-1">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-[28px] font-black text-accent-blue tracking-[-0.02em] leading-none">
              SIS
            </span>
            <span className="text-[10px] text-text-muted tracking-[0.14em] font-bold uppercase">
              IINVSYS
            </span>
          </div>
          <p className="text-[11px] text-text-secondary tracking-wide">
            Tactical Surveillance Dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Login form">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.08em]"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="operator@example.com"
              className="py-2 px-3 rounded-lg text-[13px] text-text-primary outline-none border focus:border-accent-blue transition-colors"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.08em]"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="py-2 px-3 rounded-lg text-[13px] text-text-primary outline-none border focus:border-accent-blue transition-colors"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="text-[12px] rounded-lg py-2 px-3 border"
              style={{
                background: 'rgba(239,68,68,0.1)',
                borderColor: 'rgba(239,68,68,0.3)',
                color: 'var(--alert-critical)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="py-2.5 rounded-lg text-[13px] font-bold text-white tracking-wide transition-opacity cursor-pointer border-0"
            style={{
              background: 'var(--accent-blue)',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[10px] text-text-muted">
          IINVSYS SIS — Authorised Personnel Only
        </p>
      </div>
    </div>
  )
}
