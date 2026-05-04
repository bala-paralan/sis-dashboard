import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const login   = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error   = useAuthStore((s) => s.error);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void login(email, password);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 shadow-2xl"
        style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-black tracking-tight text-accent-blue">SIS</span>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
            IINVSYS — Secure Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
              style={{
                background:   'var(--bg-tertiary)',
                borderColor:  'var(--panel-border)',
              }}
              placeholder="operator@iinvsys.mil"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
              style={{
                background:  'var(--bg-tertiary)',
                borderColor: 'var(--panel-border)',
              }}
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg px-3 py-2 text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: 'var(--accent-blue)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
