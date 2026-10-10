import React from 'react';
import { ArrowUpDown, LayoutGrid, ListFilter, RotateCcw } from 'lucide-react';
import { SoundSignature } from '../types.ts';

export type SortOption = 'tier-desc' | 'tier-asc' | 'price-asc' | 'price-desc' | 'name-asc';
export type BudgetFilter = 'all' | 'under500k' | '500k-1.5m' | '1.5m-5m' | 'above5m';

interface FilterControlsProps {
  selectedTier: string;
  onSelectTier: (tier: string) => void;
  selectedSignature: string;
  onSelectSignature: (sig: string) => void;
  selectedBudget: BudgetFilter;
  onSelectBudget: (b: BudgetFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'compact';
  onViewModeChange: (mode: 'grid' | 'compact') => void;
  totalFiltered: number;
  totalAll: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const TIERS = ['All', 'SS', 'S+', 'S', 'A+', 'A', 'B+', 'B', 'C'];

const SIGNATURES: { label: string; value: SoundSignature }[] = [
  { label: 'Semua tonal', value: 'All' },
  { label: 'Warm', value: 'Warm' },
  { label: 'Neutral', value: 'Neutral' },
  { label: 'Harman', value: 'Harman' },
  { label: 'V-Shape', value: 'V-Shape' },
  { label: 'Bright', value: 'Bright' },
  { label: 'Basshead', value: 'Basshead' },
  { label: 'Mid-Centric', value: 'Mid-Centric' },
];

const BUDGETS: { label: string; value: BudgetFilter }[] = [
  { label: 'Semua harga', value: 'all' },
  { label: '< 500rb', value: 'under500k' },
  { label: '500rb–1,5jt', value: '500k-1.5m' },
  { label: '1,5jt–5jt', value: '1.5m-5m' },
  { label: '> 5jt', value: 'above5m' },
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedTier,
  onSelectTier,
  selectedSignature,
  onSelectSignature,
  selectedBudget,
  onSelectBudget,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
  totalAll,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="my-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="mr-1 hidden text-xs font-bold text-ink-faint sm:inline">Tier:</span>
          {TIERS.map(tier => {
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                onClick={() => onSelectTier(tier)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-ink text-paper shadow'
                    : 'border border-ink/10 bg-white text-ink-soft hover:border-brass-400 hover:text-ink'
                }`}
              >
                {tier === 'All' ? 'Semua' : tier}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <ArrowUpDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-ink-faint" />
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as SortOption)}
              className="cursor-pointer rounded-full border border-ink/10 bg-white py-1.5 pl-8 pr-6 text-xs font-semibold text-ink shadow-sm focus:border-brass-400 focus:outline-none"
            >
              <option value="tier-desc">Tier terbaik</option>
              <option value="price-asc">Harga termurah</option>
              <option value="price-desc">Harga tertinggi</option>
              <option value="name-asc">Nama (A–Z)</option>
            </select>
          </div>

          <div className="flex items-center rounded-full border border-ink/10 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`rounded-full p-1.5 transition ${viewMode === 'grid' ? 'bg-ink text-paper' : 'text-ink-faint hover:text-ink'}`}
              title="Tampilan kartu"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`rounded-full p-1.5 transition ${viewMode === 'compact' ? 'bg-ink text-paper' : 'text-ink-faint hover:text-ink'}`}
              title="Tampilan ringkas"
            >
              <ListFilter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            {BUDGETS.map(b => {
              const isSelected = selectedBudget === b.value;
              return (
                <button
                  key={b.value}
                  onClick={() => onSelectBudget(b.value)}
                  className={`shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-semibold transition ${
                    isSelected
                      ? 'bg-brass-600 text-white shadow-sm'
                      : 'border border-ink/10 bg-white text-ink-soft hover:border-brass-400 hover:text-ink'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          <select
            value={selectedSignature}
            onChange={e => onSelectSignature(e.target.value)}
            className="cursor-pointer rounded-xl border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm focus:border-brass-400 focus:outline-none"
          >
            {SIGNATURES.map(sig => (
              <option key={sig.value} value={sig.value}>
                {sig.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-ink-faint">
          <span className="font-semibold">
            {totalFiltered} dari {totalAll} gear
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-50"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
