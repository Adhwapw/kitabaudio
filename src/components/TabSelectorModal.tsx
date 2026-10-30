import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTabs = SPREADSHEET_TABS.filter(
    t => t.label.toLowerCase().includes(search.toLowerCase()) ||
         t.category.toLowerCase().includes(search.toLowerCase()) ||
         t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="modal modal-open"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Daftar isi kitab"
        className="modal-box flex max-h-[85vh] w-full max-w-2xl flex-col bg-base-100"
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
            className="btn btn-circle btn-ghost btn-sm"
            aria-label="Tutup daftar kategori"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-3">
          <label className="input w-full">
            <Search className="h-4 w-4 text-base-content/60" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari kategori (IEM, TWS, Dongle, Speaker, Kabel)"
              aria-label="Cari kategori"
              className="grow text-sm"
            />
          </label>
        </div>

        <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto py-2 pr-1">
          {filteredTabs.map(tab => {
            const isSelected = tab.gid === activeGid;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab);
                  onClose();
                }}
                aria-current={isSelected ? 'true' : undefined}
                className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-content shadow'
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
                  <span className={`badge badge-sm shrink-0 ${isSelected ? 'bg-white/20 text-paper' : 'bg-base-200 text-base-content/70'}`}>
                    {tab.countEstimate}+ gear
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
