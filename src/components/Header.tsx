import React from 'react';
import { Headphones, RefreshCw, FileSpreadsheet, GitCompare, Sparkles } from 'lucide-react';
import { SheetMetadata } from '../types';

interface HeaderProps {
  metadata: SheetMetadata;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenConfig: () => void;
  onOpenCompare: () => void;
  compareCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  isLoading,
  onRefresh,
  onOpenConfig,
  onOpenCompare,
  compareCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Source indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/10 shrink-0">
            <Headphones className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                Kitab Audio
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                Tier List
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  metadata.isCustom ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="truncate text-[11px]">
                {metadata.isCustom ? 'Spreedsheet Teman' : 'Database Referensi'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400">{metadata.rowCount} Gear</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Compare Button (Pops out when items selected) */}
          {compareCount > 0 && (
            <button
              onClick={onOpenCompare}
              id="header-compare-btn"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 animate-pulse"
              title="Bandingkan Device Terpilih"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Banding ({compareCount}/2)</span>
            </button>
          )}

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            id="header-sync-btn"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95 disabled:opacity-50"
            title="Cek pembaruan dari Spreedsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Sinkron</span>
          </button>

          {/* Spreadsheet Settings Button */}
          <button
            onClick={onOpenConfig}
            id="header-sheet-config-btn"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition active:scale-95 ${
              metadata.isCustom
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="font-semibold">{metadata.isCustom ? 'Tersambung' : 'Hubungkan'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
