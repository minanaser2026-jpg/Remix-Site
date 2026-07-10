import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { KeyRound, Check, AlertCircle } from 'lucide-react';

import { API_BASE } from '@/lib/api';

export default function AdminPassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) { setStatus({ ok: false, msg: 'New passwords do not match' }); return; }
    if (next.length < 8) { setStatus({ ok: false, msg: 'Password must be at least 8 characters' }); return; }
    setLoading(true); setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, msg: 'Password changed successfully!' });
        setCurrent(''); setNext(''); setConfirm('');
      } else {
        setStatus({ ok: false, msg: data.error ?? 'Failed to change password' });
      }
    } catch { setStatus({ ok: false, msg: 'Network error' }); }
    finally { setLoading(false); }
  }

  return (
    <AdminLayout title="Change Password">
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#CC0000]/15 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#CC0000]" />
            </div>
            <p className="text-white font-sans font-medium">Update Admin Password</p>
          </div>

          {status && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-sans ${status.ok ? 'bg-green-900/20 border border-green-500/20 text-green-400' : 'bg-red-900/20 border border-red-500/20 text-red-400'}`}>
              {status.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {status.msg}
            </div>
          )}

          {[
            { label: 'Current Password', value: current, set: setCurrent, auto: 'current-password' },
            { label: 'New Password', value: next, set: setNext, auto: 'new-password' },
            { label: 'Confirm New Password', value: confirm, set: setConfirm, auto: 'new-password' },
          ].map(({ label, value, set, auto }) => (
            <div key={label}>
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-sans">{label}</label>
              <input
                type="password"
                value={value}
                onChange={e => set(e.target.value)}
                autoComplete={auto}
                required
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-sans text-sm placeholder:text-white/20 focus:outline-none focus:border-[#CC0000]/40 transition"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-heading tracking-widest text-base py-3 rounded-xl transition-colors"
          >
            {loading ? 'Updating…' : 'CHANGE PASSWORD'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
