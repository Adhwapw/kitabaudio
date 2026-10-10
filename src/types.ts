export type AudioTier = 'SS' | 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'E';

export type AudioCategory = 
  | 'All' 
  | 'IEM' 
  | 'Headphone' 
  | 'Wireless Headphone'
  | 'DAC/Amp' 
  | 'Dongle' 
  | 'Desktop DAC'
  | 'TWS' 
  | 'TWS No-Karet'
  | 'OWS'
  | 'Speaker'
  | 'Bluetooth Speaker'
  | 'Soundbar'
  | 'DAP'
  | 'Gaming'
  | 'Earbuds' 
  | 'Eartips'
  | 'Kabel'
  | 'Mic'
  | 'Soundcard'
  | 'Other';

export type SoundSignature = 
  | 'All'
  | 'Warm' 
  | 'Neutral' 
  | 'Harman' 
  | 'V-Shape' 
  | 'Bright' 
  | 'Basshead' 
  | 'Mid-Centric' 
  | 'Balanced'
  | 'Dark';

export interface AudioItem {
  id: string;
  name: string;
  brand: string;
  tier: AudioTier;
  category: AudioCategory;
  price: string;
  priceNumeric: number;
  soundSignature: SoundSignature;
  tonalityScore?: string;
  technicalityScore?: string;
  soundScore?: string; // e.g. "9.47"
  percentage?: string; // e.g. "95%"
  driver?: string;
  pros: string[];
  cons: string[];
  notes: string;
  tagline?: string;
  verdictTag?: string;
  starRating?: string;
  buyUrl?: string;
  shopeeUrl?: string;
  tiktokUrl?: string;
  imageUrl?: string;
  suitableEartips?: string;
  recommendedCable?: string;
  parametricEq?: string;
  tonalityMetrics?: Record<string, string>;
  technicalityMetrics?: Record<string, string>;
  rawRow?: Record<string, string>;
}

export interface SheetMetadata {
  title: string;
  lastSyncedAt: string;
  rowCount: number;
  sourceUrl: string;
  isCustom: boolean;
  columnHeaders: string[];
  activeTabId?: string;
  activeTabLabel?: string;
}

export interface ScrapeResponse {
  success: boolean;
  metadata: SheetMetadata;
  items: AudioItem[];
  error?: string;
  diagnostics?: string;
}
