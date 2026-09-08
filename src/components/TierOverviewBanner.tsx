import React from 'react';
import { AudioItem, AudioTier } from '../types';
import { getTierColor } from '../utils/audioTheme';

interface TierOverviewBannerProps {
  items: AudioItem[];
  selectedTier: string;
  onSelectTier: (tier: string) => void;
}

const TIER_ORDER: AudioTier[] = ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D'];

export const TierOverviewBanner: React.FC<TierOverviewBannerProps> = ({
  items,
  selectedTier,
  onSelectTier,
}) => {
  // Calculate distribution
  const counts: Record<string, number> = {};
  TIER_ORDER.forEach(t => {
    counts[t] = 0;
  });

  items.forEach(item => {
    if (counts[item.tier] !== undefined) {
      counts[item.tier]++;
    } else {
      counts[item.tier] = (counts[item.tier] || 0) + 1;
    }
  });

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Distribusi Tier Audio
        </span>
        <span className="text-[11px] text-slate-400">Ketuk tier untuk filter cepat</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {TIER_ORDER.map(tier => {
          const count = counts[tier] || 0;
          const isSelected = selectedTier === tier;
          const tStyle = getTierColor(tier);

          return (
            <button
              key={tier}
              id={`overview-tier-${tier.toLowerCase().replace('+', 'plus')}`}
              onClick={() => onSelectTier(selectedTier === tier ? 'All' : tier)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95 ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30 shadow-sm'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className={`font-black text-sm ${tStyle.badgeText}`}>{tier}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {count} <span className="text-[9px] opacity-75">gear</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
