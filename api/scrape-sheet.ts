import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrapeSheetService } from '../src/utils/sheetScraperService.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract parameters from either POST body or GET query
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

    const result = await scrapeSheetService(params);
    return res.status(result.statusCode).json(result.data);
  } catch (error: any) {
    console.error('Error in Vercel Serverless /api/scrape-sheet:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat scraping spreadsheet di Vercel Serverless.',
    });
  }
}
