/**
 * sheetSync.ts — Mesin sinkronisasi spreadsheet Kitab Audio (client-side).
 *
 * Arsitektur data (diperbarui 10 Okt 2026):
 * Crawler terjadwal (scripts/crawl-sheet.ts + GitHub Actions tiap 6 jam)
 * menarik seluruh tab spreadsheet dan menyimpannya sebagai snapshot segar
 * di src/data/preloadedGunsanData.ts. Browser pengunjung memuat snapshot
 * itu dulu (cepat, tidak tergantung jaringan ke Google), lalu mencoba
 * sync live di background untuk data yang lebih segar.
 *
 * Urutan jalur pengambilan (fallback berlapis):
 *  1. Direct: gviz/tq?tqx=out:csv  (utama, data paling segar)
 *  2. Direct: export?format=csv     (cadangan bila gviz gagal)
 *  3. Cache localStorage (data terakhir yang berhasil, lengkap dengan timestamp)
 *  4. Snapshot bawaan hasil crawl (maksimal 6 jam + waktu deploy)
 *
 * Setiap percobaan jaringan memakai timeout + retry dengan exponential backoff.
 */
import Papa from 'papaparse';
import { parseSpreadsheetRows } from './sheetParser.ts';
import { DEFAULT_SHEET_ID, getTabByGid } from '../data/spreadsheetTabs.ts';
import { AudioItem } from '../types.ts';

export type SyncSource = 'live' | 'cache' | 'preloaded';

export interface SyncResult {
  items: AudioItem[];
  headers: string[];
  syncedAt: string;
  source: SyncSource;
  tabId: string;
  tabLabel: string;
  gid: string;
}

export interface SyncOptions {
  force?: boolean;
  sheetId?: string;
}

const FETCH_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS_PER_URL = 2;
const CACHE_PREFIX = 'kitab_audio_sync_v2_';
const SHEET_ID_OVERRIDE_KEY = 'kitab_audio_sheet_id';

export function getSheetId(): string {
  try {
    const override = localStorage.getItem(SHEET_ID_OVERRIDE_KEY);
    if (override && override.trim()) return override.trim();
  } catch {
    /* abaikan */
  }
  return DEFAULT_SHEET_ID;
}

export function setSheetId(sheetId: string | null): void {
  try {
    if (sheetId && sheetId.trim()) {
      localStorage.setItem(SHEET_ID_OVERRIDE_KEY, sheetId.trim());
    } else {
      localStorage.removeItem(SHEET_ID_OVERRIDE_KEY);
    }
  } catch {
    /* abaikan */
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { Accept: 'text/csv,text/plain,*/*' },
    });
  } finally {
    clearTimeout(timer);
  }
}

function isLoginOrBlockPage(text: string): boolean {
  const t = text.slice(0, 2000);
  return (
    t.includes('accounts.google.com/ServiceLogin') ||
    t.trimStart().startsWith('<!DOCTYPE html>') ||
    t.includes('<html')
  );
}

/**
 * Ambil CSV langsung dari browser untuk satu gid, dengan retry + backoff.
 */
async function fetchDirectCsv(sheetId: string, gid: string): Promise<string> {
  const urls = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
  ];

  let lastError = '';
  for (const url of urls) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_URL; attempt++) {
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) {
          lastError = `HTTP ${res.status} dari Google Sheets`;
          await sleep(700 * attempt);
          continue;
        }
        const text = await res.text();
        if (isLoginOrBlockPage(text)) {
          lastError = 'Spreadsheet belum dibagikan sebagai publik.';
          break; // retry URL lain tidak akan membantu
        }
        if (text.trim().length > 20) return text;
        lastError = 'Respons kosong dari Google Sheets';
      } catch (err: any) {
        lastError =
          err?.name === 'AbortError'
            ? 'Timeout: Google Sheets lambat merespons'
            : err?.message || 'Gagal jaringan';
      }
      await sleep(700 * attempt);
    }
  }
  throw new Error(lastError || 'Tidak dapat menjangkau Google Sheets');
}

interface CachedPayload {
  items: AudioItem[];
  headers: string[];
  syncedAt: string;
  source: 'live';
}

function readCache(sheetId: string, gid: string): CachedPayload | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${sheetId}_${gid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(sheetId: string, gid: string, payload: CachedPayload): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${sheetId}_${gid}`, JSON.stringify(payload));
  } catch {
    /* kuota penuh — abaikan */
  }
}

/**
 * Snapshot bawaan dimuat lazy (chunk terpisah) — hanya dipakai sebagai
 * pilihan terakhir, jadi tidak perlu membebani bundle utama.
 */
async function getPreloaded(tabId: string, gid: string): Promise<AudioItem[]> {
  try {
    const mod = await import('../data/preloadedGunsanData.ts');
    return mod.PRELOADED_GUNSAN_DATA[tabId] || mod.PRELOADED_GUNSAN_DATA[gid] || [];
  } catch {
    return [];
  }
}

/**
 * Sinkronisasi satu tab spreadsheet. Selalu me-resolve (tidak pernah throw);
 * sumber data tercantum di `source` sehingga UI bisa jujur ke pengguna.
 */
export async function syncTab(gid: string, options: SyncOptions = {}): Promise<SyncResult> {
  const sheetId = options.sheetId || getSheetId();
  const tab = getTabByGid(gid);
  const nowIso = () => new Date().toISOString();

  // 1 & 2. Direct dari browser (gviz lalu export)
  try {
    const csvText = await fetchDirectCsv(sheetId, gid);
    const rows = Papa.parse<string[]>(csvText, { skipEmptyLines: true }).data as string[][];
    const { items, headers } = parseSpreadsheetRows(rows, tab.id);
    if (items.length > 0) {
      const result: SyncResult = {
        items,
        headers,
        syncedAt: nowIso(),
        source: 'live',
        tabId: tab.id,
        tabLabel: tab.label,
        gid,
      };
      writeCache(sheetId, gid, { items, headers, syncedAt: result.syncedAt, source: 'live' });
      return result;
    }
  } catch (err) {
    console.warn(`[sheetSync] direct fetch gagal untuk gid ${gid}:`, err);
  }

  // 3. Cache localStorage
  const cached = readCache(sheetId, gid);
  if (cached) {
    return {
      items: cached.items,
      headers: cached.headers,
      syncedAt: cached.syncedAt,
      source: 'cache',
      tabId: tab.id,
      tabLabel: tab.label,
      gid,
    };
  }

  // 4. Snapshot bawaan — UI tidak pernah kosong
  const preloaded = await getPreloaded(tab.id, gid);
  return {
    items: preloaded,
    headers: [],
    syncedAt: nowIso(),
    source: 'preloaded',
    tabId: tab.id,
    tabLabel: tab.label,
    gid,
  };
}
