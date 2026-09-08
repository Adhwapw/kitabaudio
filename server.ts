import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Papa from 'papaparse';
import { parseGoogleSheetUrl, getGoogleSheetCsvUrls, parseSpreadsheetRows } from './src/utils/sheetParser.ts';
import { DEFAULT_SHEET_ID, getTabByGid } from './src/data/spreadsheetTabs.ts';
import { PRELOADED_GUNSAN_DATA } from './src/data/preloadedGunsanData.ts';

// In-memory cache with 15-minute TTL
interface CachedEntry {
  items: any[];
  headers: string[];
  timestamp: number;
}
const cache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

// Session cookie cache for Google Sheets
let cachedGoogleCookie = '';
let cookieExpiry = 0;

async function getGoogleSessionCookie(sheetId: string): Promise<string> {
  const now = Date.now();
  if (cachedGoogleCookie && now < cookieExpiry) {
    return cachedGoogleCookie;
  }
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    // Extract Set-Cookie headers
    const setCookies = (res.headers as any).getSetCookie ? (res.headers as any).getSetCookie() : [res.headers.get('set-cookie')];
    if (setCookies && setCookies.length > 0) {
      cachedGoogleCookie = setCookies.map((c: string) => (c || '').split(';')[0]).filter(Boolean).join('; ');
      cookieExpiry = now + 45 * 60 * 1000; // valid for 45 mins
    }
  } catch (e) {
    console.warn('Could not establish initial Google session cookie:', e);
  }
  return cachedGoogleCookie;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON & URL-encoded body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Spreadsheet Scraping Endpoint
  app.post('/api/scrape-sheet', async (req, res) => {
    try {
      const { sheetUrl = DEFAULT_SHEET_ID, gid: reqGid = '0', forceRefresh = false } = req.body;

      const parsedUrl = parseGoogleSheetUrl(sheetUrl) || {
        sheetId: DEFAULT_SHEET_ID,
        gid: reqGid || '0',
        isPub: false,
      };

      const activeGid = reqGid || parsedUrl.gid || '0';
      const cacheKey = `${parsedUrl.sheetId}_${activeGid}`;
      const now = Date.now();

      // Check in-memory cache unless forceRefresh
      if (!forceRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        if (now - cached.timestamp < CACHE_TTL_MS) {
          const tabMeta = getTabByGid(activeGid);
          return res.json({
            success: true,
            fromCache: true,
            metadata: {
              title: `Kitab Audio (${tabMeta.label})`,
              activeTabId: tabMeta.id,
              activeTabLabel: tabMeta.label,
              lastSyncedAt: new Date(cached.timestamp).toISOString(),
              rowCount: cached.items.length,
              sourceUrl: sheetUrl,
              isCustom: parsedUrl.sheetId !== DEFAULT_SHEET_ID,
              columnHeaders: cached.headers,
            },
            items: cached.items,
          });
        }
      }

      // Obtain session cookie to bypass 429
      const sessionCookie = await getGoogleSessionCookie(parsedUrl.sheetId);
      const candidateUrls = getGoogleSheetCsvUrls(parsedUrl.sheetId, activeGid, parsedUrl.isPub);

      let csvText = '';
      let fetchErrorDetail = '';

      for (const candidate of candidateUrls) {
        try {
          const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/csv,text/plain,*/*',
          };
          if (sessionCookie) {
            headers['Cookie'] = sessionCookie;
          }

          const response = await fetch(candidate, {
            headers,
            redirect: 'follow',
          });

          if (response.ok) {
            const text = await response.text();
            if (text.includes('accounts.google.com/ServiceLogin')) {
              fetchErrorDetail = 'Spreadsheet ini memerlukan izin akses publik.';
              continue;
            }

            // Valid CSV check
            if (text.length > 20 && !text.trim().startsWith('<!DOCTYPE html>')) {
              csvText = text;
              break;
            }
          }
        } catch (err: any) {
          fetchErrorDetail = err.message || 'Gagal mengambil data dari Google Sheets';
        }
      }

      const tabMeta = getTabByGid(activeGid);

      // If scraping directly fails (e.g. Google temporary rate limiting), check preloaded dataset
      if (!csvText) {
        if (PRELOADED_GUNSAN_DATA[tabMeta.id] && PRELOADED_GUNSAN_DATA[tabMeta.id].length > 0) {
          const preloadedItems = PRELOADED_GUNSAN_DATA[tabMeta.id];
          return res.json({
            success: true,
            isPreloadedFallback: true,
            metadata: {
              title: `Kitab Audio (${tabMeta.label})`,
              activeTabId: tabMeta.id,
              activeTabLabel: tabMeta.label,
              lastSyncedAt: new Date().toISOString(),
              rowCount: preloadedItems.length,
              sourceUrl: sheetUrl,
              isCustom: false,
              columnHeaders: ['Tier', 'Nama', 'Harga', 'Signature', 'Review'],
            },
            items: preloadedItems,
          });
        }

        return res.status(422).json({
          success: false,
          error: fetchErrorDetail || 'Tidak dapat membaca spreadsheet saat ini. Gunakan tab lain atau coba beberapa detik lagi.',
          diagnostics: `Sheet ID: ${parsedUrl.sheetId}, Gid: ${activeGid}`,
        });
      }

      // Parse with PapaParse
      const parseResult = Papa.parse<string[]>(csvText, {
        skipEmptyLines: true,
      });

      const rows = parseResult.data as string[][];
      const { items, headers } = parseSpreadsheetRows(rows, tabMeta.id);

      if (items.length === 0 && PRELOADED_GUNSAN_DATA[tabMeta.id]) {
        // Fallback to preloaded if parse yielded 0 items
        const preloadedItems = PRELOADED_GUNSAN_DATA[tabMeta.id];
        return res.json({
          success: true,
          isPreloadedFallback: true,
          metadata: {
            title: `Kitab Audio (${tabMeta.label})`,
            activeTabId: tabMeta.id,
            activeTabLabel: tabMeta.label,
            lastSyncedAt: new Date().toISOString(),
            rowCount: preloadedItems.length,
            sourceUrl: sheetUrl,
            isCustom: false,
            columnHeaders: headers,
          },
          items: preloadedItems,
        });
      }

      // Save to in-memory cache
      cache.set(cacheKey, {
        items,
        headers,
        timestamp: now,
      });

      return res.json({
        success: true,
        metadata: {
          title: `Kitab Audio (${tabMeta.label})`,
          activeTabId: tabMeta.id,
          activeTabLabel: tabMeta.label,
          lastSyncedAt: new Date().toISOString(),
          rowCount: items.length,
          sourceUrl: sheetUrl,
          isCustom: parsedUrl.sheetId !== DEFAULT_SHEET_ID,
          columnHeaders: headers,
        },
        items,
      });
    } catch (error: any) {
      console.error('Error in /api/scrape-sheet:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Terjadi kesalahan sistem saat scraping spreadsheet.',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Kitab Audio berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
