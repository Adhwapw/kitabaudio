import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { SPREADSHEET_TABS, SpreadsheetTab } from '../data/spreadsheetTabs.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface TabSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGid: string;
  onSelectTab: (tab: SpreadsheetTab) => void;
}

export const TabSelectorModal: React.FC<TabSelectorModalProps> = ({
  isOpen,
  onClose,
  activeGid,
  onSelectTab,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredTabs = SPREADSHEET_TABS.filter(
    t => t.label.toLowerCase().includes(search.toLowerCase()) ||
         t.category.toLowerCase().includes(search.toLowerCase()) ||
         t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-ink/10 bg-paper p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-display text-lg font-black tracking-tight text-ink">
              Daftar isi kitab
            </h2>
            <p className="mt-0.5 text-xs font-medium text-ink-soft">
              {SPREADSHEET_TABS.length} kategori perangkat dari spreadsheet
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink-faint transition hover:bg-ink/10 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari kategori (IEM, TWS, Dongle, Speaker, Kabel)…"
              className="w-full rounded-2xl border border-ink/10 bg-white py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-brass-500 focus:outline-none focus:ring-2 focus:ring-brass-200"
            />
          </div>
        </div>

        <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto py-2 pr-1">
          {filteredTabs.map(tab => {
            const isSelected = tab.gid === activeGid;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab);
                  onClose();
                }}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                  isSelected
                    ? 'border-ink bg-ink text-paper shadow'
                    : 'border-ink/10 bg-white text-ink hover:border-brass-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isSelected ? 'bg-white/15 text-paper' : 'bg-parchment text-brass-700'}`}>
                    <CategoryIcon name={tab.iconName} className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                      {tab.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'bg-brass-400 text-ink' : 'border border-brass-300 bg-brass-50 text-brass-800'}`}>
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 line-clamp-1 text-xs ${isSelected ? 'text-paper/70' : 'text-ink-faint'}`}>
                      {tab.description}
                    </p>
                  </div>
                </div>
                {tab.countEstimate ? (
                  <span className={`shrink-0 rounded-lg px-2 py-0.5 pl-3 text-xs font-semibold ${isSelected ? 'bg-white/20 text-paper' : 'bg-parchment text-ink-soft'}`}>
                    {tab.countEstimate}+ gear
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
