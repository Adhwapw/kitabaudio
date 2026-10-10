/**
 * scripts/crawl-sheet.ts — Crawler spreadsheet Kitab Audio.
 *
 * Dijalankan terjadwal (GitHub Actions tiap 6 jam) atau manual:
 *   npx tsx scripts/crawl-sheet.ts
 *
 * Tugasnya: menarik CSV semua tab dari Google Sheets (endpoint gviz/export),
 * mem-parsing dengan parser yang sama dipakai aplikasi, lalu menulis ulang
 * src/data/preloadedGunsanData.ts sebagai snapshot segar. Vercel otomatis
 * me-redeploy setiap ada commit snapshot baru, sehingga data bawaan website
 * tidak pernah lebih tua dari interval crawl.
 *
 * Keluar dengan kode non-zero (tanpa menulis file) bila terlalu banyak tab
 * gagal ditarik — agar commit yang masuk tidak berisi data sampah.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Papa from 'papaparse';
import { parseSpreadsheetRows } from '../src/utils/sheetParser.ts';
import { SPREADSHEET_TABS, DEFAULT_SHEET_ID } from '../src/data/spreadsheetTabs.ts';
import type { AudioItem } from '../src/types.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT_PATH = resolve(ROOT, 'src/data/preloadedGunsanData.ts');
const TABS_PATH = resolve(ROOT, 'src/data/spreadsheetTabs.ts');
const IMAGE_CACHE_PATH = resolve(ROOT, 'scripts/image-cache.json');

const FETCH_TIMEOUT_MS = 20000;
const MAX_FAILURE_RATIO = 0.3;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Cache gambar produk (diisi manual/kurasi). Kunci: "tabId::nama-lowercase". */
function imageCacheKey(tabId: string, name: string): string {
  return `${tabId}::${name.toLowerCase().trim()}`;
}

function loadImageCache(): Record<string, string> {
  try {
    const raw = readFileSync(IMAGE_CACHE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      // Abaikan kunci dokumentasi seperti _README
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (!k.startsWith('_') && typeof v === 'string' && v.startsWith('http')) clean[k] = v;
      }
      return clean;
    }
  } catch {
    /* belum ada cache — bukan error */
  }
  return {};
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { Accept: 'text/csv,text/plain,*/*' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const head = text.slice(0, 500);
    if (head.includes('accounts.google.com/ServiceLogin') || head.trimStart().startsWith('<!DOCTYPE')) {
      throw new Error('Diblokir/halaman login Google');
    }
    if (text.trim().length < 20) throw new Error('Respons kosong');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTabCsv(sheetId: string, gid: string): Promise<string> {
  const urls = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
  ];
  let lastError = 'unknown';
  for (const url of urls) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await fetchText(url);
      } catch (err: any) {
        lastError = err?.message || String(err);
        await sleep(800 * attempt);
      }
    }
  }
  throw new Error(lastError);
}

