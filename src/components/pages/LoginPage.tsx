import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useSystemStore } from '@/store/systemStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setUser = useSystemStore((s) => s.setUser)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const me = await login(email, password)
      setUser(me)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-xl"
        style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
      >
        {/* Logo */}
        <div className="flex items-baseline gap-1.5 mb-8">
          <span className="text-[28px] font-black text-accent-blue tracking-[-0.02em] leading-none">
            SIS
          </span>
          <span className="text-[10px] text-text-muted tracking-[0.14em] font-bold uppercase">
            IINVSYS
          </span>
        </div>

        <h1 className="text-lg font-bold text-text-primary mb-1">Sign In</h1>
        <p className="text-[12px] text-text-secondary mb-6">
          Authenticate to access the tactical dashboard
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.05em]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@iinvsys.com"
              className="w-full text-[13px] px-3 h-10 rounded-lg"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.05em]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-[13px] px-3 h-10 rounded-lg"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="text-[12px] px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: 'var(--alert-critical)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg text-[13px] font-bold tracking-[0.03em] transition-opacity duration-150"
            style={{
              background: 'var(--accent-blue)',
              color: '#fff',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
