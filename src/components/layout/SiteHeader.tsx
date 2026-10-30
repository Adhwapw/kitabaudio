import React from 'react';
import { BookOpenText, Home, LayoutGrid, Layers, GitCompareArrows, Info } from 'lucide-react';
import { Route, routeToPath, handleLinkClick, PageId } from '../../router.ts';
import { SyncBadge } from '../SyncBadge.tsx';
import { SyncResult } from '../../utils/sheetSync.ts';
import { TabStatus } from '../../data/sheetStore.ts';

interface SiteHeaderProps {
  route: Route;
  showSync: boolean;
  syncSource: SyncResult['source'] | null;
  syncStatus: TabStatus;
  syncedAt: string | null;
  onRefresh: () => void;
  compareCount: number;
}

const NAV: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'catalog', label: 'Katalog', icon: LayoutGrid },
  { id: 'tierlist', label: 'Tier List', icon: Layers },
  { id: 'compare', label: 'Bandingkan', icon: GitCompareArrows },
  { id: 'about', label: 'Tentang', icon: Info },
];

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  route, showSync, syncSource, syncStatus, syncedAt, onRefresh, compareCount,
}) => {
  return (
    <header className="navbar sticky top-0 z-40 border-b border-base-content/10 bg-base-100/90 backdrop-blur-md">
      <div className="navbar-start">
        <a
          href={routeToPath({ page: 'home' })}
          onClick={(e) => handleLinkClick(e, { page: 'home' })}
          className="btn btn-ghost flex items-center gap-2.5 px-2 text-left normal-case"
          aria-label="Kitab Audio, ke Beranda"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content shadow-sm">
            <BookOpenText className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg font-bold tracking-tight">Kitab Audio</span>
            <span className="hidden text-[11px] font-medium text-base-content/60 sm:block">Tier list audiophile Indonesia</span>
          </span>
        </a>
      </div>

      <nav className="navbar-center site-nav-desktop hidden md:flex" aria-label="Navigasi utama">
        <ul className="menu menu-horizontal gap-1 px-1">
          {NAV.map(item => {
            const active = route.page === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <a
                  href={routeToPath({ page: item.id })}
                  onClick={(e) => handleLinkClick(e, { page: item.id })}
                  className={active ? 'menu-active' : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                  {item.id === 'compare' && compareCount > 0 && (
                    <span className="badge badge-secondary badge-sm">{compareCount}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="navbar-end gap-2">
        {showSync && (
          <SyncBadge
            source={syncSource}
            status={syncStatus}
            syncedAt={syncedAt}
            onRefresh={onRefresh}
            compact
          />
        )}
      </div>
    </header>
  );
};
