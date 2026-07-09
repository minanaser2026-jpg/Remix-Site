import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './contexts/LanguageContext';
import { SiteContentProvider } from './contexts/SiteContentContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <SiteContentProvider>
      <App />
    </SiteContentProvider>
  </LanguageProvider>
);
