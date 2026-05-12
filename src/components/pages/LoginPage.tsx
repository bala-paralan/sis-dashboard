import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const { login, loading, error } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mb-1 text-xs font-bold tracking-[0.25em] uppercase" style={{ color: 'var(--accent-blue)' }}>
          IINVSYS
        </div>
        <h1 className="text-2xl font-bold tracking-wide">SIS Dashboard</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          Tactical Surveillance Intelligence System
        </p>
      </div>

      {/* Login card */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        aria-label="Login form"
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{
          background:   'var(--bg-secondary)',
          borderColor:  'var(--border-color)',
        }}
      >
        <h2 className="mb-6 text-lg font-semibold">Sign In</h2>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@iinvsys.mil"
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                background:   'var(--bg-tertiary)',
                borderColor:  'var(--border-color)',
                color:        'var(--text-primary)',
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
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
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                background:  'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color:       'var(--text-primary)',
              }}
            />
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--threat-high-bg)', color: 'var(--threat-high)' }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'var(--accent-blue)' }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
        CLASSIFIED — Authorised personnel only
      </p>
    </div>
  );
}
