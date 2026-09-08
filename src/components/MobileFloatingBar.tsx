import React from 'react';
import { GitCompare, RefreshCw, Layers, ArrowUp, BookOpen } from 'lucide-react';

interface MobileFloatingBarProps {
  compareCount: number;
  onOpenCompare: () => void;
  onRefresh: () => void;
  onOpenTabSelector: () => void;
  onOpenAuthorNotes: () => void;
  isLoading: boolean;
  activeTabLabel: string;
}

export const MobileFloatingBar: React.FC<MobileFloatingBarProps> = ({
  compareCount,
  onOpenCompare,
  onRefresh,
  onOpenTabSelector,
  onOpenAuthorNotes,
  isLoading,
  activeTabLabel,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-sm sm:hidden">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-full shadow-2xl p-1.5 flex items-center justify-between gap-1 text-white">
        {/* Tab switch button */}
        <button
          onClick={onOpenTabSelector}
          id="mobile-nav-tabs"
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-full text-xs font-bold hover:bg-slate-800 transition active:scale-95 text-slate-200"
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[70px]">{activeTabLabel}</span>
        </button>

        {/* Compare button */}
        <button
          onClick={onOpenCompare}
          id="mobile-nav-compare"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-xs font-bold transition active:scale-95 ${
            compareCount > 0
              ? 'bg-blue-600 text-white shadow-md'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Banding ({compareCount})</span>
        </button>

        {/* Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          id="mobile-nav-sync"
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition active:scale-95 disabled:opacity-50"
          title="Sinkronkan sheet"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        {/* Scroll Top */}
        <button
          onClick={scrollToTop}
          id="mobile-nav-scroll-top"
          className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
          title="Ke Atas"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
