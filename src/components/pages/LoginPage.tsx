import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          padding: '2rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 12,
        }}
      >
        {/* Logo */}
        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="text-[22px] font-black text-accent-blue tracking-[-0.02em]">SIS</span>
          <span className="text-[10px] text-text-secondary tracking-[0.14em] font-bold uppercase">IINVSYS</span>
        </div>

        <h2 className="text-[15px] font-semibold text-text-primary mb-5">Operator Sign In</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="block text-[11px] text-text-secondary mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="operator@example.com"
              className="w-full px-3 py-2 rounded-[6px] border border-border-color bg-bg-tertiary text-text-primary text-[13px] outline-none"
              style={{ caretColor: 'var(--accent-blue)' }}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-[11px] text-text-secondary mb-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-[6px] border border-border-color bg-bg-tertiary text-text-primary text-[13px] outline-none"
              style={{ caretColor: 'var(--accent-blue)' }}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-[12px] text-alert-critical px-3 py-2 rounded-[5px]"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 rounded-[6px] text-[13px] font-semibold text-white cursor-pointer transition-opacity"
            style={{
              background: 'var(--accent-blue)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
