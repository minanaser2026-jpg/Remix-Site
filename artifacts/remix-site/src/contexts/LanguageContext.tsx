import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'en' | 'ar';

export const translations = {
  en: {
    // Navbar
    about: 'About',
    reels: 'Reels',
    connect: 'Connect',
    // Hero
    hero_tagline: 'Music Is My Life',
    hero_tagline2: 'Feel The Music',
    hero_enter: 'Enter The Experience',
    // About
    about_eyebrow: 'The Story',
    about_title: 'The Sound of\nThe Underground',
    about_bio: 'Forged in the rhythm of the streets and elevated to global stages. REMIX isn\'t just about playing tracks; it\'s about curating an unforgettable sonic experience. Blending dark cinematic energy with blood-pumping basslines, every set is a raw journey through the pure essence of sound.',
    about_years: 'Years',
    about_fans: 'Fans',
    // Reels
    reels_eyebrow: 'Experience the Energy',
    reels_title: 'Latest Reels',
    reels_live: 'Live from Facebook',
    reels_loading: 'Loading from Facebook…',
    reels_cta: 'View All on Facebook',
    reels_watch: 'Watch on Facebook',
    // Connect
    connect_eyebrow: 'Join the Movement',
    connect_title: 'Connect',
    // Footer
    footer_rights: '© 2026 REMIX. All rights reserved.',
  },
  ar: {
    // Navbar
    about: 'عن',
    reels: 'مقاطع',
    connect: 'تواصل',
    // Hero
    hero_tagline: 'الموسيقى حياتي',
    hero_tagline2: 'اشعر بالموسيقى',
    hero_enter: 'ادخل التجربة',
    // About
    about_eyebrow: 'القصة',
    about_title: 'صوت\nالجانب المخفي',
    about_bio: 'نشأ من إيقاع الشوارع وارتقى إلى المسارح العالمية. ريمكس ليس مجرد عزف — بل هو صياغة تجربة صوتية لا تُنسى. مزيج من الطاقة السينمائية الداكنة وخطوط الباص المتدفقة، كل ست هو رحلة خام عبر جوهر الصوت.',
    about_years: 'سنوات',
    about_fans: 'معجب',
    // Reels
    reels_eyebrow: 'اشعر بالطاقة',
    reels_title: 'أحدث المقاطع',
    reels_live: 'مباشر من فيسبوك',
    reels_loading: 'جاري التحميل من فيسبوك...',
    reels_cta: 'عرض الكل على فيسبوك',
    reels_watch: 'شاهد على فيسبوك',
    // Connect
    connect_eyebrow: 'انضم للحركة',
    connect_title: 'تواصل',
    // Footer
    footer_rights: '© ٢٠٢٦ ريمكس. جميع الحقوق محفوظة.',
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations.en[key],
  isRtl: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem('remix_lang');
      return (stored === 'ar' || stored === 'en') ? stored : 'en';
    } catch {
      return 'en';
    }
  });

  const isRtl = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    try { localStorage.setItem('remix_lang', lang); } catch {}
  }, [lang, isRtl]);

  function setLang(l: Lang) {
    setLangState(l);
  }

  function t(key: TranslationKey): string {
    return translations[lang][key] ?? translations.en[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
