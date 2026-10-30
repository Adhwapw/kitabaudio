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
    <nav className="dock dock-md mobile-dock fixed inset-x-0 bottom-0 z-40 border-t border-base-content/10 bg-base-100/95 backdrop-blur-md md:hidden" aria-label="Navigasi bawah">
      {NAV.map(item => {
        const active = route.page === item.id;
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={routeToPath({ page: item.id })}
            onClick={(e) => handleLinkClick(e, { page: item.id })}
            className={active ? 'dock-active' : undefined}
            aria-current={active ? 'page' : undefined}
          >
            <span className="relative">
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.id === 'compare' && compareCount > 0 && (
                <span className="badge badge-secondary badge-xs absolute -right-4 -top-2">{compareCount}</span>
              )}
            </span>
            <span className="dock-label">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
};
