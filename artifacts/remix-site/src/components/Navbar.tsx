import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../contexts/SiteContentContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t, isRtl } = useLanguage();
  const { get } = useSiteContent();
  const logoSrc = get('img_logo', logoImg);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { key: 'about', label: t('about'), id: 'about' },
    { key: 'reels', label: t('reels'), id: 'reels' },
    { key: 'connect', label: t('connect'), id: 'connect' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className={`container mx-auto px-6 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
        <button onClick={() => scrollTo('home')} className="relative z-50 transition-transform hover:scale-105 duration-300">
          <img src={logoSrc} alt="REMIX Logo" className="h-10 md:h-12 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
        </button>

        {/* Desktop Nav */}
        <div className={`hidden md:flex items-center gap-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {navItems.map(({ key, label, id }) => (
            <button
              key={key}
              onClick={() => scrollTo(id)}
              className="text-sm font-sans tracking-[0.2em] font-medium text-white/70 hover:text-primary transition-colors uppercase hover:text-glow"
            >
              {label}
            </button>
          ))}

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/40 text-white/50 hover:text-primary transition-all text-xs font-sans tracking-wider uppercase"
            title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            {lang === 'en' ? '🇸🇦 عر' : '🇬🇧 EN'}
          </button>

          {/* Admin link */}
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/40 text-white/50 hover:text-primary transition-all text-xs font-sans tracking-wider uppercase"
          >
            Admin
          </Link>
        </div>

        {/* Mobile Right Side */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="px-2.5 py-1 rounded-full border border-white/10 text-white/50 text-xs font-sans"
          >
            {lang === 'en' ? 'عر' : 'EN'}
          </button>
          <button
            className="relative z-50 text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu — circular reveal from the menu button, staggered items */}
      <div
        className={`mobile-menu-panel fixed inset-0 bg-[#080808] z-40 flex flex-col items-center justify-center gap-10 md:hidden ${mobileMenuOpen ? 'mobile-menu-open pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_10%,rgba(204,0,0,0.18)_0%,transparent_70%)] pointer-events-none" />

        {navItems.map(({ key, label, id }, i) => (
          <button
            key={key}
            onClick={() => scrollTo(id)}
            style={{ transitionDelay: mobileMenuOpen ? `${0.15 + i * 0.08}s` : '0s' }}
            className="mobile-menu-item relative z-10 text-5xl font-heading text-white hover:text-primary transition-colors tracking-wider"
          >
            {label}
          </button>
        ))}

        <Link
          href="/admin"
          onClick={() => setMobileMenuOpen(false)}
          style={{ transitionDelay: mobileMenuOpen ? `${0.15 + navItems.length * 0.08}s` : '0s' }}
          className="mobile-menu-item relative z-10 mt-4 px-6 py-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-primary/40 text-sm font-sans tracking-[0.2em] uppercase transition-colors"
        >
          Admin Panel
        </Link>
      </div>
    </nav>
  );
}
