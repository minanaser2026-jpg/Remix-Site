import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        setProgress((scrolled / height) * 100);
      }
    };
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // init
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(204,0,0,0.8)]" 
      style={{ width: `${progress}%` }} 
    />
  );
}
