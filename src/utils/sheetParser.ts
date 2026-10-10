import { AudioItem, AudioTier, AudioCategory, SoundSignature } from '../types.ts';

/**
 * Normalizes text for header matching
 */
function cleanKey(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts spreadsheet ID and sheet GID from any Google Sheets URL
 */
export function parseGoogleSheetUrl(inputUrl: string): { sheetId: string; gid: string; isPub: boolean } | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const trimmed = inputUrl.trim();

  // Check if user directly pasted just a sheet ID (e.g. 1KXDCrMErS1ZjjJhxjTYqNax1bjWWl4peXv0eaLMlxVc)
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return { sheetId: trimmed, gid: '0', isPub: false };
  }

  // Published to web format: https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml or /pub?output=csv
  const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch) {
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    return {
      sheetId: pubMatch[1],
      gid: gidMatch ? gidMatch[1] : '0',
      isPub: true,
    };
  }

  // Standard Google Sheet edit/view format: https://docs.google.com/spreadsheets/d/([a-zA-Z0-9-_]+)
  const standardMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (standardMatch) {
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    return {
      sheetId: standardMatch[1],
      gid: gidMatch ? gidMatch[1] : '0',
      isPub: false,
    };
  }

  return null;
}

/**
 * Constructs the CSV export URL without requiring Google API key
 */
