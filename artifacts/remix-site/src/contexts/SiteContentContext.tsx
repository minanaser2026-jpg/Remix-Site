import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import { API_BASE } from '@/lib/api';

interface SiteContentContextType {
  content: Record<string, string>;
  /** Returns the admin-edited value for `key` if set and non-empty, otherwise `fallback`. */
  get: (key: string, fallback: string) => string;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: {},
  get: (_key, fallback) => fallback,
});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_BASE}/api/content`)
      .then((r) => r.json())
      .then((data) => { if (data && typeof data === 'object') setContent(data); })
      .catch(() => {});
  }, []);

  function get(key: string, fallback: string): string {
    const value = content[key];
    return value && value.trim() !== '' ? value : fallback;
  }

  return (
    <SiteContentContext.Provider value={{ content, get }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