async function main(): Promise<void> {
  const sheetId = process.env.SHEET_ID || DEFAULT_SHEET_ID;
  const crawledAt = new Date().toISOString();
  console.log(`[crawl] Mulai crawl sheet ${sheetId} (${SPREADSHEET_TABS.length} tab)`);

  const data: Record<string, AudioItem[]> = {};
  const counts: Record<string, number> = {};
  const failed: string[] = [];
  const imageCache = loadImageCache();
  const imageCacheKeys = new Set(Object.keys(imageCache));
  let imageHits = 0;

  for (const tab of SPREADSHEET_TABS) {
    try {
      const csvText = await fetchTabCsv(sheetId, tab.gid);
      const rows = Papa.parse<string[]>(csvText, { skipEmptyLines: true }).data as string[][];
      const { items } = parseSpreadsheetRows(rows, tab.id);
      // rawRow tidak dipakai UI — buang agar snapshot ramping
      const slim = items.map(({ rawRow: _drop, ...rest }) => rest);
      // Isi imageUrl dari cache kurasi bila spreadsheet tidak menyediakan
      // (kolom "Gambar" di spreadsheet selalu menang bila ada)
      for (const it of slim) {
        if (!it.imageUrl) {
          const cached = imageCache[imageCacheKey(tab.id, it.name)];
          if (cached) {
            it.imageUrl = cached;
            imageHits++;
          }
        }
      }
      data[tab.id] = slim as AudioItem[];
      counts[tab.id] = slim.length;
      console.log(`[crawl] OK  ${tab.id} (${tab.gid}): ${slim.length} item`);
    } catch (err: any) {
      failed.push(tab.id);
      console.warn(`[crawl] GAGAL ${tab.id} (${tab.gid}): ${err?.message || err}`);
    }
    await sleep(400); // jeda sopan antar request
  }

  const failureRatio = failed.length / SPREADSHEET_TABS.length;
  if (failed.length > 0 && failureRatio > MAX_FAILURE_RATIO) {
    console.error(`[crawl] Terlalu banyak gagal (${failed.length}/${SPREADSHEET_TABS.length}). Batal tanpa menulis file.`);
    process.exit(1);
  }
  if (failed.length > 0) {
    console.warn(`[crawl] Tab gagal akan dikosongkan di snapshot: ${failed.join(', ')}`);
    for (const id of failed) {
      data[id] = [];
      counts[id] = 0;
    }
  }

  // Tulis snapshot TypeScript (format sama seperti sebelumnya).
  // Minified + tanpa rawRow agar ramping (lazy chunk tetap ringan).
  const body = Object.entries(data)
    .map(([tabId, items]) => `  ${JSON.stringify(tabId)}: ${JSON.stringify(items)}`)
    .join(',\n');

  const tsFile = `import { AudioItem } from "../types.ts";

/**
 * AUTO-GENERATED oleh scripts/crawl-sheet.ts — jangan edit manual.
 * Dibuat: ${crawledAt} dari spreadsheet ${sheetId}.
 * Dijadwalkan ulang tiap 6 jam via .github/workflows/crawl.yml.
 */
export const PRELOADED_SNAPSHOT_META = {
  crawledAt: ${JSON.stringify(crawledAt)},
  sheetId: ${JSON.stringify(sheetId)},
};

export const PRELOADED_GUNSAN_DATA: Record<string, AudioItem[]> = {
${body}
};
`;
  writeFileSync(SNAPSHOT_PATH, tsFile, 'utf-8');
  console.log(`[crawl] Snapshot ditulis: ${SNAPSHOT_PATH}`);

  // Perbarui countEstimate & badge jumlah di spreadsheetTabs.ts agar jujur
  let tabsSrc = readFileSync(TABS_PATH, 'utf-8');
  let updated = 0;
  for (const tab of SPREADSHEET_TABS) {
    const count = counts[tab.id] ?? 0;
    const re = new RegExp(`(id:\\s*${JSON.stringify(tab.id)}[\\s\\S]*?countEstimate:\\s*)\\d+`);
    const next = tabsSrc.replace(re, `$1${count}`);
    if (next !== tabsSrc) {
      tabsSrc = next;
      updated++;
    }
    // badge "N+ Gear" -> sesuaikan angka (jangan sentuh badge non-angka seperti PENTING)
    const badgeRe = new RegExp(`(id:\\s*${JSON.stringify(tab.id)}[\\s\\S]*?badge:\\s*")\\d+(\\+ Gear")`);
    const nextBadge = tabsSrc.replace(badgeRe, `$1${count}$2`);
    if (nextBadge !== tabsSrc) tabsSrc = nextBadge;
  }
  if (updated > 0) {
    writeFileSync(TABS_PATH, tabsSrc, 'utf-8');
    console.log(`[crawl] countEstimate diperbarui untuk ${updated} tab`);
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`[crawl] Selesai. Total ${total} item dari ${SPREADSHEET_TABS.length - failed.length} tab.`);
  console.log(`[crawl] ${imageHits} item memakai gambar dari cache kurasi (${imageCacheKeys.size} entri cache).`);
}

main().catch((err) => {
  console.error('[crawl] Fatal:', err);
  process.exit(1);
});
