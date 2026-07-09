import { useEffect, useRef } from 'react';
import logoImg from '../assets/logo.png';
import { useIntersectionObserver } from '../hooks/use-intersection-observer';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../contexts/SiteContentContext';

export default function Hero() {
  const { ref, isIntersecting } = useIntersectionObserver();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();
  const { get } = useSiteContent();
  const logoSrc = get('img_logo', logoImg);
  const coverSrc = get('img_cover', '');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; red: boolean;
    }

    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.4, alpha: Math.random() * 0.4 + 0.08,
        red: Math.random() < 0.25,
      });
    }

    let t = 0;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated waveform lines
      const waveLines = [
        { y: 0.25, amp: 18, freq: 5,   speed: 0.018, alpha: 0.12 },
        { y: 0.38, amp: 28, freq: 4,   speed: 0.014, alpha: 0.09 },
        { y: 0.50, amp: 38, freq: 3.5, speed: 0.012, alpha: 0.14 },
        { y: 0.62, amp: 28, freq: 4.2, speed: 0.016, alpha: 0.09 },
        { y: 0.75, amp: 18, freq: 5.5, speed: 0.02,  alpha: 0.12 },
      ];

      waveLines.forEach(({ y, amp, freq, speed, alpha }) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(204, 0, 0, ${alpha})`;
        ctx.lineWidth = 1;
        const yBase = canvas.height * y;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= canvas.width; x += 3) {
          const wave = Math.sin((x / canvas.width) * Math.PI * freq * 2 + t * speed) * amp;
          ctx.lineTo(x, yBase + wave);
        }
        ctx.stroke();
      });

      // Floating particles
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.red ? `rgba(204, 0, 0, ${p.alpha})` : `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Equalizer bars at bottom
      const barCount = 32;
      const barWidth = canvas.width / barCount;
      for (let i = 0; i < barCount; i++) {
        const h = Math.abs(Math.sin(i * 0.4 + t * 0.03)) * 60 + 8;
        const alpha = 0.08 + Math.abs(Math.sin(i * 0.3 + t * 0.025)) * 0.1;
        ctx.fillStyle = `rgba(204, 0, 0, ${alpha})`;
        ctx.fillRect(i * barWidth, canvas.height - h, barWidth - 1, h);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" style={{ background: '#080808' }} />
      {coverSrc && (
        <img src={coverSrc} alt="" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" />
      )}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(204,0,0,0.07) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10 pointer-events-none" />

      <div ref={ref} className={`relative z-20 flex flex-col items-center px-6 mt-20 reveal-initial ${isIntersecting ? 'reveal-visible' : ''}`}>
        <div className="hero-logo-wrapper">
          <img src={logoSrc} alt="REMIX" className="hero-logo-img" />
        </div>

        <p className="text-lg md:text-3xl font-sans font-light tracking-[0.25em] text-white/90 mt-6 md:mt-4 uppercase text-center">
          {t('hero_tagline')} <span className="text-primary mx-3 font-bold">·</span> {t('hero_tagline2')}
        </p>

        <button onClick={scrollToAbout} className="group flex flex-col items-center gap-3 text-white/40 hover:text-white transition-colors duration-300">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium group-hover:text-glow mt-12">
            {t('hero_enter')}
          </span>
          <ChevronDown className="w-6 h-6 animate-bounce group-hover:text-primary transition-colors" />
        </button>
      </div>
    </section>
  );
}
