import React, { useEffect, useMemo, useState } from 'react';
import { Search, AlertTriangle, Layers, GitCompareArrows } from 'lucide-react';
import { navigate } from '../router.ts';
import { SPREADSHEET_TABS, getTabById } from '../data/spreadsheetTabs.ts';
import { useTabData, useSyncStatus, setActiveGid } from '../data/sheetStore.ts';
import { AudioItem } from '../types.ts';
import { FilterControls, SortOption, BudgetFilter } from '../components/FilterControls.tsx';
import { AudioCard } from '../components/AudioCard.tsx';
import { TabSelectorModal } from '../components/TabSelectorModal.tsx';
import { SyncBadge } from '../components/SyncBadge.tsx';
import { CategoryIcon } from '../components/CategoryIcon.tsx';

const TIER_WEIGHTS: Record<string, number> = {
  SS: 110, 'S+': 100, S: 90, 'A+': 80, A: 70, 'B+': 60, B: 50, C: 40, D: 30, E: 20,
};

interface CatalogPageProps {
  tabId?: string;
  onSelectItem: (item: AudioItem) => void;
  compareItems: AudioItem[];
  onToggleCompare: (item: AudioItem) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  tabId, onSelectItem, compareItems, onToggleCompare,
}) => {
  const activeTab = getTabById(tabId || 'iem');
  const { result, status, refresh } = useTabData(activeTab.gid);
  const sync = useSyncStatus(activeTab.gid);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedSignature, setSelectedSignature] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('tier-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [isTabSelectorOpen, setIsTabSelectorOpen] = useState(false);

  // Tandai tab aktif untuk auto-refresh; reset filter saat ganti kategori
  useEffect(() => {
    setActiveGid(activeTab.gid);
    setSearchQuery('');
    setSelectedTier('All');
    setSelectedSignature('All');
    setSelectedBudget('all');
    setSortBy('tier-desc');
    return () => setActiveGid(null);
  }, [activeTab.gid]);

  const items = result?.items || [];

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items
      .filter(item => {
        if (q) {
          const hay = `${item.name} ${item.brand} ${item.notes} ${item.soundSignature} ${item.driver || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (selectedTier !== 'All' && item.tier !== selectedTier) return false;
        if (selectedSignature !== 'All' && item.soundSignature !== selectedSignature) return false;
        if (selectedBudget !== 'all') {
          const p = item.priceNumeric;
          if (selectedBudget === 'under500k' && p >= 500000) return false;
          if (selectedBudget === '500k-1.5m' && (p < 500000 || p > 1500000)) return false;
          if (selectedBudget === '1.5m-5m' && (p < 1500000 || p > 5000000)) return false;
          if (selectedBudget === 'above5m' && p <= 5000000) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'tier-desc') {
          const d = (TIER_WEIGHTS[b.tier] || 0) - (TIER_WEIGHTS[a.tier] || 0);
          return d !== 0 ? d : a.priceNumeric - b.priceNumeric;
        }
        if (sortBy === 'tier-asc') return (TIER_WEIGHTS[a.tier] || 0) - (TIER_WEIGHTS[b.tier] || 0);
        if (sortBy === 'price-asc') return a.priceNumeric - b.priceNumeric;
        if (sortBy === 'price-desc') return b.priceNumeric - a.priceNumeric;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [items, searchQuery, selectedTier, selectedSignature, selectedBudget, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery) || selectedTier !== 'All' || selectedSignature !== 'All' ||
    selectedBudget !== 'all' || sortBy !== 'tier-desc';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTier('All');
    setSelectedSignature('All');
    setSelectedBudget('all');
    setSortBy('tier-desc');
  };

  const showStaleWarning = result && (result.source === 'cache' || result.source === 'preloaded') && status !== 'syncing';

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6">
      {/* Judul kategori */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-ink p-3 text-paper">
            <CategoryIcon name={activeTab.iconName} className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow text-brass-700">Katalog kitab</p>
            <h1 className="font-display text-3xl font-black tracking-tight">{activeTab.label}</h1>
            <p className="mt-0.5 max-w-md text-sm text-ink-soft">{activeTab.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SyncBadge
            source={sync.source}
            status={sync.status}
            syncedAt={sync.syncedAt}
            onRefresh={() => refresh(true)}
          />
        </div>
      </div>

      {/* Strip kategori */}
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {SPREADSHEET_TABS.filter(t => !t.id.toLowerCase().includes('baca')).slice(0, 10).map(tab => {
          const active = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate({ page: 'catalog', tabId: tab.id })}
              className={`btn btn-sm shrink-0 ${active ? 'btn-primary' : 'btn-ghost border border-base-content/10 bg-base-100'}`}
            >
              <CategoryIcon name={tab.iconName} className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
        <button
          onClick={() => setIsTabSelectorOpen(true)}
          className="btn btn-dash btn-sm shrink-0"
        >
          <Layers className="h-3.5 w-3.5" /> Semua kategori
        </button>
      </div>

      {/* Peringatan data tidak segar */}
      {showStaleWarning && (
        <div role="alert" className="alert alert-warning mb-4 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {result.source === 'cache'
              ? 'Belum bisa menjangkau spreadsheet. Menampilkan data terakhir yang tersimpan di perangkatmu.'
              : 'Belum bisa menjangkau spreadsheet. Menampilkan data bawaan.'}
          </span>
          <button
            onClick={() => refresh(true)}
            className="btn btn-sm btn-neutral shrink-0"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Pencarian */}
      <label className="input mb-4 w-full">
        <Search className="h-4 w-4 text-base-content/60" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={`Cari di ${activeTab.label}, mis. brand, tipe driver, karakter suara`}
          aria-label={`Cari di ${activeTab.label}`}
          className="grow text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="btn btn-ghost btn-xs"
          >
            Hapus
          </button>
        )}
      </label>

      {/* Filter */}
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

      {/* Daftar gear */}
      {status === 'syncing' && items.length === 0 ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-secondary" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-ink">Menyinkronkan dari spreadsheet…</p>
          <p className="mt-1 text-xs text-ink-faint">Mengambil data tab {activeTab.label} langsung dari Google Sheets</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card card-border p-10 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-ink/20" aria-hidden="true" />
          <h3 className="font-bold text-ink">Tidak ada gear yang cocok</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-soft">
            Coba longgarkan kata kunci atau filter yang kamu pakai.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn btn-primary btn-sm mt-4 rounded-full"
          >
            Reset semua filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => (
            <AudioCard
              key={item.id}
              item={item}
              viewMode="grid"
              onSelect={onSelectItem}
              onToggleCompare={onToggleCompare}
              isCompared={compareItems.some(i => i.id === item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map(item => (
            <AudioCard
              key={item.id}
              item={item}
              viewMode="compact"
              onSelect={onSelectItem}
              onToggleCompare={onToggleCompare}
              isCompared={compareItems.some(i => i.id === item.id)}
            />
          ))}
        </div>
      )}

      {/* Tombol bandingkan mengambang */}
      {compareItems.length > 0 && (
        <button
          onClick={() => navigate({ page: 'compare' })}
          className="btn btn-primary fixed bottom-20 right-4 z-40 rounded-full shadow-xl md:bottom-8 md:right-8"
        >
          <GitCompareArrows className="h-4 w-4" />
          Bandingkan ({compareItems.length})
        </button>
      )}

      <TabSelectorModal
        isOpen={isTabSelectorOpen}
        onClose={() => setIsTabSelectorOpen(false)}
        activeGid={activeTab.gid}
        onSelectTab={tab => navigate({ page: 'catalog', tabId: tab.id })}
      />
    </div>
  );
};
