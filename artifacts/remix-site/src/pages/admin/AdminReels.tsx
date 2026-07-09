import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { RefreshCw, Eye, EyeOff, ExternalLink, Film } from 'lucide-react';

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface AdminReel {
  id: number;
  fbVideoId: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  permalinkUrl: string;
  duration: number | null;
  fbCreatedTime: string | null;
  visible: boolean;
  orderIndex: number;
  syncedAt: string;
}

export default function AdminReels() {
  const [reels, setReels] = useState<AdminReel[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [loading, setLoading] = useState(true);

  function fetchReels() {
    setLoading(true);
    fetch(`${API_BASE}/api/admin/reels`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReels(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchReels(); }, []);

  async function syncReels() {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/reels/sync`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg(`✓ Synced ${data.synced} reels from Facebook`);
        fetchReels();
      } else {
        setSyncMsg(`✗ ${data.error}`);
      }
    } catch {
      setSyncMsg('✗ Network error');
    } finally {
      setSyncing(false);
    }
  }

  async function toggleVisibility(reel: AdminReel) {
    const res = await fetch(`${API_BASE}/api/admin/reels/${reel.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ visible: !reel.visible }),
    });
    if (res.ok) {
      const updated = await res.json();
      setReels(prev => prev.map(r => r.id === reel.id ? updated : r));
    }
  }

  async function updateOrder(reel: AdminReel, orderIndex: number) {
    await fetch(`${API_BASE}/api/admin/reels/${reel.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ orderIndex }),
    });
    setReels(prev => prev.map(r => r.id === reel.id ? { ...r, orderIndex } : r).sort((a, b) => a.orderIndex - b.orderIndex));
  }

  function formatDuration(s: number | null) {
    if (!s) return null;
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  return (
    <AdminLayout title="Reels">
      <div className="space-y-6">
        {/* Sync bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
          <button
            onClick={syncReels}
            disabled={syncing}
            className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-sans text-sm font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing from Facebook…' : 'Sync from Facebook'}
          </button>
          {syncMsg && (
            <span className={`text-sm font-sans ${syncMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
              {syncMsg}
            </span>
          )}
          <p className="text-white/30 text-xs font-sans ml-auto">
            {reels.filter(r => r.visible).length} visible / {reels.length} total
          </p>
        </div>

        {/* Empty state */}
        {!loading && reels.length === 0 && (
          <div className="text-center py-20 text-white/20">
            <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-heading text-2xl tracking-wide mb-2">No Reels Yet</p>
            <p className="text-sm font-sans">Set your FACEBOOK_PAGE_ACCESS_TOKEN and click Sync.</p>
          </div>
        )}

        {/* Reels grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reels.map(reel => (
            <div
              key={reel.id}
              className={`bg-white/5 border rounded-2xl overflow-hidden transition-opacity ${reel.visible ? 'border-white/10' : 'border-white/5 opacity-50'}`}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-black/40 relative">
                {reel.thumbnailUrl ? (
                  <img src={reel.thumbnailUrl} alt={reel.title ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-8 h-8 text-white/20" />
                  </div>
                )}
                {formatDuration(reel.duration) && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded">
                    {formatDuration(reel.duration)}
                  </span>
                )}
                <span className={`absolute top-2 left-2 text-xs font-sans px-2 py-1 rounded-full ${reel.visible ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                  {reel.visible ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <div className="p-4">
                <p className="text-white font-sans text-sm font-medium line-clamp-2 mb-1">
                  {reel.title ?? <span className="text-white/30 italic">No title</span>}
                </p>
                {reel.fbCreatedTime && (
                  <p className="text-white/30 text-xs font-sans mb-3">
                    {new Date(reel.fbCreatedTime).toLocaleDateString()}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibility(reel)}
                    className={`flex items-center gap-1.5 text-xs font-sans px-3 py-2 rounded-lg border transition-colors flex-1 justify-center ${
                      reel.visible
                        ? 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
                        : 'border-[#CC0000]/30 text-[#CC0000] hover:bg-[#CC0000]/10'
                    }`}
                  >
                    {reel.visible ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                  </button>
                  <input
                    type="number"
                    value={reel.orderIndex}
                    onChange={e => updateOrder(reel, Number(e.target.value))}
                    title="Display order"
                    className="w-14 bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-white text-xs font-mono text-center focus:outline-none focus:border-[#CC0000]/40"
                  />
                  <a
                    href={reel.permalinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/30 hover:text-white transition-colors p-2"
                    title="View on Facebook"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
