import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrapeSheetService } from '../src/utils/sheetScraperService.ts';

const ATTEMPTS = 2;
const ATTEMPT_TIMEOUT_MS = 20000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout dari server proxy')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let params: { sheetUrl?: string; gid?: string; forceRefresh?: boolean } = {};

    if (req.method === 'POST') {
      params = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } else if (req.method === 'GET') {
      params = {
        sheetUrl: typeof req.query.sheetUrl === 'string' ? req.query.sheetUrl : undefined,
        gid: typeof req.query.gid === 'string' ? req.query.gid : undefined,
        forceRefresh: req.query.forceRefresh === 'true',
      };
    }

    // Retry dengan backoff: IP serverless kadang diblokir sementara oleh Google
    let lastError: any = null;
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      try {
        const result = await withTimeout(
          scrapeSheetService({ ...params, forceRefresh: attempt > 1 ? true : params.forceRefresh }),
          ATTEMPT_TIMEOUT_MS,
        );
        // Sukses (termasuk fallback snapshot) langsung dikembalikan
        if (result.data.success) {
          return res.status(result.statusCode).json(result.data);
        }
        lastError = new Error(result.data.error || 'Scrape gagal');
      } catch (err: any) {
        lastError = err;
      }
      if (attempt < ATTEMPTS) await sleep(1200 * attempt);
    }

    console.error('Vercel /api/scrape-sheet gagal setelah retry:', lastError);
    return res.status(502).json({
      success: false,
      error: 'Server proxy tidak bisa menjangkau Google Sheets saat ini.',
    });
  } catch (error: any) {
    console.error('Error in Vercel Serverless /api/scrape-sheet:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat scraping spreadsheet di Vercel Serverless.',
    });
  }
}
