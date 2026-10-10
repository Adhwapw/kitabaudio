/**
 * router.ts — Path router mungil tanpa dependensi.
 * Rute: / | /katalog/:tabId? | /tier-list/:tabId? | /bandingkan | /tentang
 *
 * URL path didukung penuh oleh:
 * - vercel.json (rewrite /(.*) -> /index.html)
 * - server.ts (express static + fallback ke index.html)
 * - Vite dev (appType 'spa')
 *
 * URL hash lama (#/katalog/...) otomatis dialihkan ke path setara sekali
 * saat aplikasi dimuat, jadi bookmark/tautan lama tidak rusak.
 */
import { useSyncExternalStore, useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';

export type PageId = 'home' | 'catalog' | 'tierlist' | 'compare' | 'about';

export interface Route {
  page: PageId;
  tabId?: string;
}

export function parsePath(pathname: string): Route {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) return { page: 'home' };
  if (parts[0] === 'katalog') {
    return { page: 'catalog', tabId: parts[1] ? decodeURIComponent(parts[1]) : undefined };
  }
  if (parts[0] === 'tier-list') {
    return { page: 'tierlist', tabId: parts[1] ? decodeURIComponent(parts[1]) : undefined };
  }
  if (parts[0] === 'bandingkan') return { page: 'compare' };
  if (parts[0] === 'tentang') return { page: 'about' };
  return { page: 'home' };
}

/** Alihkan hash lama (#/katalog/iem) ke path baru (/katalog/iem). Idempoten. */
export function redirectLegacyHash(): void {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    window.history.replaceState(null, '', hash.slice(1));
  }
}

export function routeToPath(route: Route): string {
  switch (route.page) {
    case 'catalog':
      return route.tabId ? `/katalog/${encodeURIComponent(route.tabId)}` : '/katalog';
    case 'tierlist':
      return route.tabId ? `/tier-list/${encodeURIComponent(route.tabId)}` : '/tier-list';
    case 'compare':
      return '/bandingkan';
    case 'about':
      return '/tentang';
    case 'home':
    default:
      return '/';
  }
}

/** Alias lawas — dipertahankan agar import lama tidak rusak. */
export const routeToHash = routeToPath;
export const parseHash = (hash: string): Route => parsePath(hash.replace(/^#/, ''));

let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  window.addEventListener('popstate', fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('popstate', fn);
  };
}

function getSnapshot(): number {
  return version;
}

export function navigate(route: Route) {
  const path = routeToPath(route);
  if (window.location.pathname === path) return;
  window.history.pushState(null, '', path);
  window.scrollTo({ top: 0 });
  emit();
}

/**
 * Klik pada <a href> internal: navigasi SPA tanpa reload, tapi tetap
 * membiarkan perilaku normal untuk klik kanan / Ctrl+klik / target blank.
 */
export function handleLinkClick(e: ReactMouseEvent<HTMLAnchorElement>, route: Route) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const anchor = e.currentTarget;
  if (anchor.target && anchor.target !== '_self') return;
  e.preventDefault();
  navigate(route);
}

/** Hook: rute aktif, re-render setiap navigasi + scroll ke atas. */
export function useRoute(): Route {
  const v = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [route, setRoute] = useState<Route>(() => parsePath(window.location.pathname));

  useEffect(() => {
    setRoute(parsePath(window.location.pathname));
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [v]);

  return route;
}
