import React from 'react';
import {
  GitCompareArrows, Trash2, RotateCcw, ShoppingBag, ArrowRight,
  Check, Minus, ExternalLink,
} from 'lucide-react';
import { navigate } from '../router.ts';
import { AudioItem } from '../types.ts';
import { AudioTemplateAvatar } from '../components/AudioTemplateAvatar.tsx';
import { getTierColor, getSignatureColor, formatPrice } from '../utils/audioTheme.ts';

interface ComparePageProps {
  items: AudioItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onSelectItem: (item: AudioItem) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr_1fr] items-start gap-2 border-b border-ink/8 px-4 py-3.5 text-sm last:border-0 sm:grid-cols-[160px_1fr_1fr]">
      <span className="pt-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">{label}</span>
      {children}
    </div>
  );
}

export const ComparePage: React.FC<ComparePageProps> = ({
  items, onRemoveItem, onClearAll, onSelectItem,
}) => {
  const [a, b] = items;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-parchment text-brass-700">
          <GitCompareArrows className="h-8 w-8" />
        </span>
        <h1 className="font-display text-3xl font-black tracking-tight">Bandingkan dua gear</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Pilih dua perangkat dari katalog — ketuk ikon timbangan pada kartunya —
          lalu kembali ke sini untuk adu head-to-head: tier, harga, karakter suara, dan impresi reviewer.
        </p>
        <button
          onClick={() => navigate({ page: 'catalog' })}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition hover:bg-brass-800 active:scale-95"
        >
          Buka katalog <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const renderCell = (item: AudioItem | undefined, render: (it: AudioItem) => React.ReactNode) => (
    <div className="min-w-0">{item ? render(item) : <span className="text-ink-faint">—</span>}</div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-brass-700">Adu head-to-head</p>
          <h1 className="font-display text-3xl font-black tracking-tight">Bandingkan Gear</h1>
        </div>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Kosongkan
        </button>
      </div>

      {/* Kartu header A vs B */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {[a, b].map((item, idx) => (
          <div key={idx} className="relative rounded-3xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
            {item ? (
              <>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-ink-faint transition hover:bg-rose-50 hover:text-rose-600"
                  title="Hapus dari perbandingan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => onSelectItem(item)} className="block w-full text-left">
                  <AudioTemplateAvatar category={item.category} name={item.name} brand={item.brand} tier={item.tier} size="md" className="mb-3" />
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-black ${getTierColor(item.tier).pillBg}`}>
                    Tier {item.tier}
                  </span>
                  <h3 className="mt-1.5 truncate text-sm font-bold text-ink sm:text-base">{item.name}</h3>
                  <p className="text-xs font-semibold text-ink-soft">{item.brand}</p>
                  <p className="font-display mt-1 text-lg font-bold text-ink">{formatPrice(item.priceNumeric, item.price)}</p>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate({ page: 'catalog' })}
                className="flex h-full min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 p-4 text-center transition hover:border-brass-400 hover:bg-brass-50/50"
              >
                <GitCompareArrows className="mb-2 h-6 w-6 text-ink-faint" />
                <span className="text-xs font-bold text-ink">Tambah gear ke-{idx + 1}</span>
                <span className="mt-0.5 text-[11px] text-ink-faint">Pilih dari katalog</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {a && b && (
        <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
          <Row label="Tier">
            {renderCell(a, it => (
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-black ${getTierColor(it.tier).pillBg}`}>{it.tier}</span>
            ))}
            {renderCell(b, it => (
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-black ${getTierColor(it.tier).pillBg}`}>{it.tier}</span>
            ))}
          </Row>
          <Row label="Harga">
            {renderCell(a, it => <span className="font-bold text-ink">{formatPrice(it.priceNumeric, it.price)}</span>)}
            {renderCell(b, it => <span className="font-bold text-ink">{formatPrice(it.priceNumeric, it.price)}</span>)}
          </Row>
          <Row label="Karakter">
            {renderCell(a, it => (
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSignatureColor(it.soundSignature)}`}>{it.soundSignature}</span>
            ))}
            {renderCell(b, it => (
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSignatureColor(it.soundSignature)}`}>{it.soundSignature}</span>
            ))}
          </Row>
          <Row label="Driver">
            {renderCell(a, it => <span className="text-ink-soft">{it.driver || '—'}</span>)}
            {renderCell(b, it => <span className="text-ink-soft">{it.driver || '—'}</span>)}
          </Row>
          {((a.soundScore || b.soundScore)) && (
            <Row label="Skor">
              {renderCell(a, it => <span className="font-bold text-ink">{it.soundScore || '—'}</span>)}
              {renderCell(b, it => <span className="font-bold text-ink">{it.soundScore || '—'}</span>)}
            </Row>
          )}
          <Row label="Kelebihan">
            {renderCell(a, it => (
              <ul className="space-y-1">
                {it.pros.slice(0, 4).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-ink-soft">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {p}
                  </li>
                ))}
              </ul>
            ))}
            {renderCell(b, it => (
              <ul className="space-y-1">
                {it.pros.slice(0, 4).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-ink-soft">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {p}
                  </li>
                ))}
              </ul>
            ))}
          </Row>
          <Row label="Impresi">
            {renderCell(a, it => <p className="line-clamp-5 text-xs leading-relaxed text-ink-soft">{it.notes}</p>)}
            {renderCell(b, it => <p className="line-clamp-5 text-xs leading-relaxed text-ink-soft">{it.notes}</p>)}
          </Row>
          <Row label="Beli">
            {renderCell(a, it => (
              <div className="flex flex-wrap gap-2">
                {it.buyUrl && (
                  <a href={it.buyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700">
                    <ShoppingBag className="h-3 w-3" /> Tokopedia
                  </a>
                )}
                {it.shopeeUrl && (
                  <a href={it.shopeeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-orange-600">
                    <ExternalLink className="h-3 w-3" /> Shopee
                  </a>
                )}
              </div>
            ))}
            {renderCell(b, it => (
              <div className="flex flex-wrap gap-2">
                {it.buyUrl && (
                  <a href={it.buyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700">
                    <ShoppingBag className="h-3 w-3" /> Tokopedia
                  </a>
                )}
                {it.shopeeUrl && (
                  <a href={it.shopeeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-orange-600">
                    <ExternalLink className="h-3 w-3" /> Shopee
                  </a>
                )}
              </div>
            ))}
          </Row>
        </div>
      )}

      {a && !b && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-brass-300 bg-brass-50 p-4 text-xs text-brass-900">
          <Minus className="h-4 w-4" />
          Tambahkan satu gear lagi untuk melihat tabel perbandingan lengkap.
        </p>
      )}
    </div>
  );
};
