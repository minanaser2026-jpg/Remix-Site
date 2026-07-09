import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Save, Check, AlertCircle, Link as LinkIcon } from 'lucide-react';

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface ImageSlot {
  key: string;
  label: string;
  description: string;
  aspect: string;
  placeholder: string;
}

const IMAGE_SLOTS: ImageSlot[] = [
  { key: 'img_logo', label: 'Logo', description: 'Site logo shown in navbar and hero', aspect: 'aspect-square', placeholder: 'https://example.com/logo.png' },
  { key: 'img_avatar', label: 'Profile / Avatar', description: 'Circular image in the About section (spins like a vinyl)', aspect: 'aspect-square', placeholder: 'https://example.com/avatar.jpg' },
  { key: 'img_cover', label: 'Hero Cover (optional)', description: 'Optional background image — leave empty to keep the animated canvas', aspect: 'aspect-video', placeholder: 'https://example.com/cover.jpg' },
];

export default function AdminImages() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, { ok: boolean; msg: string }>>({});

  useEffect(() => {
    fetch(`${API_BASE}/api/content`)
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        const initial: Record<string, string> = {};
        IMAGE_SLOTS.forEach(s => { initial[s.key] = data[s.key] ?? ''; });
        setUrls(initial);
      })
      .catch(() => {});
  }, []);

  async function save(key: string) {
    setSaving(key);
    setStatus(s => ({ ...s, [key]: { ok: false, msg: '' } }));
    try {
      const res = await fetch(`${API_BASE}/api/admin/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key, value: urls[key] ?? '' }),
      });
      if (res.ok) {
        setStatus(s => ({ ...s, [key]: { ok: true, msg: 'Saved! Reload the site to see the change.' } }));
      } else {
        const data = await res.json();
        setStatus(s => ({ ...s, [key]: { ok: false, msg: data.error ?? 'Save failed' } }));
      }
    } catch {
      setStatus(s => ({ ...s, [key]: { ok: false, msg: 'Network error' } }));
    } finally {
      setSaving(null);
    }
  }

  return (
    <AdminLayout title="Images">
      <div className="space-y-4">
        <p className="text-white/40 text-sm font-sans">
          Paste an image URL from any hosting service (Cloudinary, Imgur, Google Photos, etc.)
          and click Save to update the site image.
        </p>

        {IMAGE_SLOTS.map(({ key, label, description, aspect, placeholder }) => (
          <div key={key} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Preview */}
              <div className={`${aspect} w-full md:w-48 flex-shrink-0 rounded-xl overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center`}>
                {urls[key] ? (
                  <img src={urls[key]} alt={label} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <p className="text-white/20 text-xs font-sans text-center px-4">No image set</p>
                )}
              </div>

              {/* Info + URL input */}
              <div className="flex-1">
                <p className="text-white font-sans font-medium text-base mb-1">{label}</p>
                <p className="text-white/40 text-sm font-sans mb-1">{description}</p>
                <p className="text-white/20 text-xs font-mono mb-4">{key}</p>

                {status[key]?.msg && (
                  <div className={`flex items-center gap-2 mb-3 text-sm font-sans ${status[key].ok ? 'text-green-400' : 'text-red-400'}`}>
                    {status[key].ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {status[key].msg}
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="url"
                      value={urls[key] ?? ''}
                      onChange={e => setUrls(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white font-sans text-sm placeholder:text-white/20 focus:outline-none focus:border-[#CC0000]/40 transition"
                    />
                  </div>
                  <button
                    onClick={() => save(key)}
                    disabled={saving === key}
                    className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-sans text-sm font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <Save className="w-4 h-4" />
                    {saving === key ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-[#0a0a14] border border-blue-500/10 rounded-2xl p-5 text-sm font-sans text-white/40">
          <p className="font-medium text-white/60 mb-1">💡 Free image hosting options:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li><a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Cloudinary</a> — free tier, great for images</li>
            <li><a href="https://imgur.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Imgur</a> — simple image upload, right-click → Copy image address</li>
            <li><a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">ImgBB</a> — free image hosting with direct links</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
