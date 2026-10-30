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
 * hijau = data segar dari spreadsheet, kuning gelap = cache lokal,
 * netral = snapshot bawaan. Warna diambil dari tema kitab daisyUI,
 * bukan dari utilitas ad hoc, agar satu sumber kebenaran warna.
 */
export const SyncBadge: React.FC<SyncBadgeProps> = ({
  source, status, syncedAt, onRefresh, compact,
}) => {
  const syncing = status === 'syncing';

  const config = (() => {
    if (syncing) {
      return { icon: RefreshCw, spin: true, label: 'Menyinkronkan…', cls: 'badge-secondary' };
    }
    switch (source) {
      case 'live':
        return { icon: Wifi, spin: false, label: `Live • ${timeAgo(syncedAt)}`, cls: 'badge-success' };
      case 'cache':
        return { icon: History, spin: false, label: `Cache • ${timeAgo(syncedAt)}`, cls: 'badge-warning' };
      case 'preloaded':
        return { icon: Database, spin: false, label: 'Data bawaan', cls: 'badge-neutral' };
      default:
        return { icon: WifiOff, spin: false, label: 'Menghubungkan…', cls: 'badge-ghost border border-base-content/20' };
    }
  })();

  const Icon = config.icon;

  return (
    <button
      onClick={onRefresh}
      disabled={syncing || !onRefresh}
      title={syncing ? 'Sedang menyinkronkan' : 'Ketuk untuk sinkronkan ulang dari spreadsheet'}
      className={`badge ${config.cls} ${compact ? 'badge-sm' : ''} gap-1.5 font-semibold active:scale-95`}
    >
      <Icon className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${config.spin ? 'animate-spin' : ''}`} aria-hidden="true" />
      <span>{config.label}</span>
    </button>
  );
};
