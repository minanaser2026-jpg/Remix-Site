import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FileText, Share2, Film, RefreshCw } from 'lucide-react';

import { API_BASE } from '@/lib/api';

interface Stats {
  content: number;
  socialLinks: number;
  reels: number;
  visibleReels: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ content: 0, socialLinks: 0, reels: 0, visibleReels: 0 });
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/admin/content`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/social-links`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/reels`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([content, links, reels]) => {
      setStats({
        content: Array.isArray(content) ? content.length : 0,
        socialLinks: Array.isArray(links) ? links.length : 0,
        reels: Array.isArray(reels) ? reels.length : 0,
        visibleReels: Array.isArray(reels) ? reels.filter((r: { visible: boolean }) => r.visible).length : 0,
      });
    }).catch(() => {});
  }, []);

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
        setStats(s => ({ ...s, reels: data.total, visibleReels: data.total }));
      } else {
        setSyncMsg(`✗ ${data.error}`);
      }
    } catch {
      setSyncMsg('✗ Network error');
    } finally {
      setSyncing(false);
    }
  }

  const cards = [
    { label: 'Content Keys', value: stats.content, icon: FileText, color: 'text-blue-400' },
    { label: 'Social Links', value: stats.socialLinks, icon: Share2, color: 'text-green-400' },
    { label: 'Total Reels', value: stats.reels, icon: Film, color: 'text-[#CC0000]' },
    { label: 'Visible Reels', value: stats.visibleReels, icon: Film, color: 'text-yellow-400' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <Icon className={`w-6 h-6 ${color} mb-3`} />
              <p className="text-3xl font-heading text-white">{value}</p>
              <p className="text-white/40 text-xs font-sans uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-heading text-xl tracking-wide mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <button
                onClick={syncReels}
                disabled={syncing}
                className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-sans text-sm font-medium px-6 py-3 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Sync Reels from Facebook'}
              </button>
              {syncMsg && (
                <span className={`text-sm font-sans ${syncMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {syncMsg}
                </span>
              )}
            </div>
            <p className="text-white/30 text-xs font-sans">
              Fetches latest videos from your Facebook page and saves them to the database.
              Requires FACEBOOK_PAGE_ACCESS_TOKEN to be configured.
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#1a0505] border border-[#CC0000]/20 rounded-2xl p-6">
          <h3 className="text-[#CC0000] font-heading text-lg tracking-wide mb-3">Getting Started</h3>
          <ol className="text-white/60 text-sm font-sans space-y-2 list-decimal list-inside">
            <li>Go to <strong className="text-white/80">Content</strong> to edit your site texts (bio, tagline, etc.)</li>
            <li>Go to <strong className="text-white/80">Images</strong> to upload your logo, avatar, and cover photo</li>
            <li>Go to <strong className="text-white/80">Social Links</strong> to manage your platform links</li>
            <li>Set <code className="text-[#CC0000] bg-black/30 px-1 rounded">FACEBOOK_PAGE_ACCESS_TOKEN</code> in your environment, then click <strong className="text-white/80">Sync Reels</strong></li>
            <li>Go to <strong className="text-white/80">Reels</strong> to control which reels are shown on the site</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
}
