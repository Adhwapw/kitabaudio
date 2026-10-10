import React from 'react';
import { Wifi, WifiOff, RefreshCw, Database, History } from 'lucide-react';
import { SyncResult } from '../utils/sheetSync.ts';
import { TabStatus } from '../data/sheetStore.ts';

interface SyncBadgeProps {
  source: SyncResult['source'] | null;
  status: TabStatus;
  syncedAt: string | null;
  onRefresh?: () => void;
  compact?: boolean;
}

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

/**
 * Indikator jujur status koneksi spreadsheet:
 * hijau = data segar dari spreadsheet, kuning = cache lokal, abu = snapshot bawaan.
 */
export const SyncBadge: React.FC<SyncBadgeProps> = ({
  source, status, syncedAt, onRefresh, compact,
}) => {
  const syncing = status === 'syncing';

  const config = (() => {
    if (syncing) {
      return { icon: RefreshCw, spin: true, label: 'Menyinkronkan…', cls: 'bg-brass-100 text-brass-800 border-brass-300' };
    }
    switch (source) {
      case 'live':
      case 'server':
        return { icon: Wifi, spin: false, label: `Live • ${timeAgo(syncedAt)}`, cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'cache':
        return { icon: History, spin: false, label: `Cache • ${timeAgo(syncedAt)}`, cls: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'preloaded':
        return { icon: Database, spin: false, label: 'Data bawaan', cls: 'bg-stone-100 text-stone-600 border-stone-200' };
      default:
        return { icon: WifiOff, spin: false, label: 'Menghubungkan…', cls: 'bg-stone-100 text-stone-500 border-stone-200' };
    }
  })();

  const Icon = config.icon;

  return (
    <button
      onClick={onRefresh}
      disabled={syncing || !onRefresh}
      title={syncing ? 'Sedang menyinkronkan' : 'Ketuk untuk sinkronkan ulang dari spreadsheet'}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition active:scale-95 disabled:cursor-default ${config.cls} ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'}`}
    >
      <Icon className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${config.spin ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </button>
  );
};
