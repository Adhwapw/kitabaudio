import React from 'react';
import { GitCompareArrows, ChevronRight, Check, ShoppingBag } from 'lucide-react';
import { AudioItem } from '../types.ts';
import { getTierColor, getSignatureColor, formatPrice } from '../utils/audioTheme.ts';
import { ProductImage } from './ProductImage.tsx';

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
        className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5 shadow-sm transition hover:border-brass-400 hover:shadow active:scale-[0.99]"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <ProductImage item={item} className="h-11 w-11 rounded-xl" avatarSize="sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-ink transition group-hover:text-brass-800">
                {item.name}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${tierStyle.pillBg}`}>
                {item.tier}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
              <span className="font-semibold text-ink-soft">{item.brand}</span>
              <span>•</span>
              <span className="font-bold text-ink">{formatPrice(item.priceNumeric, item.price)}</span>
              <span>•</span>
              <span className="text-[11px]">{item.soundSignature}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {item.soundScore && (
            <span className="hidden rounded-lg border border-ink/10 bg-parchment px-2 py-0.5 text-xs font-bold text-ink-soft sm:inline-block">
              {item.soundScore}
            </span>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleCompare(item);
            }}
            className={`rounded-xl border p-2 transition ${
              isCompared
                ? 'border-ink bg-ink text-paper'
                : 'border-ink/10 bg-white text-ink-faint hover:border-brass-400 hover:text-brass-700'
            }`}
            title="Bandingkan gear ini"
          >
            {isCompared ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
          </button>
          <ChevronRight className="h-4 w-4 text-ink/20 transition group-hover:translate-x-0.5 group-hover:text-brass-700" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(item)}
      className="group flex cursor-pointer flex-col justify-between rounded-3xl border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brass-400 hover:shadow-md active:scale-[0.995]"
    >
      <div>
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <ProductImage item={item} className="h-20 w-20 rounded-2xl" avatarSize="md" />
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-black shadow-sm ${tierStyle.pillBg}`}>
              {item.tier}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleCompare(item);
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                isCompared
                  ? 'border-ink bg-ink text-paper'
                  : 'border-ink/10 bg-white text-ink-faint hover:border-brass-400 hover:text-brass-700'
              }`}
              title="Bandingkan"
            >
              {isCompared ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="mb-2">
          <div className="mb-0.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            <span>{item.brand}</span>
            <span>•</span>
            <span>{item.category}</span>
          </div>
          <h3 className="font-display line-clamp-2 text-lg font-bold leading-tight text-ink transition group-hover:text-brass-800">
            {item.name}
          </h3>
          {item.tagline && (
            <p className="mt-1 line-clamp-1 text-xs font-medium text-ink-faint">{item.tagline}</p>
          )}
        </div>

        <div className="my-3 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${sigStyle}`}>
            {item.soundSignature}
          </span>
          {item.driver && (
            <span className="max-w-[170px] truncate rounded-full border border-ink/10 bg-parchment px-2 py-0.5 text-[11px] font-medium text-ink-soft">
              {item.driver}
            </span>
          )}
          {item.soundScore && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              Skor {item.soundScore}
            </span>
          )}
        </div>

        {item.pros && item.pros.length > 0 && (
          <div className="my-2 space-y-1 rounded-2xl border border-ink/8 bg-parchment/60 p-2.5 text-xs text-ink-soft">
            {item.pros.slice(0, 2).map((pro, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-600">+</span>
                <span className="line-clamp-1">{pro}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-ink/8 pt-3.5">
        <div>
          <span className="block text-[10px] font-medium text-ink-faint">Estimasi harga</span>
          <span className="font-display text-base font-bold tracking-tight text-ink">
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
              className="rounded-xl border border-ink/10 bg-parchment p-2 text-ink-soft transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              title="Cari di Tokopedia"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
            </a>
          )}
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-ink/5 text-ink-faint transition group-hover:bg-ink group-hover:text-paper">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
};
