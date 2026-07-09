import { useState } from 'react';
import { useLocation } from 'wouter';

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'setup'>('login');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'setup' ? '/api/admin/setup' : '/api/admin/login';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error'); return; }
      setLocation('/admin/dashboard');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-[#CC0000] text-xs tracking-[0.4em] uppercase mb-2 font-sans">Admin Panel</p>
          <h1 className="text-5xl font-heading tracking-wider text-white">REMIX</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur"
        >
          <h2 className="text-white font-heading text-2xl tracking-wide mb-6">
            {mode === 'setup' ? 'Create Admin Account' : 'Sign In'}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-sans">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-sans">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-sans text-sm placeholder:text-white/20 focus:outline-none focus:border-[#CC0000]/60 transition"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-sans">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-sans text-sm placeholder:text-white/20 focus:outline-none focus:border-[#CC0000]/60 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-heading tracking-widest text-lg py-3 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Please wait…' : mode === 'setup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(m => m === 'login' ? 'setup' : 'login'); setError(''); }}
            className="mt-4 w-full text-white/30 hover:text-white/60 text-xs font-sans tracking-widest uppercase transition-colors"
          >
            {mode === 'login' ? 'First time? Create admin account' : '← Back to login'}
          </button>
        </form>
      </div>
    </div>
  );
}
