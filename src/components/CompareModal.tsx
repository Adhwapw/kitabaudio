import React from 'react';
import { X, GitCompare, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { AudioItem } from '../types.ts';
import { getTierColor, getSignatureColor, formatPrice } from '../utils/audioTheme.ts';
import { AudioTemplateAvatar } from './AudioTemplateAvatar.tsx';

interface CompareModalProps {
  items: AudioItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  items,
  isOpen,
  onClose,
  onRemoveItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const itemA = items[0];
  const itemB = items[1];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white border border-slate-200/90 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Komparasi Audio Head-to-Head (A/B)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Bandingkan karakter tonal, konfigurasi, dan impresi suara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <GitCompare className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">Belum ada perangkat yang dipilih</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Centang tombol timbangan / compare pada kartu perangkat untuk membandingkan.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Compare Head-to-Head Header Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Item A */}
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-3xl relative">
                  <button
                    onClick={() => onRemoveItem(itemA.id)}
                    className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-white transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <AudioTemplateAvatar
                    category={itemA.category}
                    name={itemA.name}
                    brand={itemA.brand}
                    tier={itemA.tier}
                    size="md"
                    className="mb-3"
                  />
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getTierColor(itemA.tier).pillBg}`}>
                    Tier {itemA.tier}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                    {itemA.name}
                  </h3>
                  <p className="text-xs font-black text-slate-900 mt-1">
                    {formatPrice(itemA.priceNumeric, itemA.price)}
                  </p>
                </div>

                {/* Item B */}
                {itemB ? (
                  <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-3xl relative">
                    <button
                      onClick={() => onRemoveItem(itemB.id)}
                      className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-white transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <AudioTemplateAvatar
                      category={itemB.category}
                      name={itemB.name}
                      brand={itemB.brand}
                      tier={itemB.tier}
                      size="md"
                      className="mb-3"
                    />
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getTierColor(itemB.tier).pillBg}`}>
                      Tier {itemB.tier}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                      {itemB.name}
                    </h3>
                    <p className="text-xs font-black text-slate-900 mt-1">
                      {formatPrice(itemB.priceNumeric, itemB.price)}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center text-slate-400">
                    <p className="text-xs font-bold text-slate-600">Pilih Gear Ke-2</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pilih satu perangkat lagi di daftar untuk perbandingan langsung.
                    </p>
                  </div>
                )}
              </div>

              {/* Side-by-Side Comparison Specs */}
              {itemA && itemB && (
                <div className="space-y-3 text-xs">
                  {/* Sound Signature */}
                  <div className="p-3 bg-white border border-slate-200/80 rounded-2xl">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1.5">
                      Karakter Suara
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <span className="font-bold text-slate-900">{itemA.soundSignature}</span>
                      <span className="font-bold text-slate-900">{itemB.soundSignature}</span>
                    </div>
                  </div>

                  {/* Driver Spec */}
                  <div className="p-3 bg-white border border-slate-200/80 rounded-2xl">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1.5">
                      Konfigurasi Driver
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <span className="text-slate-700">{itemA.driver || 'Dynamic Driver'}</span>
                      <span className="text-slate-700">{itemB.driver || 'Dynamic Driver'}</span>
                    </div>
                  </div>

                  {/* Reviewer Impressions */}
                  <div className="p-3 bg-white border border-slate-200/80 rounded-2xl">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1.5">
                      Impresi & Catatan
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <p className="text-slate-600 line-clamp-4">{itemA.notes}</p>
                      <p className="text-slate-600 line-clamp-4">{itemB.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
