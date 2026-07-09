import { useEffect, useState } from 'react';
import logoImg from '../assets/logo.png';
import { SiFacebook, SiYoutube, SiInstagram, SiTiktok, SiTelegram, SiWhatsapp, SiSoundcloud, SiSpotify, SiX } from 'react-icons/si';
import { Link } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../contexts/SiteContentContext';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  SiFacebook, SiYoutube, SiInstagram, SiTiktok, SiTelegram,
  SiWhatsapp, SiSoundcloud, SiSpotify, SiX,
};

const FALLBACK_SOCIALS = [
  { id: 1, platform: 'Facebook', icon: 'SiFacebook', url: 'https://www.facebook.com/people/Remix/61554680983040/' },
  { id: 2, platform: 'Instagram', icon: 'SiInstagram', url: 'https://www.facebook.com/people/Remix/61554680983040/' },
  { id: 3, platform: 'YouTube', icon: 'SiYoutube', url: 'https://www.facebook.com/people/Remix/61554680983040/' },
  { id: 4, platform: 'SoundCloud', icon: 'SiSoundcloud', url: 'https://www.facebook.com/people/Remix/61554680983040/' },
];

interface SocialLink {
  id: number;
  platform: string;
  icon: string;
  url: string;
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function Footer() {
  const { t } = useLanguage();
  const { get } = useSiteContent();
  const logoSrc = get('img_logo', logoImg);
  const footerText = get('footer_text', t('footer_rights'));
  const [socials, setSocials] = useState<SocialLink[]>(FALLBACK_SOCIALS);

  useEffect(() => {
    fetch(`${API_BASE}/api/social-links`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setSocials(data); })
      .catch(() => {/* use fallback */});
  }, []);

  const scrollToHome = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="py-16 bg-[#030303] border-t border-white/5 relative z-20">
      <div className="container mx-auto px-6 flex flex-col items-center gap-10">

        <button onClick={scrollToHome} className="transition-transform hover:scale-105 duration-300">
          <img src={logoSrc} alt="REMIX Logo" className="h-16 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
        </button>

        <div className="flex items-center gap-8">
          {socials.map(social => {
            const Icon = ICON_MAP[social.icon] ?? SiFacebook;
            return (
              <a key={social.id} href={social.url} target="_blank" rel="noreferrer"
                aria-label={`Remix on ${social.platform}`}
                className="text-white/30 hover:text-primary hover:scale-110 transition-all duration-300">
                <Icon className="w-6 h-6" />
              </a>
            );
          })}
        </div>

        <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <p className="text-white/30 text-[10px] md:text-xs font-sans tracking-[0.3em] uppercase text-center">
          {footerText}
        </p>

        <Link
          href="/admin"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-white/50 hover:text-white hover:border-white/40 text-xs font-sans tracking-[0.2em] uppercase transition-colors"
        >
          Admin Panel
        </Link>
      </div>
    </footer>
  );
}
