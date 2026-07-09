import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Save, Plus, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface ContentItem {
  id: number;
  key: string;
  value: string;
  updatedAt: string;
}

const CONTENT_KEYS = [
  { key: 'hero_title', label: 'Hero Title', placeholder: 'REMIX', multiline: false },
  { key: 'hero_tagline', label: 'Hero Tagline', placeholder: 'Music Is My Life · Feel The Music', multiline: false },
  { key: 'about_bio', label: 'About Bio', placeholder: 'Your bio text here...', multiline: true },
  { key: 'about_name', label: 'About Name', placeholder: 'REMIX', multiline: false },
  { key: 'about_title', label: 'About Title / Role', placeholder: 'Music Producer & DJ', multiline: false },
  { key: 'footer_text', label: 'Footer Text', placeholder: 'Music Is My Life', multiline: false },
];

export default function AdminContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/content`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems(data); })
      .catch(() => {});
  }, []);

  function getValue(key: string) {
    return items.find(i => i.key === key)?.value ?? '';
  }

  function setValue(key: string, value: string) {
    setItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, value } : i);
      return [...prev, { id: 0, key, value, updatedAt: '' }];
    });
  }

  async function save(key: string) {
    const value = getValue(key);
    setSaving(key);
    try {
      const res = await fetch(`${API_BASE}/api/admin/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => prev.map(i => i.key === key ? data : i));
        setSaved(key);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  }

  async function saveCustom() {
    if (!customKey.trim() || !customValue.trim()) return;
    setSaving('custom');
    try {
      const res = await fetch(`${API_BASE}/api/admin/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key: customKey.trim(), value: customValue.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => {
          const exists = prev.find(i => i.key === data.key);
          return exists ? prev.map(i => i.key === data.key ? data : i) : [...prev, data];
        });
        setCustomKey(''); setCustomValue(''); setAddingCustom(false);
      }
    } finally {
      setSaving(null);
    }
  }

  return (
    <AdminLayout title="Content">
      <div className="space-y-6">
        <p className="text-white/40 text-sm font-sans">
          Edit the text content of your website. Changes are saved immediately to the database and reflected on the public site.
        </p>

        {/* Predefined keys */}
        <div className="space-y-4">
          {CONTENT_KEYS.map(({ key, label, placeholder, multiline }) => (
            <div key={key} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-sans text-sm font-medium">{label}</p>
                  <p className="text-white/30 text-xs font-mono mt-0.5">{key}</p>
                </div>
                <button
                  onClick={() => save(key)}
                  disabled={saving === key}
                  className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white text-xs font-sans px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-3 h-3" />
                  {saving === key ? 'Saving…' : saved === key ? '✓ Saved' : 'Save'}
                </button>
              </div>
              {multiline ? (
                <textarea
                  value={getValue(key)}
                  onChange={e => setValue(key, e.target.value)}
                  rows={4}
                  placeholder={placeholder}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-sans text-sm placeholder:text-white/20 focus:outline-none focus:border-[#CC0000]/40 resize-vertical transition"
                />
              ) : (
                <input
                  type="text"
                  value={getValue(key)}
                  onChange={e => setValue(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-sans text-sm placeholder:text-white/20 focus:outline-none focus:border-[#CC0000]/40 transition"
                />
              )}
            </div>
          ))}
        </div>

        {/* Custom key-value */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-sans text-sm font-medium">Other Content Keys</p>
              <p className="text-white/30 text-xs font-sans mt-0.5">
                {items.filter(i => !CONTENT_KEYS.find(k => k.key === i.key)).length} custom keys
              </p>
            </div>
            <button
              onClick={() => setAddingCustom(!addingCustom)}
              className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-xs font-sans px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Key
            </button>
          </div>

          {addingCustom && (
            <div className="space-y-3 mb-4 p-4 bg-black/20 rounded-xl border border-white/5">
              <input
                type="text"
                value={customKey}
                onChange={e => setCustomKey(e.target.value)}
                placeholder="key_name (e.g. contact_email)"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-white/20 focus:outline-none focus:border-[#CC0000]/40 transition"
              />
              <input
                type="text"
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                placeholder="Value"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white font-sans text-sm placeholder:text-white/20 focus:outline-none focus:border-[#CC0000]/40 transition"
              />
              <button
                onClick={saveCustom}
                disabled={saving === 'custom'}
                className="bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-50 text-white text-xs font-sans px-6 py-2 rounded-lg transition-colors"
              >
                {saving === 'custom' ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}

          {items.filter(i => !CONTENT_KEYS.find(k => k.key === i.key) && !i.key.startsWith('img_')).map(item => (
            <div key={item.key} className="flex items-center gap-3 py-3 border-t border-white/5">
              <p className="text-white/40 font-mono text-xs w-40 flex-shrink-0">{item.key}</p>
              <p className="text-white/70 font-sans text-sm flex-1 truncate">{item.value}</p>
              <Trash2 className="w-3.5 h-3.5 text-white/20" />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
