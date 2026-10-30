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
        className="card card-border group flex-row items-center justify-between gap-3 p-3.5 shadow-sm transition hover:border-brass-400 hover:shadow active:scale-[0.99]"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <ProductImage item={item} className="h-11 w-11 rounded-xl" avatarSize="sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-base-content transition group-hover:text-brass-800">
                {item.name}
              </span>
              <span className={`badge badge-sm font-black ${tierStyle.pillBg}`}>
                {item.tier}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-base-content/60">
              <span className="font-semibold text-base-content/70">{item.brand}</span>
              <span aria-hidden="true">•</span>
              <span className="font-bold text-base-content">{formatPrice(item.priceNumeric, item.price)}</span>
              <span aria-hidden="true">•</span>
              <span className="text-[11px]">{item.soundSignature}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {item.soundScore && (
            <span className="badge badge-soft hidden sm:inline-flex border border-base-content/10 bg-base-200 px-2 py-0.5 text-xs font-bold text-base-content/70">
              {item.soundScore}
            </span>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleCompare(item);
            }}
            className={`btn btn-circle btn-sm ${isCompared ? 'btn-primary' : 'btn-ghost border border-base-content/10'}`}
            title="Bandingkan gear ini"
            aria-label={`Bandingkan ${item.name}`}
            aria-pressed={isCompared}
          >
            {isCompared ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label={`Lihat detail ${item.name}`}
          >
            <ChevronRight className="h-4 w-4 text-base-content/40 transition group-hover:translate-x-0.5 group-hover:text-brass-700" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <article
      onClick={() => onSelect(item)}
      className="card card-border group flex flex-col justify-between p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brass-400 hover:shadow-md active:scale-[0.995]"
    >
      <div className="card-body p-0">
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <ProductImage item={item} className="h-20 w-20 rounded-2xl" avatarSize="md" />
          <div className="flex items-center gap-2">
            <span className={`badge font-black shadow-sm ${tierStyle.pillBg}`}>
              {item.tier}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleCompare(item);
              }}
              className={`btn btn-circle btn-sm ${isCompared ? 'btn-primary' : 'btn-ghost border border-base-content/10'}`}
              title="Bandingkan"
              aria-label={`Bandingkan ${item.name}`}
              aria-pressed={isCompared}
            >
              {isCompared ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="mb-2">
          <div className="mb-0.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/60">
            <span>{item.brand}</span>
            <span aria-hidden="true">•</span>
            <span>{item.category}</span>
          </div>
          <h3 className="card-title font-display line-clamp-2 text-lg font-bold leading-tight text-base-content transition group-hover:text-brass-800">
            {item.name}
          </h3>
          {item.tagline && (
            <p className="mt-1 line-clamp-1 text-xs font-medium text-base-content/60">{item.tagline}</p>
          )}
        </div>

        <div className="my-3 flex flex-wrap items-center gap-1.5">
          <span className={`badge badge-sm font-medium ${sigStyle}`}>
            {item.soundSignature}
          </span>
          {item.driver && (
            <span className="badge badge-sm max-w-[170px] truncate border border-base-content/10 bg-base-200 font-medium text-base-content/70">
              {item.driver}
            </span>
          )}
          {item.soundScore && (
            <span className="badge badge-sm border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800">
              Skor {item.soundScore}
            </span>
          )}
        </div>

        {item.pros && item.pros.length > 0 && (
          <div className="my-2 space-y-1 rounded-2xl border border-base-content/10 bg-base-200/60 p-2.5 text-xs text-base-content/70">
            {item.pros.slice(0, 2).map((pro, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-600" aria-hidden="true">+</span>
                <span className="line-clamp-1">{pro}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-base-content/10 pt-3.5">
        <div>
          <span className="block text-[10px] font-medium text-base-content/60">Estimasi harga</span>
          <span className="font-display text-base font-bold tracking-tight text-base-content">
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
              className="btn btn-circle btn-sm btn-ghost border border-base-content/10 bg-base-200"
              title="Cari di Tokopedia"
              aria-label={`Cari ${item.name} di Tokopedia`}
            >
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label={`Lihat detail ${item.name}`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
