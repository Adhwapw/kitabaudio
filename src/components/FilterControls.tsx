import React from 'react';
import { LayoutGrid, ListFilter, RotateCcw } from 'lucide-react';
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
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1" role="group" aria-label="Filter tier">
          <span className="mr-1 hidden text-xs font-bold text-base-content/60 sm:inline">Tier:</span>
          <div className="join">
            {TIERS.map(tier => {
              const isSelected = selectedTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => onSelectTier(tier)}
                  aria-pressed={isSelected}
                  className={`btn btn-sm join-item ${isSelected ? 'btn-primary' : 'btn-ghost border border-base-content/10 bg-base-100'}`}
                >
                  {tier === 'All' ? 'Semua' : tier}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value as SortOption)}
            aria-label="Urutkan katalog"
            className="select select-sm w-auto font-semibold"
          >
            <option value="tier-desc">Tier terbaik</option>
            <option value="price-asc">Harga termurah</option>
            <option value="price-desc">Harga tertinggi</option>
            <option value="name-asc">Nama (A–Z)</option>
          </select>

          <div className="join" role="group" aria-label="Tampilan katalog">
            <button
              onClick={() => onViewModeChange('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Tampilan kartu"
              title="Tampilan kartu"
              className={`btn btn-sm btn-square join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost border border-base-content/10 bg-base-100'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              aria-pressed={viewMode === 'compact'}
              aria-label="Tampilan ringkas"
              title="Tampilan ringkas"
              className={`btn btn-sm btn-square join-item ${viewMode === 'compact' ? 'btn-primary' : 'btn-ghost border border-base-content/10 bg-base-100'}`}
            >
              <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto" role="group" aria-label="Filter budget">
            {BUDGETS.map(b => {
              const isSelected = selectedBudget === b.value;
              return (
                <button
                  key={b.value}
                  onClick={() => onSelectBudget(b.value)}
                  aria-pressed={isSelected}
                  className={`btn btn-xs ${isSelected ? 'btn-secondary' : 'btn-ghost border border-base-content/10 bg-base-100'}`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          <select
            value={selectedSignature}
            onChange={e => onSelectSignature(e.target.value)}
            aria-label="Filter karakter suara"
            className="select select-xs w-auto font-semibold"
          >
            {SIGNATURES.map(sig => (
              <option key={sig.value} value={sig.value}>
                {sig.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-base-content/60">
          <span className="font-semibold">
            {totalFiltered} dari {totalAll} gear
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="btn btn-ghost btn-xs text-error"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
