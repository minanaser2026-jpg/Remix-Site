import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, FileText, Image, Share2, Film,
  LogOut, ChevronRight, Menu, X, KeyRound
} from 'lucide-react';

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/images', label: 'Images', icon: Image },
  { href: '/admin/social-links', label: 'Social Links', icon: Share2 },
  { href: '/admin/reels', label: 'Reels', icon: Film },
  { href: '/admin/password', label: 'Password', icon: KeyRound },
];

interface Props {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: Props) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/me`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) {
          setLocation('/admin');
          return null;
        }
        return r.json();
      })
      .then(d => { if (d?.username) setAdminName(d.username); })
      .catch(() => setLocation('/admin'));
  }, [setLocation]);

  async function logout() {
    await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST', credentials: 'include' });
    setLocation('/admin');
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#0d0d0d] border-r border-white/5">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/5">
        <p className="text-[#CC0000] text-[10px] tracking-[0.4em] uppercase font-sans mb-0.5">Admin Panel</p>
        <h1 className="text-3xl font-heading tracking-wider text-white">REMIX</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm tracking-wide transition-all ${
                active
                  ? 'bg-[#CC0000]/15 text-[#CC0000] border border-[#CC0000]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3">
          <div className="w-8 h-8 rounded-full bg-[#CC0000]/20 flex items-center justify-center text-[#CC0000] font-heading text-sm">
            {adminName[0]?.toUpperCase()}
          </div>
          <span className="text-white/70 text-sm font-sans flex-1 truncate">{adminName}</span>
          <button
            onClick={logout}
            title="Logout"
            className="text-white/30 hover:text-[#CC0000] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <Link
          href="/"
          className="mt-2 flex items-center gap-2 px-4 py-2 text-white/30 hover:text-white/60 text-xs font-sans tracking-widest uppercase transition-colors"
        >
          ← View Public Site
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#080808] flex font-sans">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#0a0a0a]">
          <button
            className="md:hidden text-white/50 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-white font-heading text-2xl tracking-wide flex-1">{title}</h2>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
