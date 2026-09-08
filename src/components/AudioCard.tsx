import React from 'react';
import { GitCompare, ChevronRight, Check, ExternalLink, ShoppingCart } from 'lucide-react';
import { AudioItem } from '../types.ts';
import { getTierColor, getSignatureColor, formatPrice } from '../utils/audioTheme.ts';
import { AudioTemplateAvatar } from './AudioTemplateAvatar.tsx';

interface AudioCardProps {
  item: AudioItem;
  viewMode: 'grid' | 'compact';
  onSelect: (item: AudioItem) => void;
  onToggleCompare: (item: AudioItem) => void;
  isCompared: boolean;
}

export const AudioCard: React.FC<AudioCardProps> = ({
  item,
  viewMode,
  onSelect,
  onToggleCompare,
  isCompared,
}) => {
  const tierStyle = getTierColor(item.tier);
  const sigStyle = getSignatureColor(item.soundSignature);

  if (viewMode === 'compact') {
    return (
      <div
        onClick={() => onSelect(item)}
        id={`audio-compact-${item.id}`}
        className="group relative flex items-center justify-between gap-3 p-3.5 bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-slate-300 rounded-2xl cursor-pointer transition-all shadow-2xs active:scale-[0.99]"
      >
        {/* Left: Avatar + Title & Brand */}
        <div className="flex items-center gap-3.5 min-w-0">
          <AudioTemplateAvatar
            category={item.category}
            name={item.name}
            brand={item.brand}
            tier={item.tier}
            size="sm"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition truncate">
                {item.name}
              </span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-black border ${tierStyle.pillBg}`}>
                Tier {item.tier}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-semibold text-slate-700">{item.brand}</span>
              <span>•</span>
              <span className="font-bold text-slate-900">
                {formatPrice(item.priceNumeric, item.price)}
              </span>
              <span>•</span>
              <span className="text-[11px] text-slate-500">{item.soundSignature}</span>
            </div>
          </div>
        </div>

        {/* Right: Scores & Compare Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {item.soundScore && (
            <span className="hidden sm:inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
              Score {item.soundScore}
            </span>
          )}

          <button
            onClick={e => {
              e.stopPropagation();
              onToggleCompare(item);
            }}
            id={`compact-compare-${item.id}`}
            className={`p-2 rounded-xl border text-xs transition ${
              isCompared
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Bandingkan item ini"
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
          </button>

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
        </div>
      </div>
    );
  }

  // Grid Mode (Revolut Card Layout)
  return (
    <div
      onClick={() => onSelect(item)}
      id={`audio-card-${item.id}`}
      className="group relative flex flex-col justify-between p-5 bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-slate-300 rounded-3xl cursor-pointer transition-all shadow-2xs hover:shadow-md active:scale-[0.995]"
    >
      {/* Top Row: Template Avatar, Tier Badge, & Compare Checkbox */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <AudioTemplateAvatar
            category={item.category}
            name={item.name}
            brand={item.brand}
            tier={item.tier}
            size="md"
          />

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border shadow-2xs ${tierStyle.pillBg}`}>
              Tier {item.tier}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleCompare(item);
              }}
              id={`card-compare-btn-${item.id}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs transition ${
                isCompared
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-800 hover:border-slate-300'
              }`}
              title="Bandingkan"
            >
              {isCompared ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Brand & Name */}
        <div className="mb-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
            <span>{item.brand}</span>
            <span>•</span>
            <span>{item.category}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition line-clamp-2">
            {item.name}
          </h3>
          {item.tagline && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
              {item.tagline}
            </p>
          )}
        </div>

        {/* Sound Signature & Highlights */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${sigStyle}`}>
            {item.soundSignature}
          </span>
          {item.driver && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 font-medium truncate max-w-[170px]">
              {item.driver}
            </span>
          )}
          {item.soundScore && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold">
              Score: {item.soundScore}
            </span>
          )}
        </div>

        {/* Pros summary */}
        {item.pros && item.pros.length > 0 && (
          <div className="text-xs text-slate-600 space-y-1 my-2 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
            {item.pros.slice(0, 2).map((pro, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">+</span>
                <span className="line-clamp-1 text-slate-600">{pro}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Row: Price & Buy links */}
      <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">Estimasi Harga</span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">
            {formatPrice(item.priceNumeric, item.price)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {item.buyUrl && (
            <a
              href={item.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 transition"
              title="Beli di Tokopedia"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </a>
          )}
          <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-500 transition">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
