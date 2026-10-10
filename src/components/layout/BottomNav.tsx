import React from 'react';
import { Home, LayoutGrid, Layers, GitCompareArrows, Info } from 'lucide-react';
import { Route, routeToPath, handleLinkClick, PageId } from '../../router.ts';

interface BottomNavProps {
  route: Route;
  compareCount: number;
}

const NAV: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'catalog', label: 'Katalog', icon: LayoutGrid },
  { id: 'tierlist', label: 'Tier', icon: Layers },
  { id: 'compare', label: 'Banding', icon: GitCompareArrows },
  { id: 'about', label: 'Tentang', icon: Info },
];

export const BottomNav: React.FC<BottomNavProps> = ({ route, compareCount }) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(item => {
          const active = route.page === item.id;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={routeToPath({ page: item.id })}
              onClick={(e) => handleLinkClick(e, { page: item.id })}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition ${
                active ? 'text-brass-700' : 'text-ink-faint'
              }`}
            >
              <span className={`flex h-9 w-12 items-center justify-center rounded-full transition ${active ? 'bg-brass-100' : ''}`}>
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
              {item.id === 'compare' && compareCount > 0 && (
                <span className="absolute right-3 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass-500 px-1 text-[9px] font-bold text-white">
                  {compareCount}
                </span>
              )}
              {active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brass-600" />}
            </a>
          );
        })}
      </div>
    </nav>
  );
};
