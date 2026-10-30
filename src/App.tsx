/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { BookOpenText } from 'lucide-react';
import { useRoute, routeToPath, handleLinkClick, redirectLegacyHash, PageId } from './router.ts';
import { AudioItem } from './types.ts';
import {
  startAutoRefresh,
  useActiveGid,
  useSyncStatus,
  ensureTab,
} from './data/sheetStore.ts';
import { SiteHeader } from './components/layout/SiteHeader.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CatalogPage } from './pages/CatalogPage.tsx';
import { TierListPage } from './pages/TierListPage.tsx';
import { ComparePage } from './pages/ComparePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { AudioDetailModal } from './components/AudioDetailModal.tsx';

export default function App() {
  const route = useRoute();
  const [compareItems, setCompareItems] = useState<AudioItem[]>([]);
  const [selectedDetailItem, setSelectedDetailItem] = useState<AudioItem | null>(null);

  // Jalankan auto-refresh sekali untuk seluruh aplikasi
  useEffect(() => {
    redirectLegacyHash();
    startAutoRefresh();
  }, []);

  // Badge status di header mengikuti tab yang sedang dilihat
  const activeGid = useActiveGid();
  const headerSync = useSyncStatus(activeGid || '__none__');

  const handleToggleCompare = (item: AudioItem) => {
    setCompareItems(prev => {
      if (prev.some(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id);
      }
      if (prev.length >= 2) {
        return [prev[1], item];
      }
      return [...prev, item];
    });
  };

  const handleHeaderRefresh = () => {
    if (activeGid) void ensureTab(activeGid, { force: true });
  };

  return (
    <div className="paper-grain min-h-screen bg-paper font-sans text-ink">
      <SiteHeader
        route={route}
        showSync={Boolean(activeGid)}
        syncSource={headerSync.source}
        syncStatus={headerSync.status}
        syncedAt={headerSync.syncedAt}
        onRefresh={handleHeaderRefresh}
        compareCount={compareItems.length}
      />

      <main className="pb-24 md:pb-0">
        {route.page === 'home' && (
          <HomePage onSelectItem={setSelectedDetailItem} />
        )}
        {route.page === 'catalog' && (
          <CatalogPage
            tabId={route.tabId}
            onSelectItem={setSelectedDetailItem}
            compareItems={compareItems}
            onToggleCompare={handleToggleCompare}
          />
        )}
        {route.page === 'tierlist' && (
          <TierListPage tabId={route.tabId} onSelectItem={setSelectedDetailItem} />
        )}
        {route.page === 'compare' && (
          <ComparePage
            items={compareItems}
            onRemoveItem={id => setCompareItems(prev => prev.filter(i => i.id !== id))}
            onClearAll={() => setCompareItems([])}
            onSelectItem={setSelectedDetailItem}
          />
        )}
        {route.page === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <footer className="hidden border-t border-base-content/10 bg-base-200/60 text-base-content md:block">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
              <BookOpenText className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <div className="font-display font-bold">Kitab Audio</div>
              <div className="text-xs text-base-content/60">Data tersinkron otomatis dari spreadsheet Fernanda Gunsan</div>
            </div>
          </div>
          <nav aria-label="Navigasi footer">
            <ul className="menu menu-horizontal gap-1 px-1 text-sm font-semibold">
              {(
                [
                  ['Beranda', 'home'],
                  ['Katalog', 'catalog'],
                  ['Tier List', 'tierlist'],
                  ['Bandingkan', 'compare'],
                  ['Tentang', 'about'],
                ] as const
              ).map(([label, page]) => (
                <li key={page}>
                  <a
                    href={routeToPath({ page: page as PageId })}
                    onClick={(e) => handleLinkClick(e, { page: page as PageId })}
                    className={route.page === page ? 'menu-active' : undefined}
                    aria-current={route.page === page ? 'page' : undefined}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-xs text-base-content/60">Review bersifat subjektif. Trust your ears</p>
        </div>
      </footer>

      <BottomNav route={route} compareCount={compareItems.length} />

      {/* Modal detail gear (global) */}
      <AudioDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedDetailItem ? compareItems.some(i => i.id === selectedDetailItem.id) : false}
      />
    </div>
  );
}
