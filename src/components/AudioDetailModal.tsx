import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  GitCompareArrows,
  Share2,
  Check,
  Cpu,
  Activity,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { AudioItem } from '../types.ts';
import { getTierColor, getSignatureColor, formatPrice } from '../utils/audioTheme.ts';
import { AudioTemplateAvatar } from './AudioTemplateAvatar.tsx';

interface AudioDetailModalProps {
  item: AudioItem | null;
  onClose: () => void;
  onToggleCompare: (item: AudioItem) => void;
  isCompared: boolean;
}

export const AudioDetailModal: React.FC<AudioDetailModalProps> = ({
  item,
  onClose,
  onToggleCompare,
  isCompared,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tuning' | 'accessories'>('overview');

  if (!item) return null;

  const tierStyle = getTierColor(item.tier);
  const sigStyle = getSignatureColor(item.soundSignature);

  const handleShare = () => {
    const text =
      `🎧 *${item.name}* (Tier ${item.tier})\n` +
      `🏷️ Brand: ${item.brand} | Kategori: ${item.category}\n` +
      `💰 Harga: ${formatPrice(item.priceNumeric, item.price)}\n` +
      `🎵 Karakter: ${item.soundSignature}\n` +
      (item.soundScore ? `⭐ Skor: ${item.soundScore}\n` : '') +
      `📝 Impresi: "${item.notes}"\n\n` +
      `_Kitab Audio • Kurasi Fernanda Gunsan_`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-ink/10 bg-paper shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-ink/10 bg-white/60 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-brass-700">Kitab Audio</span>
            <span className="text-ink/20">•</span>
            <span className="text-xs font-semibold text-ink-soft">{item.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-brass-400 hover:text-ink"
              title="Salin ringkasan gear"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Konten */}
        <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <AudioTemplateAvatar
              category={item.category}
              name={item.name}
              brand={item.brand}
              tier={item.tier}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-faint">{item.brand}</div>
              <h2 className="font-display mt-0.5 text-xl font-black leading-snug tracking-tight text-ink sm:text-2xl">
                {item.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-bold text-ink">
                  {formatPrice(item.priceNumeric, item.price)}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-black shadow-sm ${tierStyle.pillBg}`}>
                  Tier {item.tier}
                </span>
                {item.soundScore && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    ★ Skor {item.soundScore}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sub-tab */}
          <div className="flex items-center gap-1 rounded-2xl border border-ink/10 bg-parchment/70 p-1">
            {(
              [
                ['overview', 'Overview'],
                ['tuning', 'Tonal & Teknis'],
                ['accessories', 'Eartips & EQ'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveSubTab(id)}
                className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                  activeSubTab === id ? 'bg-ink text-paper shadow' : 'text-ink-faint hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-ink/10 bg-white p-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                    <Activity className="h-3.5 w-3.5" />
                    <span>Karakter suara</span>
                  </div>
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${sigStyle}`}>
                    {item.soundSignature}
                  </span>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-white p-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Driver</span>
                  </div>
                  <div className="line-clamp-2 text-xs font-bold text-ink">
                    {item.driver || 'Terkurasi reviewer'}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-ink/10 bg-white p-4">
                <div className="eyebrow mb-2 flex items-center gap-1.5 text-brass-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Catatan reviewer</span>
                </div>
                <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-ink-soft">
                  {item.notes}
                </p>
              </div>

              {item.pros && item.pros.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="eyebrow mb-2 text-emerald-800">Kelebihan utama</div>
                  <div className="space-y-1.5">
                    {item.pros.map((pro, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-medium text-emerald-950">
                        <span className="shrink-0 font-bold text-emerald-600">✓</span>
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'tuning' && (
            <div className="space-y-4">
              {item.tonalityMetrics && Object.keys(item.tonalityMetrics).length > 0 ? (
                <div className="rounded-2xl border border-ink/10 bg-white p-4">
                  <h4 className="eyebrow mb-3 text-ink-soft">Detail tonality</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    {Object.entries(item.tonalityMetrics).map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-ink/8 bg-parchment/60 p-2">
                        <span className="block text-[10px] font-medium text-ink-faint">{k}</span>
                        <span className="font-bold text-ink">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-ink/10 bg-white p-4 text-xs text-ink-soft">
                  Karakter suara utama berfokus pada <strong className="text-ink">{item.soundSignature}</strong>.
                </div>
              )}

              {item.technicalityMetrics && Object.keys(item.technicalityMetrics).length > 0 && (
                <div className="rounded-2xl border border-ink/10 bg-white p-4">
                  <h4 className="eyebrow mb-3 text-ink-soft">Detail teknis</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    {Object.entries(item.technicalityMetrics).map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-ink/8 bg-parchment/60 p-2">
                        <span className="block text-[10px] font-medium text-ink-faint">{k}</span>
                        <span className="font-bold text-ink">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'accessories' && (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-white p-4 text-sm">
              <div>
                <span className="eyebrow mb-1 block text-ink-faint">Eartips yang cocok</span>
                <p className="font-semibold text-ink">
                  {item.suitableEartips || 'Eartips silikon bawaan atau Spinfit CP100 / Tang Sancai.'}
                </p>
              </div>
              <div className="border-t border-ink/8 pt-3">
                <span className="eyebrow mb-1 block text-ink-faint">Rekomendasi kabel</span>
                <p className="font-semibold text-ink">
                  {item.recommendedCable || 'Kabel tembaga OFC 2-pin / MMCX 4.4mm balanced.'}
                </p>
              </div>
              {item.parametricEq && (
                <div className="border-t border-ink/8 pt-3">
                  <span className="eyebrow mb-1 block text-ink-faint">Parametric EQ</span>
                  <pre className="overflow-x-auto rounded-xl bg-ink p-2.5 font-mono text-xs text-emerald-300">
                    {item.parametricEq}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Aksi bawah */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-white/60 p-4">
          <button
            onClick={() => onToggleCompare(item)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
              isCompared
                ? 'border-ink bg-ink text-paper'
                : 'border-ink/15 bg-white text-ink hover:border-brass-400'
            }`}
          >
            <GitCompareArrows className="h-4 w-4" />
            <span>{isCompared ? 'Sedang dibandingkan' : 'Bandingkan'}</span>
          </button>

          <div className="flex items-center gap-2">
            {item.buyUrl && (
              <a
                href={item.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 sm:text-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Tokopedia</span>
              </a>
            )}
            {item.shopeeUrl && (
              <a
                href={item.shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 sm:text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Shopee</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
