import React from 'react';
import { ArrowUpRight, Award, ChevronRight } from 'lucide-react';
import { AudioItem } from '../types.ts';
import { AudioTemplateAvatar } from './AudioTemplateAvatar.tsx';

interface RevolutTopMoversProps {
  items: AudioItem[];
  onSelectItem: (item: AudioItem) => void;
  onFilterTopTier: () => void;
}

export const RevolutTopMovers: React.FC<RevolutTopMoversProps> = ({
  items,
  onSelectItem,
  onFilterTopTier,
}) => {
  // Find top tier audio gear (SS, S+, S)
  const topItems = items
    .filter(i => i.tier === 'SS' || i.tier === 'S+' || i.tier === 'S')
    .slice(0, 8);

  if (topItems.length === 0) return null;

  return (
    <div id="revolut-top-movers-section" className="my-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Top Tier & Endgame Gear
          </h2>
          <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full">
            Tier SS • S+ • S
          </span>
        </div>
        <button
          onClick={onFilterTopTier}
          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 transition"
        >
          <span>Lihat Semua</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Carousel Cards (Revolut Style) */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {topItems.map((item) => (
          <div
            key={item.id}
            id={`top-mover-${item.id}`}
            onClick={() => onSelectItem(item)}
            className="shrink-0 w-64 sm:w-72 bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            {/* Top row: Avatar & Tier Badge */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <AudioTemplateAvatar
                category={item.category}
                name={item.name}
                brand={item.brand}
                tier={item.tier}
                size="md"
              />
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2.5 py-0.5 text-xs font-black rounded-full shadow-2xs ${
                  item.tier === 'SS'
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                    : item.tier === 'S+'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-600 text-white'
                }`}>
                  Tier {item.tier}
                </span>
                {item.percentage && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <ArrowUpRight className="w-2.5 h-2.5" />
                    {item.percentage}
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Name and Highlights */}
            <div className="mb-3">
              <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition truncate">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {item.tagline || item.brand}
              </p>
              {item.soundScore && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    Score: {item.soundScore}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.soundSignature}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom row: Price & Arrow */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Estimasi Harga</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {item.price}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-500 transition">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
