import { useState, useEffect } from 'react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email.trim(), password)
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8 flex flex-col gap-6"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--panel-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-black text-accent-blue tracking-[-0.02em]">SIS</span>
            <span className="text-[11px] text-text-muted tracking-[0.2em] font-bold uppercase">IINVSYS</span>
          </div>
          <p className="text-[12px] text-text-muted mt-1">Sensor Intelligence System</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-panel-border" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError() }}
              placeholder="operator@sis.local"
              required
              autoComplete="username"
              className="h-10 px-3 rounded-lg text-[13px] outline-none transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--panel-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError() }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-10 px-3 rounded-lg text-[13px] outline-none transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--panel-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {error && (
            <div
              className="px-3 py-2 rounded-lg text-[12px] text-alert-critical"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="h-10 rounded-lg font-semibold text-[13px] transition-opacity mt-1"
            style={{
              background: isLoading ? 'var(--bg-tertiary)' : 'var(--accent-blue)',
              color: isLoading ? 'var(--text-muted)' : '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Demo hint */}
        <p className="text-center text-[11px] text-text-muted">
          Demo: operator@sis.local / operator
        </p>
      </div>
    </div>
  )
}
