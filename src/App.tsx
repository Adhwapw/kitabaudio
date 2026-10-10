/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { BookOpenText } from 'lucide-react';
import { useRoute, navigate } from './router.ts';
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
      <footer className="hidden border-t border-ink/10 bg-parchment/60 md:block">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper">
              <BookOpenText className="h-4 w-4" />
            </span>
            <div>
              <div className="font-display font-bold">Kitab Audio</div>
              <div className="text-xs text-ink-faint">Data tersinkron otomatis dari spreadsheet Fernanda Gunsan</div>
            </div>
          </div>
          <nav className="flex items-center gap-1 text-sm font-semibold text-ink-soft">
            {(
              [
                ['Beranda', 'home'],
                ['Katalog', 'catalog'],
                ['Tier List', 'tierlist'],
                ['Bandingkan', 'compare'],
                ['Tentang', 'about'],
              ] as const
            ).map(([label, page]) => (
              <button
                key={page}
                onClick={() => navigate({ page })}
                className="rounded-full px-3 py-1.5 transition hover:bg-ink/5 hover:text-ink"
              >
                {label}
              </button>
            ))}
          </nav>
          <p className="text-xs text-ink-faint">Review bersifat subjektif • Trust your ears</p>
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
