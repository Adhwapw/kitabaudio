/**
 * router.ts — Hash router mungil tanpa dependensi.
 * Rute: #/ (beranda) | #/katalog/:tabId? | #/tier-list/:tabId? | #/bandingkan | #/tentang
 */
import { useSyncExternalStore, useEffect, useState } from 'react';

export type PageId = 'home' | 'catalog' | 'tierlist' | 'compare' | 'about';

export interface Route {
  page: PageId;
  tabId?: string;
}

export function parseHash(hash: string): Route {
  const clean = (hash || '').replace(/^#/, '').replace(/\/+$/, '') || '/';
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) return { page: 'home' };
  if (parts[0] === 'katalog') return { page: 'catalog', tabId: parts[1] };
  if (parts[0] === 'tier-list') return { page: 'tierlist', tabId: parts[1] };
  if (parts[0] === 'bandingkan') return { page: 'compare' };
  if (parts[0] === 'tentang') return { page: 'about' };
  return { page: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.page) {
    case 'catalog':
      return route.tabId ? `#/katalog/${route.tabId}` : '#/katalog';
    case 'tierlist':
      return route.tabId ? `#/tier-list/${route.tabId}` : '#/tier-list';
    case 'compare':
      return '#/bandingkan';
    case 'about':
      return '#/tentang';
    case 'home':
    default:
      return '#/';
  }
}

export function navigate(route: Route) {
  window.location.hash = routeToHash(route);
}

function subscribeHash(fn: () => void): () => void {
  window.addEventListener('hashchange', fn);
  return () => window.removeEventListener('hashchange', fn);
}

function getHashSnapshot(): string {
  return window.location.hash;
}

/** Hook: rute aktif, re-render setiap hash berubah + scroll ke atas. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribeHash, getHashSnapshot, getHashSnapshot);
  const [route, setRoute] = useState<Route>(() => parseHash(hash));

  useEffect(() => {
    setRoute(parseHash(window.location.hash));
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [hash]);

  return route;
}