export function getGoogleSheetCsvUrls(sheetId: string, gid: string = '0', isPub: boolean = false): string[] {
  if (isPub) {
    return [
      `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv&gid=${gid}`,
      `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?gid=${gid}&single=true&output=csv`
    ];
  }
  return [
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&tq&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv&gid=${gid}`
  ];
}

/**
 * Normalizes numeric prices from strings like "Rp 7.499.000", "7,499,000", "350k", "1.2jt"
 */
export function parsePriceToNumeric(priceStr: string): number {
  if (!priceStr) return 0;
  const raw = priceStr.toLowerCase().trim();

  // e.g. "1.2jt" or "1,2 juta"
  const jutaMatch = raw.match(/([\d.,]+)\s*(?:jt|juta)/);
  if (jutaMatch) {
    const num = parseFloat(jutaMatch[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }

  // e.g. "350k" or "350 rb" or "350ribu"
  const kMatch = raw.match(/([\d.,]+)\s*(?:k|rb|ribu)/);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    return Math.round(num * 1000);
  }

  // e.g. "$25" or "$150.50"
  const usdMatch = raw.match(/\$\s*([\d.,]+)/);
  if (usdMatch) {
    const num = parseFloat(usdMatch[1]);
    return Math.round(num * 16000);
  }

  // e.g. "7,499,000" or "7.499.000" or "350000"
  const digitsOnly = raw.replace(/[^\d]/g, '');
  if (digitsOnly) {
    const parsed = parseInt(digitsOnly, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

/**
 * Formats numeric price back to Indonesian Rupiah string
 */
export function formatPriceIdr(num: number): string {
  if (!num || num <= 0) return 'Cek Toko';
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Detects sound signature from text
 */
export function normalizeSignature(val: string): SoundSignature {
  if (!val) return 'Neutral';
  const clean = val.toLowerCase();
  if (clean.includes('warm') || clean.includes('hangat')) return 'Warm';
  if (clean.includes('harman')) return 'Harman';
  if (clean.includes('v-shape') || clean.includes('v shape') || clean.includes('vshape')) return 'V-Shape';
  if (clean.includes('bright') || clean.includes('terang') || clean.includes('pedas')) return 'Bright';
  if (clean.includes('bass') || clean.includes('jedag')) return 'Basshead';
  if (clean.includes('mid') || clean.includes('vokal')) return 'Mid-Centric';
  if (clean.includes('dark') || clean.includes('gelap')) return 'Dark';
  if (clean.includes('balan') || clean.includes('seimbang')) return 'Balanced';
  if (clean.includes('neutral') || clean.includes('netral') || clean.includes('flat')) return 'Neutral';
  return 'Neutral';
}

/**
 * Normalizes Tier / Rank (supports SS, S+, S, A+, A, B+, B, C, D, E)
 */
export function normalizeTier(val: string): AudioTier {
  if (!val) return 'B';
  const clean = val.toUpperCase().trim();
  if (clean.includes('SS')) return 'SS';
  if (clean.includes('S+++++') || clean.includes('S++++') || clean.includes('S+++') || clean.includes('S++') || clean.includes('S+')) return 'S+';
  if (clean === 'S' || clean.startsWith('S ')) return 'S';
  if (clean.includes('A+')) return 'A+';
  if (clean.startsWith('A')) return 'A';
  if (clean.includes('B+')) return 'B+';
  if (clean.startsWith('B')) return 'B';
  if (clean.startsWith('C')) return 'C';
  if (clean.startsWith('D')) return 'D';
  if (clean.startsWith('E') || clean.startsWith('F')) return 'E';
  return 'B';
}

const COMMON_BRANDS = [
  'Sony', 'Sennheiser', 'Moondrop', 'Tangzu', 'Truthear', 'Hisenior', 'Xenns', 'Mangird',
  'Cayin', 'Fiio', 'Hifiman', 'Audio-Technica', 'Shure', 'Philips', 'Focal', 'Onix',
  'Questyle', 'Khadas', 'Luxury Precision', 'iBasso', 'Shanling', 'Samsung', 'Apple',
  '7Hz', 'Kiwi Ears', 'Tanchjim', 'QCY', 'Soundcore', 'Anker', 'Baseus', 'JBL', 'Bose',
  'KZ', 'CCA', 'TRN', 'Edifier', 'Wharfedale', 'Kanto', 'Presonus', 'Audioengine',
  'Melody Wings', 'Audirect', 'DDHIFI', 'Jcally', 'Eletech', 'Effect Audio', 'Brise'
];

/**
 * Extracts brand from device full text
 */
export function extractBrand(name: string): string {
  if (!name) return 'Audio';
  const trimmed = name.trim();
  for (const b of COMMON_BRANDS) {
    const reg = new RegExp(`^${b}\\b`, 'i');
    if (reg.test(trimmed)) {
      return b;
    }
  }
  // Fallback: take first word
  const firstWord = trimmed.split(/[\s-]+/)[0];
  if (firstWord && firstWord.length > 1) {
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  }
  return 'Audio';
}

/**
 * Normalizes Category
 */
export function normalizeCategory(val: string, name?: string, tabCategory?: string): AudioCategory {
  const check = ((val || '') + ' ' + (name || '') + ' ' + (tabCategory || '')).toLowerCase();
  if (check.includes('tws-nokaret') || check.includes('no-karet') || check.includes('non karet')) return 'TWS No-Karet';
  if (check.includes('ows') || check.includes('open wearable')) return 'OWS';
  if (check.includes('wireless hp') || check.includes('w.headphone') || check.includes('headphone bluetooth')) return 'Wireless Headphone';
  if (check.includes('headphone') || check.includes('hd600') || check.includes('over ear') || check.includes('openback') || check.includes('closedback')) return 'Headphone';
  if (check.includes('tws') || check.includes('true wireless')) return 'TWS';
  if (check.includes('dongle') || check.includes('dac portable') || check.includes('type c')) return 'Dongle';
  if (check.includes('desktop dac') || check.includes('desktopdac')) return 'Desktop DAC';
  if (check.includes('dac') || check.includes('amp')) return 'DAC/Amp';
  if (check.includes('gaming')) return 'Gaming';
  if (check.includes('bluetooth speaker') || check.includes('blutut speaker')) return 'Bluetooth Speaker';
  if (check.includes('soundbar')) return 'Soundbar';
  if (check.includes('speaker')) return 'Speaker';
  if (check.includes('dap') || check.includes('player') || check.includes('walkman')) return 'DAP';
  if (check.includes('eartip')) return 'Eartips';
  if (check.includes('kabel') || check.includes('cable')) return 'Kabel';
  if (check.includes('mic')) return 'Mic';
  if (check.includes('earbud') || check.includes('flathead')) return 'Earbuds';
  if (check.includes('iem') || check.includes('in-ear') || check.includes('earphone')) return 'IEM';
  return 'IEM';
}

/**
 * Splits pros/cons list safely
 */
export function splitList(str: string): string[] {
  if (!str) return [];
  const rawItems = str
    .split(/[\n\r;|\u2022\u2023\u25E6\u2043\u2219]+/)
    .map(s => s.trim().replace(/^[-*•+]\s*/, ''))
    .filter(s => s.length > 0);

  return rawItems.length > 0 ? rawItems : [str.trim()];
}

/**
 * Main parser: takes 2D array of rows from PapaParse and transforms into structured AudioItem[]
 */
export function parseSpreadsheetRows(rows: string[][], tabCategory?: string): { items: AudioItem[]; headers: string[] } {
  if (!rows || rows.length === 0) return { items: [], headers: [] };

  // 1. Locate the header row (sometimes row 0 is a note/banner like in dongle-dac or headphone)
  let headerRowIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    const row = rows[i];
    const rowText = row.map(cleanKey).join(' ');
    // Match common tier list indicators
    if (
      (rowText.includes('nama') || rowText.includes('device') || rowText.includes('iem') || rowText.includes('tws') || rowText.includes('headphone') || rowText.includes('dac') || rowText.includes('speaker') || rowText.includes('rank') || rowText.includes('barang')) &&
      (rowText.includes('tier') || rowText.includes('rank') || rowText.includes('harga') || rowText.includes('price') || rowText.includes('f') || rowText.includes('shopee'))
    ) {
      headerRowIndex = i;
      headers = row.map(h => (h || '').trim());
      break;
    }
  }

  // Fallback: use row 0 as header if no explicit header row matched
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
    headers = rows[0].map((h, idx) => (h || `Col ${idx + 1}`).trim());
  }

  // Map header indexes
  const colIndexMap: Record<string, number> = {};
  headers.forEach((h, idx) => {
    const k = cleanKey(h);
    if (!k) return;

    if (/^(tier|rank|kelas|grade|level|peringkat|f)$/.test(k) && colIndexMap['tier'] === undefined) {
      colIndexMap['tier'] = idx;
    } else if (/(iem|tws|headphone|dac|speaker|device|nama|model|perangkat|gear|produk|item)/.test(k) && colIndexMap['name'] === undefined) {
      colIndexMap['name'] = idx;
    } else if (/(brand|merk|merek|manufaktur|maker)/.test(k) && colIndexMap['brand'] === undefined) {
      colIndexMap['brand'] = idx;
    } else if (/(kategori|category|tipe|type|jenis)/.test(k) && colIndexMap['category'] === undefined) {
      colIndexMap['category'] = idx;
    } else if (/(hargalinktoped|pricelinktoped|pricetokpedlink|harga|price|estprice|biaya|rupiah|idr)/.test(k) && colIndexMap['price'] === undefined) {
      colIndexMap['price'] = idx;
    } else if (/(sound|signature|karakter|soundprofile|suara|tonalprofile|soundtuning)/.test(k) && colIndexMap['signature'] === undefined) {
      colIndexMap['signature'] = idx;
    } else if (/(totalsound|overallsound|score|skor|rating)/.test(k) && colIndexMap['soundScore'] === undefined) {
      colIndexMap['soundScore'] = idx;
    } else if (/(percentage|persentase|match)/.test(k) && colIndexMap['percentage'] === undefined) {
      colIndexMap['percentage'] = idx;
    } else if (/(driver|konfigurasi|spesifikasi|spec)/.test(k) && colIndexMap['driver'] === undefined) {
      colIndexMap['driver'] = idx;
    } else if (/(musicianmonitorfit|fit|fitting|starrating)/.test(k) && colIndexMap['starRating'] === undefined) {
      colIndexMap['starRating'] = idx;
    } else if (/(review|impresi|notes|catatan|deskripsi|komentar|ulasan)/.test(k) && colIndexMap['notes'] === undefined) {
      colIndexMap['notes'] = idx;
    } else if (/(shopee)/.test(k) && colIndexMap['shopee'] === undefined) {
      colIndexMap['shopee'] = idx;
    } else if (/(tiktok)/.test(k) && colIndexMap['tiktok'] === undefined) {
      colIndexMap['tiktok'] = idx;
    } else if (/(eartipsygcocok|eartips)/.test(k) && colIndexMap['eartips'] === undefined) {
      colIndexMap['eartips'] = idx;
    } else if (/(kabelrecommend|kabel)/.test(k) && colIndexMap['kabel'] === undefined) {
      colIndexMap['kabel'] = idx;
    } else if (/(parametriceq|eq)/.test(k) && colIndexMap['eq'] === undefined) {
      colIndexMap['eq'] = idx;
    } else if (/(gambar|foto|photo|picture|image)/.test(k) && colIndexMap['image'] === undefined) {
      colIndexMap['image'] = idx;
    }
  });

  // Fallbacks if columns weren't matched explicitly
  if (colIndexMap['tier'] === undefined) {
    colIndexMap['tier'] = 0;
  }
  if (colIndexMap['name'] === undefined) {
    colIndexMap['name'] = headers.length > 2 ? 2 : 1;
  }

  const items: AudioItem[] = [];

  // Parse data rows
  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    // Filter out rows that are completely empty
    const hasAnyContent = row.some(cell => (cell || '').trim().length > 0);
    if (!hasAnyContent) continue;

    const rawTier = colIndexMap['tier'] !== undefined ? (row[colIndexMap['tier']] || '') : '';
    const rawNameBlock = colIndexMap['name'] !== undefined ? (row[colIndexMap['name']] || '') : '';

    // If both tier and name are empty, skip row
    if (!rawTier.trim() && !rawNameBlock.trim()) continue;

    // Handle multiline name blocks (first line is name, rest are highlights/taglines)
    const nameLines = rawNameBlock.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean);
    const primaryName = nameLines[0] || (rawTier ? `Audio Gear Tier ${rawTier}` : `Item #${r}`);
    const tagline = nameLines.slice(1).join(' • ') || undefined;

    // Extract brand
    let brand = '';
    if (colIndexMap['brand'] !== undefined && row[colIndexMap['brand']]) {
      brand = row[colIndexMap['brand']].trim();
    }
    if (!brand) {
      brand = extractBrand(primaryName);
    }

    // Extract price
    let rawPrice = '';
    if (colIndexMap['price'] !== undefined && row[colIndexMap['price']]) {
      rawPrice = row[colIndexMap['price']].trim();
    }
    const priceNumeric = parsePriceToNumeric(rawPrice);
    const displayPrice = priceNumeric > 0 ? formatPriceIdr(priceNumeric) : (rawPrice || '-');

    // Extract signature
    let rawSig = '';
    if (colIndexMap['signature'] !== undefined && row[colIndexMap['signature']]) {
      rawSig = row[colIndexMap['signature']].trim();
    }
    const soundSignature = normalizeSignature(rawSig || tagline || '');

    // Extract driver info
    let driverInfo = '';
    if (colIndexMap['driver'] !== undefined && row[colIndexMap['driver']]) {
      driverInfo = row[colIndexMap['driver']].trim();
    }

    // Extract notes / review
    let notes = '';
    if (colIndexMap['notes'] !== undefined && row[colIndexMap['notes']]) {
      notes = row[colIndexMap['notes']].trim();
    }

    // Extract star rating
    let starRating = '';
    if (colIndexMap['starRating'] !== undefined && row[colIndexMap['starRating']]) {
      starRating = row[colIndexMap['starRating']].trim();
    }

    // Extract sound score (e.g. 9.47)
    let soundScore = '';
    if (colIndexMap['soundScore'] !== undefined && row[colIndexMap['soundScore']]) {
      soundScore = row[colIndexMap['soundScore']].trim();
    }

    // Extract percentage (e.g. 95%)
    let percentage = '';
    if (colIndexMap['percentage'] !== undefined && row[colIndexMap['percentage']]) {
      percentage = row[colIndexMap['percentage']].trim();
    }

    // Extract buy / ecommerce links
    const tokpedLink = colIndexMap['price'] !== undefined && row[colIndexMap['price']] && row[colIndexMap['price']].includes('http')
      ? row[colIndexMap['price']].trim()
      : `https://www.tokopedia.com/search?q=${encodeURIComponent(primaryName)}`;

    const shopeeLink = colIndexMap['shopee'] !== undefined && row[colIndexMap['shopee']] && row[colIndexMap['shopee']].includes('http')
      ? row[colIndexMap['shopee']].trim()
      : `https://shopee.co.id/search?keyword=${encodeURIComponent(primaryName)}`;

    const tiktokLink = colIndexMap['tiktok'] !== undefined && row[colIndexMap['tiktok']] && row[colIndexMap['tiktok']].includes('http')
      ? row[colIndexMap['tiktok']].trim()
      : undefined;

    // Extract tonality and technicality metrics
    const tonalityMetrics: Record<string, string> = {};
    const technicalityMetrics: Record<string, string> = {};

    headers.forEach((header, idx) => {
      const hClean = cleanKey(header);
      const val = (row[idx] || '').trim();
      if (!val) return;

      if (/(bass|subbass|midbass)/.test(hClean)) tonalityMetrics['Bass'] = val;
      else if (/(lomid|lowmid)/.test(hClean)) tonalityMetrics['Lo Mid'] = val;
      else if (/(himid|highmid)/.test(hClean)) tonalityMetrics['Hi Mid'] = val;
      else if (/(treble|high)/.test(hClean)) tonalityMetrics['Treble'] = val;
      else if (/(voc|vocal)/.test(hClean)) tonalityMetrics['Vocal'] = val;
      else if (/(sibilance)/.test(hClean)) tonalityMetrics['Sibilance'] = val;

      if (/(soundstage|stage|luas)/.test(hClean)) technicalityMetrics['Soundstage'] = val;
      else if (/(imaging|stereo)/.test(hClean)) technicalityMetrics['Imaging'] = val;
      else if (/(separation|separasi)/.test(hClean)) technicalityMetrics['Separation'] = val;
      else if (/(timbre|natural)/.test(hClean)) technicalityMetrics['Timbre'] = val;
      else if (/(punch|impact)/.test(hClean)) technicalityMetrics['Punch'] = val;
      else if (/(detail|resolusi|clarity)/.test(hClean)) technicalityMetrics['Detail'] = val;
    });

    // Extract pros from tagline or notes
    const pros: string[] = [];
    if (tagline) {
      tagline.split('•').forEach(t => {
        const clean = t.trim().replace(/^[+]/, '').trim();
        if (clean.length > 2 && !pros.includes(clean)) pros.push(clean);
      });
    }

    const tier = normalizeTier(rawTier);
    const category = normalizeCategory(
      colIndexMap['category'] !== undefined ? (row[colIndexMap['category']] || '') : '',
      primaryName,
      tabCategory
    );

    // Build raw row dictionary
    const rawRowDict: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (row[idx]) rawRowDict[h] = row[idx].trim();
    });

    // Extract product image URL (kolom "Gambar" di spreadsheet, bila ada)
    let imageUrl: string | undefined;
    if (colIndexMap['image'] !== undefined && row[colIndexMap['image']]) {
      const cell = row[colIndexMap['image']].trim();
      const urlMatch = cell.match(/https?:\/\/[^\s"']+/);
      if (urlMatch) imageUrl = urlMatch[0];
    }

    const item: AudioItem = {
      id: `item-${r}-${cleanKey(primaryName).slice(0, 15)}`,
      name: primaryName,
      brand,
      tier,
      category,
      price: displayPrice,
      priceNumeric,
      soundSignature,
      soundScore: soundScore || (tonalityMetrics['Treble'] ? `${tonalityMetrics['Treble']}` : undefined),
      percentage: percentage || (tier === 'SS' ? '95%' : tier === 'S+' ? '88%' : tier === 'S' ? '82%' : '75%'),
      tagline,
      driver: driverInfo || undefined,
      starRating: starRating || (tier === 'SS' ? '⭐⭐⭐⭐⭐' : tier === 'S' ? '⭐⭐⭐⭐' : undefined),
      notes: notes || (tagline ? `Impresi: ${tagline}` : 'Gear terkurasi dalam Kitab Audio.'),
      pros: pros.length > 0 ? pros : [`Tier ${tier} pilihan`, soundSignature],
      cons: tier === 'B' || tier === 'C' ? ['Perlu penyesuaian eartips/kabel'] : [],
      buyUrl: tokpedLink,
      shopeeUrl: shopeeLink,
      tiktokUrl: tiktokLink,
      imageUrl,
      suitableEartips: colIndexMap['eartips'] !== undefined ? (row[colIndexMap['eartips']] || '').trim() : undefined,
      recommendedCable: colIndexMap['kabel'] !== undefined ? (row[colIndexMap['kabel']] || '').trim() : undefined,
      parametricEq: colIndexMap['eq'] !== undefined ? (row[colIndexMap['eq']] || '').trim() : undefined,
      tonalityMetrics: Object.keys(tonalityMetrics).length > 0 ? tonalityMetrics : undefined,
      technicalityMetrics: Object.keys(technicalityMetrics).length > 0 ? technicalityMetrics : undefined,
      rawRow: rawRowDict,
    };

    items.push(item);
  }

  return { items, headers };
}
