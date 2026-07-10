import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Plus, Trash2, Save, Eye, EyeOff, GripVertical } from 'lucide-react';

import { API_BASE } from '@/lib/api';

interface SocialLink {
  id: number;
  platform: string;
  label: string;
  url: string;
  icon: string;
  color: string;
  orderIndex: number;
  visible: boolean;
}

const DEFAULT_ICONS = [
  { platform: 'Facebook', icon: 'SiFacebook', color: '#1877F2' },
  { platform: 'YouTube', icon: 'SiYoutube', color: '#FF0000' },
  { platform: 'Instagram', icon: 'SiInstagram', color: '#E1306C' },
  { platform: 'TikTok', icon: 'SiTiktok', color: '#ffffff' },
  { platform: 'Telegram', icon: 'SiTelegram', color: '#26A5E4' },
  { platform: 'WhatsApp', icon: 'SiWhatsapp', color: '#25D366' },
  { platform: 'SoundCloud', icon: 'SiSoundcloud', color: '#FF5500' },
  { platform: 'Spotify', icon: 'SiSpotify', color: '#1DB954' },
  { platform: 'Twitter/X', icon: 'SiX', color: '#ffffff' },
];

export default function AdminSocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newLink, setNewLink] = useState({ platform: '', label: '', url: '', icon: '', color: '#ffffff' });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/social-links`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLinks(data); })
      .catch(() => {});
  }, []);

  function updateLink(id: number, field: keyof SocialLink, value: string | boolean | number) {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }

  async function saveLink(link: SocialLink) {
    setSaving(link.id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/social-links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(link),
      });
      if (res.ok) {
        const updated = await res.json();
        setLinks(prev => prev.map(l => l.id === link.id ? updated : l));
      }
    } finally {
      setSaving(null);
    }
  }

  async function deleteLink(id: number) {
    if (!confirm('Delete this social link?')) return;
    await fetch(`${API_BASE}/api/admin/social-links/${id}`, { method: 'DELETE', credentials: 'include' });
    setLinks(prev => prev.filter(l => l.id !== id));
  }

  async function createLink() {
    if (!newLink.platform || !newLink.url) return;
    const res = await fetch(`${API_BASE}/api/admin/social-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...newLink, orderIndex: links.length, visible: true }),
    });
    if (res.ok) {
      const created = await res.json();
      setLinks(prev => [...prev, created]);
      setNewLink({ platform: '', label: '', url: '', icon: '', color: '#ffffff' });
      setShowNew(false);
    }
  }

  function pickPreset(platform: string) {
    const preset = DEFAULT_ICONS.find(d => d.platform === platform);
    if (preset) setNewLink(n => ({ ...n, platform: preset.platform, label: preset.platform, icon: preset.icon, color: preset.color }));
  }

  return (
    <AdminLayout title="Social Links">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm font-sans">Manage your social media links shown on the site.</p>
          <button
            onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white text-sm font-sans px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>

        {/* New link form */}
        {showNew && (
          <div className="bg-[#1a0505] border border-[#CC0000]/20 rounded-2xl p-5 space-y-4">
            <p className="text-[#CC0000] font-heading text-lg tracking-wide">New Social Link</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {DEFAULT_ICONS.map(p => (
                <button
                  key={p.platform}
                  onClick={() => pickPreset(p.platform)}
                  className={`px-3 py-2 rounded-lg text-xs font-sans border transition-colors text-left ${
                    newLink.platform === p.platform
                      ? 'border-[#CC0000] bg-[#CC0000]/10 text-white'
                      : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {p.platform}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" value={newLink.platform} onChange={e => setNewLink(n => ({ ...n, platform: e.target.value }))} placeholder="Platform" className="admin-input" />
              <input type="text" value={newLink.label} onChange={e => setNewLink(n => ({ ...n, label: e.target.value }))} placeholder="Label (displayed)" className="admin-input" />
              <input type="url" value={newLink.url} onChange={e => setNewLink(n => ({ ...n, url: e.target.value }))} placeholder="https://..." className="admin-input md:col-span-2" />
              <input type="text" value={newLink.icon} onChange={e => setNewLink(n => ({ ...n, icon: e.target.value }))} placeholder="Icon name (e.g. SiFacebook)" className="admin-input" />
              <div className="flex items-center gap-3">
                <input type="color" value={newLink.color} onChange={e => setNewLink(n => ({ ...n, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                <span className="text-white/40 text-xs font-mono">{newLink.color}</span>
              </div>
            </div>
            <button onClick={createLink} className="bg-[#CC0000] hover:bg-[#aa0000] text-white font-sans text-sm px-6 py-2.5 rounded-xl transition-colors">
              Create Link
            </button>
          </div>
        )}

        {/* Links list */}
        <div className="space-y-3">
          {links.map(link => (
            <div key={link.id} className={`bg-white/5 border rounded-2xl p-5 transition-opacity ${link.visible ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input type="text" value={link.label} onChange={e => updateLink(link.id, 'label', e.target.value)} placeholder="Label" className="admin-input" />
                <input type="url" value={link.url} onChange={e => updateLink(link.id, 'url', e.target.value)} placeholder="URL" className="admin-input md:col-span-2" />
                <input type="text" value={link.icon} onChange={e => updateLink(link.id, 'icon', e.target.value)} placeholder="Icon" className="admin-input" />
                <input type="text" value={link.platform} onChange={e => updateLink(link.id, 'platform', e.target.value)} placeholder="Platform" className="admin-input" />
                <div className="flex items-center gap-3">
                  <input type="color" value={link.color} onChange={e => updateLink(link.id, 'color', e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                  <input type="number" value={link.orderIndex} onChange={e => updateLink(link.id, 'orderIndex', Number(e.target.value))} placeholder="Order" className="admin-input w-20" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => saveLink(link)} disabled={saving === link.id} className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white text-xs font-sans px-4 py-2 rounded-lg transition-colors">
                  <Save className="w-3 h-3" /> {saving === link.id ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { updateLink(link.id, 'visible', !link.visible); saveLink({ ...link, visible: !link.visible }); }} className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs font-sans px-4 py-2 rounded-lg transition-colors">
                  {link.visible ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                </button>
                <button onClick={() => deleteLink(link.id)} className="ml-auto text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {links.length === 0 && (
            <div className="text-center py-16 text-white/20 font-sans text-sm">
              No social links yet. Click "Add Link" to create one.
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-input {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          padding: 0.625rem 1rem;
          color: white;
          font-size: 0.875rem;
          font-family: sans-serif;
          outline: none;
          transition: border-color 0.15s;
        }
        .admin-input:focus { border-color: rgba(204,0,0,0.4); }
        .admin-input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </AdminLayout>
  );
}
