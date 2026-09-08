import React from 'react';
import { RefreshCw, GitCompare, Layers, BookOpen, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { SpreadsheetTab } from '../data/spreadsheetTabs.ts';
import { AudioItem } from '../types.ts';

interface RevolutHeroCardProps {
  tab: SpreadsheetTab;
  items: AudioItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCompare: () => void;
  onOpenTabSelector: () => void;
  onOpenAuthorNotes: () => void;
  compareCount: number;
  lastSyncedAt?: string;
  isPreloadedFallback?: boolean;
}

export const RevolutHeroCard: React.FC<RevolutHeroCardProps> = ({
  tab,
  items,
  isLoading,
  onRefresh,
  onOpenCompare,
  onOpenTabSelector,
  onOpenAuthorNotes,
  compareCount,
  lastSyncedAt,
  isPreloadedFallback,
}) => {
  // Calculate quick metrics
  const topTierCount = items.filter(i => i.tier === 'SS' || i.tier === 'S+' || i.tier === 'S').length;
  const prices = items.map(i => i.priceNumeric).filter(p => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const formatShortPrice = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `${Math.round(val / 1000)}rb`;
    return '0';
  };

  return (
    <div
      id="revolut-hero-card"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] p-5 sm:p-7 relative overflow-hidden transition-all"
    >
      {/* Subtle background ambient graphic */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-slate-100/80 via-transparent to-transparent -mr-16 -mt-16 pointer-events-none" />

      {/* Top row: Tab Info & Live Sync Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
            {tab.category}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-600 font-medium">
            Google Sheet ID: 1KXDCrM...
          </span>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-600 font-medium">
            {isPreloadedFallback ? 'Mode Snapshot Cepat' : 'Tersinkron Otomatis'}
          </span>
          {lastSyncedAt && (
            <span className="text-slate-400 hidden sm:inline">
              ({new Date(lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
            </span>
          )}
        </div>
      </div>

      {/* Main Revolut Balance-Style Metric Headline */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {items.length} Perangkat
          </h1>
          <span className="text-sm sm:text-base font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            ★ {topTierCount} Top Tier
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 max-w-xl">
          {tab.description || 'Database kurasi audio terlengkap dengan impresi suara, eartips, dan harga.'}
        </p>
      </div>

      {/* Revolut Quick Action Buttons (Pill & Circular Icons) */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
        {/* Sinkronkan Button */}
        <button
          id="hero-btn-sync"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-xs sm:text-sm hover:bg-slate-800 shadow-xs transition active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          <span>{isLoading ? 'Menyinkronkan...' : '+ Sinkronkan Sheet'}</span>
        </button>

        {/* Bandingkan Button */}
        <button
          id="hero-btn-compare"
          onClick={onOpenCompare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition active:scale-95 border border-slate-200/80"
        >
          <GitCompare className="w-4 h-4 text-slate-600" />
          <span>Bandingkan</span>
          {compareCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {compareCount}
            </span>
          )}
        </button>

        {/* Tab Selector Button */}
        <button
          id="hero-btn-tabs"
          onClick={onOpenTabSelector}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200/90 shadow-2xs transition active:scale-95"
        >
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Ganti Tab ({tab.label})</span>
        </button>

        {/* Disclaimer / Readme Button */}
        <button
          id="hero-btn-notes"
          onClick={onOpenAuthorNotes}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-semibold text-xs sm:text-sm border border-amber-200/70 transition active:scale-95"
        >
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span className="hidden sm:inline">Catatan Reviewer</span>
          <span className="sm:hidden">Catatan</span>
        </button>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Rentang Harga</span>
          <span className="font-bold text-slate-800 text-sm">
            {minPrice > 0 ? `${formatShortPrice(minPrice)} - ${formatShortPrice(maxPrice)}` : 'Bervariasi'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Endgame (SS & S+)</span>
          <span className="font-bold text-slate-800 text-sm">
            {items.filter(i => i.tier === 'SS' || i.tier === 'S+').length} Pilihan
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Tonal Terbanyak</span>
          <span className="font-bold text-slate-800 text-sm">
            Warm & Harman
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Link Pembelian</span>
          <span className="font-bold text-slate-800 text-sm flex items-center gap-1 text-blue-600">
            Tokopedia & Shopee
          </span>
        </div>
      </div>
    </div>
  );
};
