import React from 'react';
import { X, ArrowUpDown, LayoutGrid, ListFilter, RotateCcw } from 'lucide-react';
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

const TIERS = ['All', 'SS', 'S+', 'S', 'A+', 'A', 'B+', 'B'];

const SIGNATURES: { label: string; value: SoundSignature }[] = [
  { label: 'Semua Tonal', value: 'All' },
  { label: 'Warm', value: 'Warm' },
  { label: 'Neutral', value: 'Neutral' },
  { label: 'Harman', value: 'Harman' },
  { label: 'V-Shape', value: 'V-Shape' },
  { label: 'Bright', value: 'Bright' },
  { label: 'Basshead', value: 'Basshead' },
  { label: 'Mid-Centric', value: 'Mid-Centric' },
];

const BUDGETS: { label: string; value: BudgetFilter }[] = [
  { label: 'Semua Harga', value: 'all' },
  { label: '< 500rb', value: 'under500k' },
  { label: '500rb - 1.5jt', value: '500k-1.5m' },
  { label: '1.5jt - 5jt', value: '1.5m-5m' },
  { label: '> 5jt (Endgame)', value: 'above5m' },
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
    <div id="revolut-filter-controls" className="my-5 space-y-3">
      {/* Top Filter Bar: Tier Pills + View Mode & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tier Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">
            Tier:
          </span>
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                id={`tier-filter-${tier}`}
                onClick={() => onSelectTier(tier)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition select-none ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {tier === 'All' ? 'Semua Tier' : tier}
              </button>
            );
          })}
        </div>

        {/* Right: Sort & Grid View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="pl-8 pr-6 py-1.5 text-xs font-semibold bg-white border border-slate-200/80 rounded-full text-slate-700 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="tier-desc">Tier Terbaik</option>
              <option value="price-asc">Harga Termurah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="name-asc">Nama (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-full border border-slate-200/80">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-full transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`p-1.5 rounded-full transition ${
                viewMode === 'compact' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Filter Row: Budget & Sound Signature */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Budget Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {BUDGETS.map((b) => {
              const isSelected = selectedBudget === b.value;
              return (
                <button
                  key={b.value}
                  onClick={() => onSelectBudget(b.value)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          {/* Sound Signature Select */}
          <select
            id="signature-select"
            value={selectedSignature}
            onChange={(e) => onSelectSignature(e.target.value)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200/80 rounded-xl text-slate-700 shadow-2xs focus:outline-none cursor-pointer"
          >
            {SIGNATURES.map((sig) => (
              <option key={sig.value} value={sig.value}>
                {sig.label}
              </option>
            ))}
          </select>
        </div>

        {/* Count & Reset */}
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-semibold">
            {totalFiltered} dari {totalAll} gear
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 rounded-md hover:bg-rose-50 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
