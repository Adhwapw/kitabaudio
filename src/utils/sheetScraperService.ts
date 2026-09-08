import Papa from 'papaparse';
import { parseGoogleSheetUrl, getGoogleSheetCsvUrls, parseSpreadsheetRows } from './sheetParser.ts';
import { DEFAULT_SHEET_ID, getTabByGid } from '../data/spreadsheetTabs.ts';
import { PRELOADED_GUNSAN_DATA } from '../data/preloadedGunsanData.ts';

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
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    const setCookies = (res.headers as any).getSetCookie
      ? (res.headers as any).getSetCookie()
      : [res.headers.get('set-cookie')];
    if (setCookies && setCookies.length > 0) {
      cachedGoogleCookie = setCookies
        .map((c: string) => (c || '').split(';')[0])
        .filter(Boolean)
        .join('; ');
      cookieExpiry = now + 45 * 60 * 1000;
    }
  } catch (e) {
    console.warn('Could not establish initial Google session cookie:', e);
  }
  return cachedGoogleCookie;
}

export interface ScrapeSheetParams {
  sheetUrl?: string;
  gid?: string;
  forceRefresh?: boolean;
}

export interface ScrapeSheetResult {
  statusCode: number;
  data: {
    success: boolean;
    fromCache?: boolean;
    isPreloadedFallback?: boolean;
    error?: string;
    diagnostics?: string;
    metadata?: {
      title: string;
      activeTabId: string;
      activeTabLabel: string;
      lastSyncedAt: string;
      rowCount: number;
      sourceUrl: string;
      isCustom: boolean;
      columnHeaders: string[];
    };
    items?: any[];
  };
}

export async function scrapeSheetService(params: ScrapeSheetParams): Promise<ScrapeSheetResult> {
  const { sheetUrl = DEFAULT_SHEET_ID, gid: reqGid = '0', forceRefresh = false } = params;

  const parsedUrl = parseGoogleSheetUrl(sheetUrl) || {
    sheetId: DEFAULT_SHEET_ID,
    gid: reqGid || '0',
    isPub: false,
  };

  const activeGid = reqGid || parsedUrl.gid || '0';
  const cacheKey = `${parsedUrl.sheetId}_${activeGid}`;
  const now = Date.now();
  const tabMeta = getTabByGid(activeGid);

  // Check in-memory cache unless forceRefresh
  if (!forceRefresh && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return {
        statusCode: 200,
        data: {
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
        },
      };
    }
  }

  // Obtain session cookie to bypass Google rate limiting
  const sessionCookie = await getGoogleSessionCookie(parsedUrl.sheetId);
  const candidateUrls = getGoogleSheetCsvUrls(parsedUrl.sheetId, activeGid, parsedUrl.isPub);

  let csvText = '';
  let fetchErrorDetail = '';

  for (const candidate of candidateUrls) {
    try {
      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/csv,text/plain,*/*',
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

        // Check if Google returned an HTML bot-detection or warning page instead of CSV
        if (text.trim().startsWith('<!DOCTYPE html>') || text.includes('<html')) {
          fetchErrorDetail = 'Google membatasi akses bot dari IP server ini.';
          continue;
        }

        if (text.length > 20) {
          csvText = text;
          break;
        }
      }
    } catch (err: any) {
      fetchErrorDetail = err.message || 'Gagal mengambil data dari Google Sheets';
    }
  }

  // If scraping fails (e.g. Google blocked serverless IP on Vercel), fallback to preloaded snapshot
  if (!csvText) {
    if (PRELOADED_GUNSAN_DATA[tabMeta.id] && PRELOADED_GUNSAN_DATA[tabMeta.id].length > 0) {
      const preloadedItems = PRELOADED_GUNSAN_DATA[tabMeta.id];
      return {
        statusCode: 200,
        data: {
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
        },
      };
    }

    return {
      statusCode: 422,
      data: {
        success: false,
        error:
          fetchErrorDetail ||
          'Tidak dapat membaca spreadsheet saat ini. Gunakan tab lain atau coba beberapa detik lagi.',
        diagnostics: `Sheet ID: ${parsedUrl.sheetId}, Gid: ${activeGid}`,
      },
    };
  }

  // Parse with PapaParse
  const parseResult = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  });

  const rows = parseResult.data as string[][];
  const { items, headers } = parseSpreadsheetRows(rows, tabMeta.id);

  if (items.length === 0 && PRELOADED_GUNSAN_DATA[tabMeta.id]) {
    const preloadedItems = PRELOADED_GUNSAN_DATA[tabMeta.id];
    return {
      statusCode: 200,
      data: {
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
      },
    };
  }

  // Save to in-memory cache
  cache.set(cacheKey, {
    items,
    headers,
    timestamp: now,
  });

  return {
    statusCode: 200,
    data: {
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
    },
  };
}
