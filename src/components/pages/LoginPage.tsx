import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div
        className="w-full max-w-[360px] p-8 rounded-lg"
        style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
      >
        <div className="mb-6 text-center">
          <div className="text-[28px] font-black text-accent-blue tracking-tight leading-none">SIS</div>
          <div className="text-[10px] text-text-muted tracking-[0.18em] uppercase mt-1">
            IINVSYS Tactical Dashboard
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Sign in">
          {error && (
            <div
              role="alert"
              className="py-2 px-3 rounded text-[12px]"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--alert-critical)',
              }}
            >
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-secondary uppercase tracking-wider">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              aria-label="Email address"
              className="py-2 px-3 rounded text-[13px] text-text-primary outline-none"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-secondary uppercase tracking-wider">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-label="Password"
              className="py-2 px-3 rounded text-[13px] text-text-primary outline-none"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 rounded font-bold text-[13px] cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
