import { useIntersectionObserver } from '../hooks/use-intersection-observer';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SiFacebook, SiYoutube, SiInstagram, SiTiktok, SiTelegram, SiWhatsapp, SiSoundcloud, SiSpotify, SiX } from 'react-icons/si';
import { useLanguage } from '../contexts/LanguageContext';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  SiFacebook, SiYoutube, SiInstagram, SiTiktok, SiTelegram,
  SiWhatsapp, SiSoundcloud, SiSpotify, SiX,
};

const FB_URL = 'https://www.facebook.com/people/Remix/61554680983040/';

const FALLBACK_SOCIALS = [
  { id: 1, platform: 'Facebook', label: 'Official Page', icon: 'SiFacebook', color: '#1877F2', url: FB_URL },
  { id: 2, platform: 'YouTube', label: 'Music Videos', icon: 'SiYoutube', color: '#FF0000', url: FB_URL },
  { id: 3, platform: 'Instagram', label: 'Behind the Scenes', icon: 'SiInstagram', color: '#E1306C', url: FB_URL },
  { id: 4, platform: 'TikTok', label: 'Viral Clips', icon: 'SiTiktok', color: '#ffffff', url: FB_URL },
  { id: 5, platform: 'SoundCloud', label: 'Latest Mixes', icon: 'SiSoundcloud', color: '#FF5500', url: FB_URL },
  { id: 6, platform: 'Telegram', label: 'Community', icon: 'SiTelegram', color: '#26A5E4', url: FB_URL },
  { id: 7, platform: 'WhatsApp', label: 'Bookings', icon: 'SiWhatsapp', color: '#25D366', url: FB_URL },
];

interface SocialLink {
  id: number;
  platform: string;
  label: string;
  icon: string;
  color: string;
  url: string;
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function SocialLinks() {
  const { ref, isIntersecting } = useIntersectionObserver();
  const { t, isRtl } = useLanguage();
  const [socials, setSocials] = useState<SocialLink[]>(FALLBACK_SOCIALS);

  useEffect(() => {
    fetch(`${API_BASE}/api/social-links`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setSocials(data); })
      .catch(() => {/* use fallback */});
  }, []);

  return (
    <section id="connect" className="py-24 md:py-40 bg-background relative z-20">
      <div className="container mx-auto px-6">

        <div className="flex flex-col items-center mb-20 text-center">
          <p className="text-primary tracking-[0.3em] uppercase text-sm font-bold mb-4">{t('connect_eyebrow')}</p>
          <h2 className="text-6xl md:text-8xl font-heading tracking-wide text-glow">{t('connect_title')}</h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {socials.map((social, index) => {
            const Icon = ICON_MAP[social.icon] ?? SiFacebook;
            return (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className={`glass-card hover-glow p-6 flex items-center gap-5 rounded-2xl group transition-all duration-300 reveal-initial ${isIntersecting ? 'reveal-visible' : ''} ${isRtl ? 'flex-row-reverse' : ''}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors duration-300">
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <Icon className="w-6 h-6 text-white/70 group-hover:text-primary transition-colors duration-300 relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-heading text-3xl tracking-wide leading-none mb-1 text-white truncate ${isRtl ? 'text-right' : ''}`}>{social.platform}</h3>
                  <p className={`text-white/40 text-[10px] md:text-xs font-sans tracking-[0.15em] uppercase truncate ${isRtl ? 'text-right' : ''}`}>{social.label}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-primary/10 transition-colors shrink-0 ${isRtl ? 'rotate-180' : ''}`}>
                  <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
