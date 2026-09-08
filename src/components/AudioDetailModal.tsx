import React, { useState } from 'react';
import { 
  X, 
  ThumbsUp, 
  ExternalLink, 
  GitCompare, 
  Share2, 
  Check, 
  Cpu, 
  Music, 
  Activity, 
  ShoppingBag,
  Sparkles,
  Sliders,
  Volume2
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
    const text = `🎧 *${item.name}* (Tier ${item.tier})\n` +
      `🏷️ Brand: ${item.brand} | Kategori: ${item.category}\n` +
      `💰 Harga: ${formatPrice(item.priceNumeric, item.price)}\n` +
      `🎵 Sound Signature: ${item.soundSignature}\n` +
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white border border-slate-200/90 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header (Revolut Clean Style) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Kitab Audio
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-700 font-semibold">{item.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              id="detail-share-btn"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition"
              title="Salin ringkasan gear"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bagikan</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              id="detail-close-btn"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 no-scrollbar">
          {/* Main Gear Hero Header */}
          <div className="flex items-start gap-4">
            <AudioTemplateAvatar
              category={item.category}
              name={item.name}
              brand={item.brand}
              tier={item.tier}
              size="lg"
            />

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {item.brand}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mt-0.5">
                {item.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="text-lg font-black text-slate-900">
                  {formatPrice(item.priceNumeric, item.price)}
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${tierStyle.pillBg}`}>
                  Tier {item.tier}
                </span>
                {item.soundScore && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ★ Skor: {item.soundScore}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sub Tab Navigation */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab('tuning')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'tuning'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tonal & Teknis
            </button>
            <button
              onClick={() => setActiveSubTab('accessories')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'accessories'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Eartips & EQ
            </button>
          </div>

          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              {/* Sound Profile and Specs Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                    <Activity className="w-3.5 h-3.5 text-slate-600" />
                    <span>Sound Profile</span>
                  </div>
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${sigStyle}`}>
                    {item.soundSignature}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-600" />
                    <span>Konfigurasi Driver</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">
                    {item.driver || 'Driver Terkurasi'}
                  </div>
                </div>
              </div>

              {/* Reviewer Impressions Notes */}
              <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Catatan & Impresi Reviewer</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {item.notes}
                </p>
              </div>

              {/* Pros and Highlights */}
              {item.pros && item.pros.length > 0 && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                    Kelebihan Utama
                  </div>
                  <div className="space-y-1.5">
                    {item.pros.map((pro, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-emerald-950 font-medium">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
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
              {/* Tonality Metrics */}
              {item.tonalityMetrics && Object.keys(item.tonalityMetrics).length > 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Detail Tonality
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(item.tonalityMetrics).map(([k, v]) => (
                      <div key={k} className="p-2 bg-white rounded-xl border border-slate-200/60">
                        <span className="text-slate-400 block text-[10px] font-medium">{k}</span>
                        <span className="font-bold text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-600">
                  Karakter suara utama berfokus pada <strong>{item.soundSignature}</strong>.
                </div>
              )}

              {/* Technicality Metrics */}
              {item.technicalityMetrics && Object.keys(item.technicalityMetrics).length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Detail Teknis & Resolusi
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(item.technicalityMetrics).map(([k, v]) => (
                      <div key={k} className="p-2 bg-white rounded-xl border border-slate-200/60">
                        <span className="text-slate-400 block text-[10px] font-medium">{k}</span>
                        <span className="font-bold text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'accessories' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 font-bold block text-xs uppercase mb-1">
                    Eartips Yang Cocok
                  </span>
                  <p className="text-slate-800 font-semibold">
                    {item.suitableEartips || 'Kombinasi eartips silikon bawaan atau Spinfit CP100 / Tang Sancai.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/70">
                  <span className="text-slate-400 font-bold block text-xs uppercase mb-1">
                    Rekomendasi Kabel
                  </span>
                  <p className="text-slate-800 font-semibold">
                    {item.recommendedCable || 'Kabel tembaga OFC 2-pin / MMCX 4.4mm balanced.'}
                  </p>
                </div>

                {item.parametricEq && (
                  <div className="pt-3 border-t border-slate-200/70">
                    <span className="text-slate-400 font-bold block text-xs uppercase mb-1">
                      Setting Parametric EQ
                    </span>
                    <pre className="text-xs bg-slate-900 text-emerald-400 p-2.5 rounded-xl overflow-x-auto font-mono">
                      {item.parametricEq}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions (Revolut Style) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onToggleCompare(item)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition ${
              isCompared
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>{isCompared ? 'Sedang Dibandingkan' : 'Bandingkan Gear'}</span>
          </button>

          <div className="flex items-center gap-2">
            {item.buyUrl && (
              <a
                href={item.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tokopedia</span>
              </a>
            )}

            {item.shopeeUrl && (
              <a
                href={item.shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shopee</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
