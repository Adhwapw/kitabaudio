import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { scrapeSheetService } from './src/utils/sheetScraperService.ts';

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
      const result = await scrapeSheetService(req.body || {});
      return res.status(result.statusCode).json(result.data);
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
