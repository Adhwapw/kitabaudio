import React from 'react';
import { RefreshCw, Search, Sparkles, BookOpen, Layers } from 'lucide-react';
import { SPREADSHEET_TABS, SpreadsheetTab } from '../data/spreadsheetTabs.ts';

interface RevolutHeaderProps {
  activeTabGid: string;
  onSelectTab: (tab: SpreadsheetTab) => void;
  onRefresh: () => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuthorNotes: () => void;
  onOpenTabSelectorModal: () => void;
  lastSyncedAt?: string;
  isFromCache?: boolean;
}

export const RevolutHeader: React.FC<RevolutHeaderProps> = ({
  activeTabGid,
  onSelectTab,
  onRefresh,
  isLoading,
  searchQuery,
  onSearchChange,
  onOpenAuthorNotes,
  onOpenTabSelectorModal,
  lastSyncedAt,
}) => {
  const activeTab = SPREADSHEET_TABS.find(t => t.gid === activeTabGid) || SPREADSHEET_TABS[0];

  return (
    <header className="sticky top-0 z-40 bg-[#f8fafd]/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Bar: Revolut Brand & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Revolut-style Monogram & Title */}
          <div className="flex items-center gap-3">
            <div
              id="revolut-brand-mark"
              className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs font-bold text-lg tracking-tighter cursor-pointer select-none ring-2 ring-slate-900/10"
              title="Kitab Audio"
            >
              KA
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Kitab Audio</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  Spreadsheet Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                Kurasi Audiophile • Fernanda Gunsan
              </p>
            </div>
          </div>

          {/* Right Action Icons (Revolut Style Circular/Pill Buttons) */}
          <div className="flex items-center gap-2">
            {/* Disclaimer & Readme button */}
            <button
              id="btn-read-me"
              onClick={onOpenAuthorNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors shadow-2xs"
              title="Baca Catatan Penting Reviewer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Catatan Reviewer</span>
              <span className="sm:hidden font-bold">Catatan</span>
            </button>

            {/* Quick Refresh / Re-scrape button */}
            <button
              id="btn-quick-refresh"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              title="Sinkronkan data dari Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden md:inline">Sinkronkan</span>
            </button>

            {/* Tab Grid / All Tabs button */}
            <button
              id="btn-all-tabs"
              onClick={onOpenTabSelectorModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-2xs transition-all active:scale-95"
              title="Pilih dari 21 Tab Spreadsheet"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Semua Tab ({SPREADSHEET_TABS.length})</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar in Header */}
        <div className="mt-3 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="header-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Cari perangkat audio di tab ${activeTab.label} (e.g. Sony, Tea Pro, 7Hz, Focal)...`}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-2xl border border-slate-200/90 text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded-md bg-slate-100"
            >
              Hapus
            </button>
          )}
        </div>
      </div>

      {/* Revolut Pill Navigation Strip (Horizontal scrollable) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 pb-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
        {SPREADSHEET_TABS.slice(0, 12).map((tab) => {
          const isActive = tab.gid === activeTabGid;
          return (
            <button
              key={tab.id}
              id={`tab-pill-${tab.id}`}
              onClick={() => onSelectTab(tab)}
              className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all select-none ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* More tabs button */}
        <button
          id="btn-more-tabs-strip"
          onClick={onOpenTabSelectorModal}
          className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition select-none flex items-center gap-1 border border-slate-200/60"
        >
          <span>+ Lainnya</span>
        </button>
      </div>
    </header>
  );
};
