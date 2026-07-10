import profileImg from '../assets/profile.png';
import { useIntersectionObserver } from '../hooks/use-intersection-observer';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteContent } from '../contexts/SiteContentContext';

export default function About() {
  const { ref, isIntersecting } = useIntersectionObserver();
  const { t, isRtl } = useLanguage();
  const { get } = useSiteContent();
  const avatarSrc = get('img_avatar', profileImg);
  const aboutTitle = get('about_title', t('about_title'));
  const aboutBio = get('about_bio', t('about_bio'));

  return (
    <section id="about" className="py-24 md:py-40 bg-background relative z-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div ref={ref} className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-24 reveal-initial ${isIntersecting ? 'reveal-visible' : ''} ${isRtl ? 'lg:flex-row-reverse' : ''}`}>

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/25 rounded-full blur-[60px] scale-110 group-hover:bg-primary/40 transition-all duration-700" />
              <div className="vinyl-disc relative z-10 w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] rounded-full">
                <img src={avatarSrc} alt="REMIX Profile" className="w-full h-full object-cover rounded-full border border-white/10 shadow-2xl" />
              </div>
              <div className="absolute inset-[-20px] rounded-full border border-primary/20 border-dashed animate-[spin_30s_linear_infinite_reverse] z-0" />
            </div>
          </div>

          <div className={`w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center ${isRtl ? 'lg:text-right' : 'lg:text-left'}`}>
            <div className="flex h-1.5 w-24 rounded-full overflow-hidden mb-10 shadow-[0_0_15px_rgba(204,0,0,0.3)]">
              <div className="flex-1 bg-[#CE1126]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-black border-y border-white/10" />
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading mb-6 tracking-wide text-glow leading-[0.9] whitespace-pre-line">
              {aboutTitle}
            </h2>
            <p className="text-lg md:text-xl text-white/60 font-sans font-light leading-relaxed max-w-xl">
              {aboutBio}
            </p>

            <div className="mt-12 flex gap-6">
              <div className="text-center px-8 py-5 glass-card rounded-xl border-t-white/10 border-l-white/10 shadow-xl">
                <span className="block text-4xl md:text-5xl font-heading text-primary mb-1">9+</span>
                <span className="text-xs tracking-[0.2em] text-white/40 uppercase font-bold">{t('about_years')}</span>
              </div>
              <div className="text-center px-8 py-5 glass-card rounded-xl border-t-white/10 border-l-white/10 shadow-xl">
                <span className="block text-4xl md:text-5xl font-heading text-primary mb-1">26M+</span>
                <span className="text-xs tracking-[0.2em] text-white/40 uppercase font-bold">{t('about_fans')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
