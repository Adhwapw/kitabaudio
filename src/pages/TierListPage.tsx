import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { navigate } from '../router.ts';
import { SPREADSHEET_TABS, getTabById } from '../data/spreadsheetTabs.ts';
import { useTabData, useSyncStatus, setActiveGid } from '../data/sheetStore.ts';
import { AudioItem, AudioTier } from '../types.ts';
import { AudioTemplateAvatar } from '../components/AudioTemplateAvatar.tsx';
import { SyncBadge } from '../components/SyncBadge.tsx';
import { CategoryIcon } from '../components/CategoryIcon.tsx';
import { formatPrice } from '../utils/audioTheme.ts';

const TIER_ORDER: AudioTier[] = ['SS', 'S+', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D', 'E'];

const TIER_STYLE: Record<AudioTier, { row: string; badge: string; desc: string }> = {
  SS: { row: 'border-amber-300 bg-amber-50/60', badge: 'bg-amber-500 text-white', desc: 'Dewa — endgame sejati' },
  'S+': { row: 'border-emerald-300 bg-emerald-50/60', badge: 'bg-emerald-600 text-white', desc: 'Luar biasa, nyaris sempurna' },
  S: { row: 'border-emerald-200 bg-emerald-50/40', badge: 'bg-emerald-500 text-white', desc: 'Istimewa di kelasnya' },
  'A+': { row: 'border-sky-300 bg-sky-50/60', badge: 'bg-sky-600 text-white', desc: 'Sangat bagus, minor flaw' },
  A: { row: 'border-sky-200 bg-sky-50/40', badge: 'bg-sky-500 text-white', desc: 'Bagus, rekomendasi aman' },
  'B+': { row: 'border-stone-300 bg-stone-50', badge: 'bg-stone-600 text-white', desc: 'Oke dengan catatan' },
  B: { row: 'border-stone-200 bg-white', badge: 'bg-stone-500 text-white', desc: 'Standar, sesuai harga' },
  C: { row: 'border-stone-200 bg-white/60', badge: 'bg-stone-400 text-white', desc: 'Di bawah ekspektasi' },
  D: { row: 'border-stone-200 bg-white/40', badge: 'bg-stone-400 text-white', desc: 'Sulit direkomendasikan' },
  E: { row: 'border-stone-200 bg-white/40', badge: 'bg-stone-500 text-white', desc: 'Hindari' },
};

interface TierListPageProps {
  tabId?: string;
  onSelectItem: (item: AudioItem) => void;
}

export const TierListPage: React.FC<TierListPageProps> = ({ tabId, onSelectItem }) => {
  const activeTab = getTabById(tabId || 'iem');
  const { result, status, refresh } = useTabData(activeTab.gid);
  const sync = useSyncStatus(activeTab.gid);
  const [expandedTier, setExpandedTier] = useState<AudioTier | null>(null);

  useEffect(() => {
    setActiveGid(activeTab.gid);
    setExpandedTier(null);
    return () => setActiveGid(null);
  }, [activeTab.gid]);

  const grouped = useMemo(() => {
    const map = new Map<AudioTier, AudioItem[]>();
    (result?.items || []).forEach(item => {
      const arr = map.get(item.tier) || [];
      arr.push(item);
      map.set(item.tier, arr);
    });
    return map;
  }, [result]);

  const visibleTiers = TIER_ORDER.filter(t => (grouped.get(t) || []).length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-brass-700">Papan peringkat</p>
          <h1 className="font-display text-3xl font-black tracking-tight">Tier List {activeTab.label}</h1>
          <p className="mt-1 max-w-lg text-sm text-ink-soft">
            Ranking jujur versi reviewer — tier SS di puncak, makin ke bawah makin banyak kompromi.
          </p>
        </div>
        <SyncBadge source={sync.source} status={sync.status} syncedAt={sync.syncedAt} onRefresh={() => refresh(true)} />
      </div>

      {/* Pilih kategori */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {SPREADSHEET_TABS.filter(t => !t.id.toLowerCase().includes('baca')).map(tab => {
          const active = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate({ page: 'tierlist', tabId: tab.id })}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                active ? 'bg-ink text-paper shadow' : 'border border-ink/10 bg-white text-ink-soft hover:border-brass-400 hover:text-ink'
              }`}
            >
              <CategoryIcon name={tab.iconName} className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {status === 'syncing' && !result ? (
        <div className="py-20 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-brass-600" />
          <p className="mt-3 text-sm font-bold text-ink">Menyusun papan tier…</p>
        </div>
      ) : visibleTiers.length === 0 ? (
        <div className="rounded-3xl border border-ink/10 bg-white p-10 text-center">
          <p className="font-bold text-ink">Belum ada data tier</p>
          <p className="mt-1 text-sm text-ink-soft">Coba sinkronkan ulang dari spreadsheet.</p>
          <button
            onClick={() => refresh(true)}
            className="mt-4 rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-paper"
          >
            Sinkronkan ulang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTiers.map(tier => {
            const items = grouped.get(tier) || [];
            const style = TIER_STYLE[tier];
            const expanded = expandedTier === tier;
            const shown = expanded ? items : items.slice(0, 8);
            return (
              <div key={tier} className={`overflow-hidden rounded-3xl border ${style.row}`}>
                <button
                  onClick={() => setExpandedTier(expanded ? null : tier)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-sm ${style.badge}`}>
                    {tier}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-ink">Tier {tier} <span className="font-medium text-ink-soft">• {items.length} gear</span></span>
                    <span className="block text-xs text-ink-soft">{style.desc}</span>
                  </span>
                  <ChevronRight className={`h-5 w-5 text-ink-faint transition ${expanded ? 'rotate-90' : ''}`} />
                </button>
                <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
                  {shown.map(item => (
                    <button
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brass-400 hover:shadow"
                    >
                      <AudioTemplateAvatar category={item.category} name={item.name} brand={item.brand} tier={item.tier} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink group-hover:text-brass-800">{item.name}</span>
                        <span className="block text-[11px] font-semibold text-ink-soft">
                          {item.brand} • {formatPrice(item.priceNumeric, item.price)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                {items.length > 8 && (
                  <button
                    onClick={() => setExpandedTier(expanded ? null : tier)}
                    className="w-full border-t border-ink/10 bg-white/50 py-2.5 text-xs font-bold text-brass-700 transition hover:bg-white"
                  >
                    {expanded ? 'Tutup' : `Lihat semua ${items.length} gear tier ${tier}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
