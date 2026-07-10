import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '../hooks/use-intersection-observer';
import { Play, ExternalLink } from 'lucide-react';
import { SiFacebook } from 'react-icons/si';
import { useLanguage } from '../contexts/LanguageContext';

const FB_PAGE_URL = 'https://www.facebook.com/people/Remix/61554680983040/';

interface Reel {
  id: string;
  title: string | null;
  thumbnailUrl: string | null;
  permalinkUrl: string;
  duration: number | null;
  createdTime: string;
}

const PLACEHOLDER_REELS: Reel[] = [
  { id: '1', title: 'FEEL THE BASS DROP',   thumbnailUrl: null, permalinkUrl: FB_PAGE_URL, duration: 45, createdTime: '' },
  { id: '2', title: 'CAIRO NIGHTS LIVE',    thumbnailUrl: null, permalinkUrl: FB_PAGE_URL, duration: 80, createdTime: '' },
  { id: '3', title: 'STUDIO SESSIONS VOL.1',thumbnailUrl: null, permalinkUrl: FB_PAGE_URL, duration: 59, createdTime: '' },
  { id: '4', title: 'NEW TRACK PREVIEW',    thumbnailUrl: null, permalinkUrl: FB_PAGE_URL, duration: 30, createdTime: '' },
  { id: '5', title: 'UNDERGROUND VIBES',    thumbnailUrl: null, permalinkUrl: FB_PAGE_URL, duration: 75, createdTime: '' },
  { id: '6', title: 'CROWD GOES WILD',      thumbnailUrl: null, permalinkUrl: FB_PAGE_URL, duration: 50, createdTime: '' },
];

import { API_BASE } from '@/lib/api';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

export default function Reels() {
  const { ref, isIntersecting } = useIntersectionObserver();
  const { t } = useLanguage();
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/reels`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReels(data);
          setIsLive(true);
        }
      })
      .catch(() => {});
  }, []);

  const displayReels = reels.length > 0 ? reels : PLACEHOLDER_REELS;

  return (
    <section id="reels" className="py-24 md:py-40 bg-[#0a0a0a] relative z-20 border-y border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">

        <div className="flex flex-col items-center mb-20 text-center">
          <p className="text-primary tracking-[0.3em] uppercase text-sm font-bold mb-4">{t('reels_eyebrow')}</p>
          <h2 className="text-6xl md:text-8xl font-heading tracking-wide text-glow">{t('reels_title')}</h2>
          {isLive && (
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {t('reels_live')}
            </span>
          )}
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {displayReels.map((reel, index) => (
            <a
              key={reel.id}
              href={reel.permalinkUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden glass-card hover-glow block"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {reel.thumbnailUrl ? (
                <img src={reel.thumbnailUrl} alt={reel.title ?? 'Reel'} loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#1a0505] to-black group-hover:scale-105 transition-transform duration-700 ease-out" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center play-ripple text-white group-hover:scale-110 transition-transform duration-500 ease-out shadow-[0_0_40px_rgba(204,0,0,0.6)]">
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </div>
              </div>

              <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <SiFacebook className="text-[#1877F2] w-4 h-4" />
                <span className="text-xs font-semibold tracking-wide text-white">Reels</span>
              </div>
              {reel.duration && (
                <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-xs font-mono font-medium text-white/90">{formatDuration(reel.duration)}</span>
                </div>
              )}

              <div className="absolute bottom-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                {reel.createdTime && (
                  <p className="text-xs font-sans tracking-widest text-primary font-bold mb-2 uppercase">{formatDate(reel.createdTime)}</p>
                )}
                {reel.title && (
                  <h3 className="text-2xl font-heading tracking-wider mb-2 text-white group-hover:text-glow transition-colors duration-300 leading-tight line-clamp-2">
                    {reel.title}
                  </h3>
                )}
                <p className="text-sm text-white/50 font-sans tracking-wide flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  {t('reels_watch')}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center mt-16">
          <a href={FB_PAGE_URL} target="_blank" rel="noreferrer"
            className="group flex items-center gap-3 px-10 py-4 rounded-full border border-white/10 glass-card hover-glow transition-all duration-300 text-sm font-sans tracking-[0.2em] uppercase font-medium text-white/70 hover:text-white">
            <SiFacebook className="text-[#1877F2] w-5 h-5 group-hover:scale-110 transition-transform" />
            {t('reels_cta')}
          </a>
        </div>

      </div>
    </section>
  );
}
