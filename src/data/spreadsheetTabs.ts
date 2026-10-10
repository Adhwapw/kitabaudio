export const DEFAULT_SHEET_ID = "1KXDCrMErS1ZjjJhxjTYqNax1bjWWl4peXv0eaLMlxVc";

export interface SpreadsheetTab {
  id: string;
  label: string;
  gid: string;
  category: string;
  description: string;
  iconName: string;
  badge?: string;
  countEstimate?: number;
}

/**
 * Exact tabs configured by the user with their corresponding GIDs
 */
export const SPREADSHEET_TABS: SpreadsheetTab[] = [
  {
    id: "iem",
    label: "IEM",
    gid: "0",
    category: "IEM",
    description: "In-Ear Monitors kabel dari budget hingga TOTL endgame",
    iconName: "Headphones",
    badge: "139+ Gear",
    countEstimate: 139
  },
  {
    id: "tws",
    label: "TWS",
    gid: "1388033389",
    category: "TWS",
    description: "True Wireless Stereo (ANC, Codec LDAC/AptX, Sound Quality)",
    iconName: "Radio",
    badge: "102+ Gear",
    countEstimate: 102
  },
  {
    id: "tws-nokaret",
    label: "TWS No-Karet",
    gid: "217110824",
    category: "TWS No-Karet",
    description: "TWS tipe non-eartips / semi in-ear santai",
    iconName: "Disc",
    countEstimate: 21
  },
  {
    id: "ows",
    label: "OWS",
    gid: "1716824495",
    category: "OWS",
    description: "Open Wearable Stereo untuk olahraga & outdoor",
    iconName: "CircleDot",
    countEstimate: 25
  },
  {
    id: "headphone",
    label: "Headphone",
    gid: "1785257921",
    category: "Headphone",
    description: "Headphone Open-back & Closed-back audiophile",
    iconName: "Headset",
    badge: "42+ Gear",
    countEstimate: 42
  },
  {
    id: "w.headphone",
    label: "Wireless HP",
    gid: "841974920",
    category: "Wireless Headphone",
    description: "Headphone Bluetooth dengan ANC & Mic",
    iconName: "Wifi",
    countEstimate: 43
  },
  {
    id: "dongle-dac",
    label: "Dongle DAC",
    gid: "1954358084",
    category: "Dongle",
    description: "DAC Portable Type-C / Lightning untuk HP & Laptop",
    iconName: "Usb",
    badge: "75+ Gear",
    countEstimate: 75
  },
  {
    id: "DesktopDAC",
    label: "Desktop DAC",
    gid: "942479355",
    category: "Desktop DAC",
    description: "DAC & Amp meja untuk setup audio PC/Desktop",
    iconName: "Cpu",
    countEstimate: 21
  },
  {
    id: "headphone-amp",
    label: "Headphone Amp",
    gid: "1714045938",
    category: "DAC/Amp",
    description: "Amplifier khusus pendorong headphone impedansi tinggi",
    iconName: "Zap",
    countEstimate: 7
  },
  {
    id: "gaming",
    label: "Gaming Audio",
    gid: "627172913",
    category: "Gaming",
    description: "IEM & Headphone pilihan untuk FPS (Footstep, Positional Audio)",
    iconName: "Gamepad2",
    countEstimate: 9
  },
  {
    id: "speaker",
    label: "Speaker",
    gid: "587532115",
    category: "Speaker",
    description: "Speaker aktif meja, studio monitor, dan multimedia",
    iconName: "Volume2",
    countEstimate: 18
  },
  {
    id: "blutut speaker",
    label: "BT Speaker",
    gid: "471843513",
    category: "Bluetooth Speaker",
    description: "Speaker portable nirkabel tahan air & bass punchy",
    iconName: "Speaker",
    countEstimate: 31
  },
  {
    id: "soundbar",
    label: "Soundbar",
    gid: "601572817",
    category: "Soundbar",
    description: "Soundbar TV & Home Theater untuk film & musik",
    iconName: "Tv",
    countEstimate: 6
  },
  {
    id: "DAP",
    label: "DAP Player",
    gid: "2013799945",
    category: "DAP",
    description: "Digital Audio Player / Walkman Hi-Res mandiri",
    iconName: "Play",
    countEstimate: 18
  },
  {
    id: "eartips",
    label: "Eartips",
    gid: "1788892420",
    category: "Eartips",
    description: "Tips silikon & busa untuk fine-tuning bass & fitting",
    iconName: "Circle",
    countEstimate: 28
  },
  {
    id: "kabel",
    label: "Kabel Upgrade",
    gid: "323699644",
    category: "Kabel",
    description: "Kabel tembaga, silver-plated, dan modular jack",
    iconName: "Cable",
    countEstimate: 53
  },
  {
    id: "mic",
    label: "Microphone",
    gid: "683184001",
    category: "Mic",
    description: "Mic podcast, streaming, dan vokal",
    iconName: "Mic",
    countEstimate: 35
  },
  {
    id: "clip-on-wireless",
    label: "Clip-on Wireless",
    gid: "233981403",
    category: "Other",
    description: "Mic wireless clip-on untuk konten video & vlogging",
    iconName: "Mic2",
    countEstimate: 11
  },
  {
    id: "soundcard",
    label: "Soundcard",
    gid: "1010205628",
    category: "Other",
    description: "Audio interface untuk rekaman & livestreaming",
    iconName: "Sliders",
    countEstimate: 15
  },
  {
    id: "charger",
    label: "Charger",
    gid: "1142232732",
    category: "Other",
    description: "Adaptor GaN & kabel power minim noise listrik",
    iconName: "BatteryCharging",
    countEstimate: 7
  },
  {
    id: "BACA INI DULU WOI",
    label: "Catatan Reviewer",
    gid: "587738741",
    category: "Other",
    description: "Petunjuk, disclaimer subjektivitas & etika dari Fernanda Gunsan",
    iconName: "Info",
    badge: "PENTING"
  }
];

export function getTabByGid(gid: string): SpreadsheetTab {
  return SPREADSHEET_TABS.find(t => t.gid === gid) || SPREADSHEET_TABS[0];
}

export function getTabById(id: string): SpreadsheetTab {
  return SPREADSHEET_TABS.find(t => t.id === id) || SPREADSHEET_TABS[0];
}
