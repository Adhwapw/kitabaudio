/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertCircle, 
  Layers, 
  Sparkles, 
  Search, 
  ArrowUpDown, 
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { AudioItem, SheetMetadata } from './types.ts';
import { SPREADSHEET_TABS, SpreadsheetTab } from './data/spreadsheetTabs.ts';
import { PRELOADED_GUNSAN_DATA } from './data/preloadedGunsanData.ts';
import { RevolutHeader } from './components/RevolutHeader.tsx';
import { RevolutHeroCard } from './components/RevolutHeroCard.tsx';
import { RevolutTopMovers } from './components/RevolutTopMovers.tsx';
import { FilterControls, SortOption, BudgetFilter } from './components/FilterControls.tsx';
import { AudioCard } from './components/AudioCard.tsx';
import { AudioDetailModal } from './components/AudioDetailModal.tsx';
import { CompareModal } from './components/CompareModal.tsx';
import { TabSelectorModal } from './components/TabSelectorModal.tsx';
import { AuthorNotesModal } from './components/AuthorNotesModal.tsx';
import { MobileFloatingBar } from './components/MobileFloatingBar.tsx';

const DEFAULT_SHEET_ID = "1KXDCrMErS1ZjjJhxjTYqNax1bjWWl4peXv0eaLMlxVc";
const SHEET_BASE_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/edit`;
const STORAGE_CACHE_PREFIX = 'kitab_audio_tab_';

export default function App() {
  // Current active tab (defaults to IEM: gid "0")
  const [activeTab, setActiveTab] = useState<SpreadsheetTab>(() => {
    return SPREADSHEET_TABS.find(t => t.id === 'iem') || SPREADSHEET_TABS[0];
  });

  // Tab items state
  const [items, setItems] = useState<AudioItem[]>(() => {
    try {
      const cached = localStorage.getItem(`${STORAGE_CACHE_PREFIX}0`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading tab cache:', e);
    }
    // Fallback to preloaded IEM data
    return PRELOADED_GUNSAN_DATA['0'] || [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => new Date().toISOString());
  const [isPreloadedFallback, setIsPreloadedFallback] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedSignature, setSelectedSignature] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('tier-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Modals state
  const [selectedDetailItem, setSelectedDetailItem] = useState<AudioItem | null>(null);
  const [compareItems, setCompareItems] = useState<AudioItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isTabSelectorOpen, setIsTabSelectorOpen] = useState(false);
  const [isAuthorNotesOpen, setIsAuthorNotesOpen] = useState(false);

  // Function to load and sync data for a tab
  const loadTabData = async (tab: SpreadsheetTab, force = false) => {
    // If it's the disclaimer tab, just open the modal
    if (tab.id === 'baca-dulu') {
      setIsAuthorNotesOpen(true);
      return;
    }

    setActiveTab(tab);
    setSyncError(null);

    // Check localStorage cache if not forced
    if (!force) {
      try {
        const cached = localStorage.getItem(`${STORAGE_CACHE_PREFIX}${tab.gid}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
            return;
          }
        }
      } catch (e) {
        console.error('Cache read error:', e);
      }
    }

    // Preloaded fast fallback if available
    const preloaded = PRELOADED_GUNSAN_DATA[tab.id] || PRELOADED_GUNSAN_DATA[tab.gid];
    if (preloaded && preloaded.length > 0 && !force) {
      setItems(preloaded);
      setIsPreloadedFallback(true);
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/scrape-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetUrl: SHEET_BASE_URL,
          gid: tab.gid,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items);
        setLastSyncedAt(data.metadata?.lastSyncedAt || new Date().toISOString());
        setIsPreloadedFallback(Boolean(data.metadata?.isPreloadedFallback));

        try {
          localStorage.setItem(`${STORAGE_CACHE_PREFIX}${tab.gid}`, JSON.stringify(data.items));
        } catch (e) {
          console.warn('Storage quota exceeded');
        }
      } else {
        // Use preloaded data if scrape returned empty
        if (preloaded && preloaded.length > 0) {
          setItems(preloaded);
          setIsPreloadedFallback(true);
        } else {
          setSyncError(data.error || 'Tidak ada data yang ditemukan di tab ini.');
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (preloaded && preloaded.length > 0) {
        setItems(preloaded);
        setIsPreloadedFallback(true);
      } else {
        setSyncError('Koneksi ke spreadsheet terputus. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial sync on mount
  useEffect(() => {
    loadTabData(activeTab, false);
  }, []);

  // Compare Toggle handler
  const handleToggleCompare = (item: AudioItem) => {
    setCompareItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      if (prev.length >= 2) {
        return [prev[1], item];
      }
      return [...prev, item];
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTier('All');
    setSelectedSignature('All');
    setSelectedBudget('all');
    setSortBy('tier-desc');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedTier !== 'All' ||
    selectedSignature !== 'All' ||
    selectedBudget !== 'all' ||
    sortBy !== 'tier-desc';

  // Tier ranking weights
  const tierWeights: Record<string, number> = {
    'SS': 110,
    'S+': 100,
    'S': 90,
    'A+': 80,
    'A': 70,
    'B+': 60,
    'B': 50,
    'C': 40,
    'D': 30,
    'E': 20,
  };

  // Filter and Sort Pipeline
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchNotes = item.notes.toLowerCase().includes(q);
        const matchSig = item.soundSignature.toLowerCase().includes(q);
        const matchDriver = (item.driver || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchNotes && !matchSig && !matchDriver) {
          return false;
        }
      }

      // Tier
      if (selectedTier !== 'All') {
        if (item.tier !== selectedTier) return false;
      }

      // Sound signature
      if (selectedSignature !== 'All') {
        if (item.soundSignature !== selectedSignature) return false;
      }

      // Budget
      if (selectedBudget !== 'all') {
        const price = item.priceNumeric;
        if (selectedBudget === 'under500k' && price >= 500000) return false;
        if (selectedBudget === '500k-1.5m' && (price < 500000 || price > 1500000)) return false;
        if (selectedBudget === '1.5m-5m' && (price < 1500000 || price > 5000000)) return false;
        if (selectedBudget === 'above5m' && price <= 5000000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'tier-desc') {
        const weightA = tierWeights[a.tier] || 0;
        const weightB = tierWeights[b.tier] || 0;
        if (weightB !== weightA) return weightB - weightA;
        return a.priceNumeric - b.priceNumeric;
      }
      if (sortBy === 'tier-asc') {
        const weightA = tierWeights[a.tier] || 0;
        const weightB = tierWeights[b.tier] || 0;
        return weightA - weightB;
      }
      if (sortBy === 'price-asc') {
        return a.priceNumeric - b.priceNumeric;
      }
      if (sortBy === 'price-desc') {
        return b.priceNumeric - a.priceNumeric;
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [items, searchQuery, selectedTier, selectedSignature, selectedBudget, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-900 pb-28 font-sans selection:bg-slate-900 selection:text-white">
      {/* Revolut Sticky Header with Pill Strip Navigation */}
      <RevolutHeader
        activeTabGid={activeTab.gid}
        onSelectTab={(tab) => loadTabData(tab, false)}
        onRefresh={() => loadTabData(activeTab, true)}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuthorNotes={() => setIsAuthorNotesOpen(true)}
        onOpenTabSelectorModal={() => setIsTabSelectorOpen(true)}
        lastSyncedAt={lastSyncedAt}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        {/* Error notification if sync fails */}
        {syncError && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-3xl flex items-center justify-between gap-3 text-xs text-rose-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{syncError}</span>
            </div>
            <button
              onClick={() => loadTabData(activeTab, true)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Revolut Hero Card */}
        <RevolutHeroCard
          tab={activeTab}
          items={items}
          isLoading={isLoading}
          onRefresh={() => loadTabData(activeTab, true)}
          onOpenCompare={() => setIsCompareModalOpen(true)}
          onOpenTabSelector={() => setIsTabSelectorOpen(true)}
          onOpenAuthorNotes={() => setIsAuthorNotesOpen(true)}
          compareCount={compareItems.length}
          lastSyncedAt={lastSyncedAt}
          isPreloadedFallback={isPreloadedFallback}
        />

        {/* Revolut Top Movers Horizontal Slider (Top Tier SS & S Gear) */}
        {!searchQuery && selectedTier === 'All' && (
          <RevolutTopMovers
            items={items}
            onSelectItem={(item) => setSelectedDetailItem(item)}
            onFilterTopTier={() => setSelectedTier('SS')}
          />
        )}

        {/* Filter Controls (Revolut Pill Selectors) */}
        <FilterControls
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          selectedSignature={selectedSignature}
          onSelectSignature={setSelectedSignature}
          selectedBudget={selectedBudget}
          onSelectBudget={setSelectedBudget}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiltered={filteredItems.length}
          totalAll={items.length}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Main Audio Items Grid or Compact List */}
        {isLoading && items.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-800">Menyinkronkan data dari spreadsheet...</p>
            <p className="text-xs text-slate-400">Mengambil data tab {activeTab.label} tanpa Google API</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-2xs">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-1" />
            <h3 className="text-base font-bold text-slate-800">Tidak ada perangkat audio yang cocok</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian, filter tier, atau rentang budget.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <AudioCard
                key={item.id}
                item={item}
                viewMode="grid"
                onSelect={(selected) => setSelectedDetailItem(selected)}
                onToggleCompare={handleToggleCompare}
                isCompared={compareItems.some((i) => i.id === item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <AudioCard
                key={item.id}
                item={item}
                viewMode="compact"
                onSelect={(selected) => setSelectedDetailItem(selected)}
                onToggleCompare={handleToggleCompare}
                isCompared={compareItems.some((i) => i.id === item.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Gear Modal */}
      <AudioDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedDetailItem ? compareItems.some((i) => i.id === selectedDetailItem.id) : false}
      />

      {/* Compare Modal */}
      <CompareModal
        items={compareItems}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveItem={(id) => setCompareItems((prev) => prev.filter((i) => i.id !== id))}
        onClearAll={() => setCompareItems([])}
      />

      {/* Tab Selector Modal (Browse all 21 Tabs) */}
      <TabSelectorModal
        isOpen={isTabSelectorOpen}
        onClose={() => setIsTabSelectorOpen(false)}
        activeGid={activeTab.gid}
        onSelectTab={(tab) => loadTabData(tab, false)}
      />

      {/* Author Notes & Disclaimer Modal */}
      <AuthorNotesModal
        isOpen={isAuthorNotesOpen}
        onClose={() => setIsAuthorNotesOpen(false)}
      />

      {/* Mobile Floating Bottom Dock */}
      <MobileFloatingBar
        compareCount={compareItems.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onRefresh={() => loadTabData(activeTab, true)}
        onOpenTabSelector={() => setIsTabSelectorOpen(true)}
        onOpenAuthorNotes={() => setIsAuthorNotesOpen(true)}
        isLoading={isLoading}
        activeTabLabel={activeTab.label}
      />
    </div>
  );
}
