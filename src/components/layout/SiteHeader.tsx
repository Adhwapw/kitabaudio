import React from 'react';
import { BookOpenText, Home, LayoutGrid, Layers, GitCompareArrows, Info } from 'lucide-react';
import { Route, navigate, PageId } from '../../router.ts';
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
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => navigate({ page: 'home' })}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper shadow-sm">
            <BookOpenText className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg font-bold tracking-tight">Kitab Audio</span>
            <span className="hidden text-[11px] font-medium text-ink-faint sm:block">Tier list audiophile Indonesia</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(item => {
            const active = route.page === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate({ page: item.id })}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.id === 'compare' && compareCount > 0 && (
                  <span className={`ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${active ? 'bg-brass-400 text-ink' : 'bg-brass-500 text-white'}`}>
                    {compareCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sync status */}
        <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
};
