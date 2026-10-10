/**
 * sheetStore.ts — Penyimpanan data tab spreadsheet yang dipakai bersama
 * semua halaman. Satu tab hanya di-fetch sekali; halaman lain memakai ulang.
 *
 * Fitur "selalu terhubung":
 * - Auto-refresh tiap 10 menit untuk tab yang sedang dilihat
 * - Refresh otomatis saat tab browser kembali aktif / koneksi online kembali
 * - Dedupe: beberapa komponen meminta tab yang sama => satu request saja
 */
import { useSyncExternalStore, useEffect } from 'react';
import { syncTab, SyncResult, getSheetId } from '../utils/sheetSync.ts';
import { SPREADSHEET_TABS } from './spreadsheetTabs.ts';

export type TabStatus = 'idle' | 'syncing' | 'ready' | 'error';

const AUTO_REFRESH_MS = 10 * 60 * 1000;

const results = new Map<string, SyncResult>();
const statuses = new Map<string, TabStatus>();
const inFlight = new Map<string, Promise<SyncResult>>();
const listeners = new Set<() => void>();
const lastRefreshAt = new Map<string, number>();

// Version tick: naik setiap emit() agar useSyncExternalStore me-render ulang.
// (Snapshot yang nilainya tidak pernah berubah membuat React mengira tidak
// ada yang berubah, sehingga komponen tidak pernah re-render.)
let storeVersion = 0;

// gid tab yang sedang dilihat pengguna (untuk auto-refresh)
let activeGid: string | null = null;
let autoRefreshStarted = false;
const activeGidListeners = new Set<() => void>();

function emitActiveGid() {
  activeGidListeners.forEach(fn => fn());
}

export function setActiveGid(gid: string | null) {
  if (activeGid === gid) return;
  activeGid = gid;
  emitActiveGid();
}

/** Hook: gid tab yang sedang dilihat (untuk badge status di header). */
export function useActiveGid(): string | null {
  useSyncExternalStore(
    (fn: () => void) => {
      activeGidListeners.add(fn);
      return () => {
        activeGidListeners.delete(fn);
      };
    },
    () => activeGid,
    () => activeGid,
  );
  return activeGid;
}

function emit() {
  storeVersion++;
  listeners.forEach(fn => fn());
}

export function subscribeStore(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot() {
  return storeVersion;
}

export function getTabResult(gid: string): SyncResult | null {
  return results.get(gid) || null;
}

/** Kosongkan seluruh cache (dipakai saat sumber spreadsheet diganti). */
export function resetStore(): void {
  results.clear();
  statuses.clear();
  inFlight.clear();
  lastRefreshAt.clear();
  emit();
}

export function getTabStatus(gid: string): TabStatus {
  return statuses.get(gid) || 'idle';
}

/**
 * Pastikan data tab tersedia. Mengembalikan hasil (dari cache memori bila ada).
 * Opsi force untuk refresh manual.
 */
export async function ensureTab(gid: string, opts: { force?: boolean } = {}): Promise<SyncResult> {
  const existing = inFlight.get(gid);
  if (existing) return existing;

  const cached = results.get(gid);
  if (cached && !opts.force) {
    return cached;
  }

  statuses.set(gid, 'syncing');
  emit();

  const promise = syncTab(gid, { force: opts.force, sheetId: getSheetId() })
    .then(result => {
      results.set(gid, result);
      statuses.set(gid, result.items.length > 0 ? 'ready' : 'error');
      lastRefreshAt.set(gid, Date.now());
      return result;
    })
    .catch(() => {
      statuses.set(gid, 'error');
      const fallback = results.get(gid);
      if (!fallback) throw new Error('Gagal memuat data');
      return fallback;
    })
    .finally(() => {
      inFlight.delete(gid);
      emit();
    });

  inFlight.set(gid, promise);
  return promise;
}

/** Hook React: data + status satu tab, auto-load saat dipakai. */
export function useTabData(gid: string): { result: SyncResult | null; status: TabStatus; refresh: (force?: boolean) => Promise<SyncResult> } {
  useSyncExternalStore(subscribeStore, getSnapshot, getSnapshot);

  const result = getTabResult(gid);
  const status = getTabStatus(gid);

  useEffect(() => {
    if (!getTabResult(gid) && getTabStatus(gid) === 'idle') {
      void ensureTab(gid);
    }
  }, [gid]);

  return {
    result,
    status,
    refresh: (force = true) => ensureTab(gid, { force }),
  };
}

/** Hook ringan: status koneksi global untuk badge di header. */
export function useSyncStatus(gid: string): { source: SyncResult['source'] | null; status: TabStatus; syncedAt: string | null } {
  useSyncExternalStore(subscribeStore, getSnapshot, getSnapshot);
  const result = getTabResult(gid);
  return {
    source: result ? result.source : null,
    status: getTabStatus(gid),
    syncedAt: result ? result.syncedAt : null,
  };
}

function refreshIfStale(gid: string) {
  const last = lastRefreshAt.get(gid) || 0;
  if (Date.now() - last < AUTO_REFRESH_MS) return;
  if (document.hidden) return;
  void ensureTab(gid, { force: true });
}

/** Dipanggil sekali dari App: interval + visibility + online listener. */
export function startAutoRefresh() {
  if (autoRefreshStarted || typeof window === 'undefined') return;
  autoRefreshStarted = true;

  window.setInterval(() => {
    if (activeGid) refreshIfStale(activeGid);
  }, 60 * 1000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && activeGid) refreshIfStale(activeGid);
  });

  window.addEventListener('online', () => {
    if (activeGid) void ensureTab(activeGid, { force: true });
  });
}

/** Total estimasi gear di semua tab (untuk statistik halaman Beranda). */
export function getTotalGearEstimate(): number {
  return SPREADSHEET_TABS.reduce((sum, t) => sum + (t.countEstimate || 0), 0);
}
