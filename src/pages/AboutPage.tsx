import React, { useState } from 'react';
import {
  BookOpenText, ShieldAlert, Sparkles, ShoppingBag, FileSpreadsheet,
  RefreshCw, Settings2, ChevronDown, HeartHandshake, CircleHelp,
} from 'lucide-react';
import { getTabById } from '../data/spreadsheetTabs.ts';
import { useSyncStatus } from '../data/sheetStore.ts';
import { ensureTab, resetStore } from '../data/sheetStore.ts';
import { SyncBadge } from '../components/SyncBadge.tsx';
import { SheetConfigModal } from '../components/SheetConfigModal.tsx';

const GUIDELINES = [
  {
    icon: ShieldAlert,
    title: 'Review sangat subjektif',
    desc: 'Semua produk sudah ditest langsung dan penilaiannya murni selera reviewer. Trust your ears! Jangan ditelan mentah-mentah — jadikan bahan pembanding dengan reviewer lain.',
    tone: 'border-brass-300 bg-brass-50 text-brass-900',
    iconTone: 'text-brass-700',
  },
  {
    icon: Sparkles,
    title: 'Etika berbagi & berdiskusi',
    desc: 'Review ini bukan untuk diperdebatkan atau dilempar ke forum demi menjatuhkan pihak lain. Beda selera suara itu wajar di dunia audiophile — sampaikan pendapat dengan bijaksana.',
    tone: 'border-ink/10 bg-white text-ink',
    iconTone: 'text-ink-soft',
  },
  {
    icon: ShoppingBag,
    title: 'Dukung pembuat kitab',
    desc: 'Kalau terbantu dengan kurasi ini, dukung Fernanda Gunsan dengan checkout lewat link Tokopedia/Shopee yang tersedia, atau via Saweria di bio IG/TikTok @fernandagunsan.',
    tone: 'border-sky-200 bg-sky-50 text-sky-950',
    iconTone: 'text-sky-700',
  },
];

const FAQS = [
  {
    q: 'Apakah data di website ini selalu update?',
    a: 'Ya. Setiap kamu membuka halaman, website menarik data terbaru langsung dari Google Spreadsheet reviewer — lengkap dengan retry otomatis dan beberapa jalur cadangan. Kalau koneksi ke Google sedang bermasalah, website menampilkan data terakhir yang tersimpan di perangkatmu dan menandainya dengan jelas, bukan diam-diam.',
  },
  {
    q: 'Kenapa kadang muncul status "Cache" atau "Data bawaan"?',
    a: 'Itu artinya website belum berhasil menjangkau spreadsheet saat itu (misalnya kamu offline atau Google sedang membatasi akses). "Cache" berarti data terakhir yang pernah berhasil diambil, lengkap dengan kapan diambilnya. "Data bawaan" berarti snapshot yang disertakan di aplikasi. Ketuk badge status untuk mencoba sinkron ulang.',
  },
  {
    q: 'Seberapa bisa dipercaya ranking tier-nya?',
    a: 'Tier disusun dari pengalaman dengar langsung reviewer untuk tiap perangkat — bukan dari spesifikasi di atas kertas. Tapi telinga tiap orang beda: anggap tier sebagai peta, bukan vonis. Baca juga impresi tertulisnya sebelum memutuskan.',
  },
  {
    q: 'Apakah harga di sini akurat?',
    a: 'Harga adalah estimasi dari spreadsheet reviewer dan bisa berubah sewaktu-waktu mengikuti pasar. Selalu cek harga terkini di link toko yang tersedia sebelum checkout.',
  },
  {
    q: 'Bisakah aku pakai spreadsheet-ku sendiri?',
    a: 'Bisa. Di bagian "Sumber data" di halaman ini, ketuk "Ganti sumber spreadsheet", tempel link Google Sheet-mu (atur dulu ke "Siapa saja yang memiliki link dapat melihat"), dan website akan membaca strukturnya secara otomatis.',
  },
];

export const AboutPage: React.FC = () => {
  const iemTab = getTabById('iem');
  const sync = useSyncStatus(iemTab.gid);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await ensureTab(iemTab.gid, { force: true });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-content shadow-lg">
          <BookOpenText className="h-8 w-8" />
        </span>
        <p className="eyebrow mb-2 text-brass-700">Tentang</p>
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Kitab Audio</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          Sebuah "kitab" tier list perangkat audio — dikurasi dengan telinga,
          disusun dengan jujur, dan tersinkron otomatis dari spreadsheet reviewer.
        </p>
      </div>

      {/* Reviewer */}
      <section className="card card-border kitab-frame mb-6 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="font-display flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-brass-500 text-3xl font-black text-white shadow">
            FG
          </span>
          <div className="flex-1">
            <p className="eyebrow mb-1 text-brass-700">Sang penulis kitab</p>
            <h2 className="font-display text-2xl font-bold">Fernanda Gunsan</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Audiophile & reviewer Indonesia. Setiap perangkat di kitab ini pernah
              ia dengar langsung — dari IEM Rp 100 ribuan sampai setup endgame.
            </p>
            <p className="mt-2 text-xs font-semibold text-ink-faint">IG / TikTok: @fernandagunsan</p>
          </div>
        </div>
      </section>

      {/* Baca ini dulu */}
      <section className="mb-6">
        <h2 className="font-display mb-4 text-xl font-bold tracking-tight">Baca ini dulu woi!</h2>
        <div className="space-y-3">
          {GUIDELINES.map(g => (
            <div key={g.title} className={`card card-border flex-row items-start gap-3 p-5 ${g.tone}`}>
              <g.icon className={`h-6 w-6 shrink-0 ${g.iconTone}`} />
              <div>
                <h3 className="font-bold">{g.title}</h3>
                <p className="mt-1 text-sm leading-relaxed opacity-90">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sumber data */}
      <section className="card card-border mb-6 p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">Sumber data</h2>
            <p className="text-xs text-ink-soft">Google Spreadsheet reviewer, dibaca langsung oleh browser-mu</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-parchment/70 p-4">
          <SyncBadge
            source={sync.source}
            status={refreshing ? 'syncing' : sync.status}
            syncedAt={sync.syncedAt}
            onRefresh={handleRefresh}
          />
          <span className="text-xs text-ink-soft">
            Website mencoba beberapa jalur koneksi otomatis — langsung ke Google, lalu cache
            perangkat, lalu snapshot hasil crawl berkala — supaya data sebisa mungkin selalu segar.
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-primary btn-sm rounded-full"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Menyinkronkan…' : 'Sinkronkan ulang sekarang'}
          </button>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="btn btn-outline btn-sm rounded-full"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Ganti sumber spreadsheet
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-6">
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
          <CircleHelp className="h-5 w-5 text-brass-700" /> Tanya jawab
        </h2>
        <div className="space-y-2">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="card card-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="text-sm font-bold text-ink">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-ink-faint transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <p className="border-t border-ink/8 px-4 py-4 text-sm leading-relaxed text-ink-soft">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Dukung */}
      <section className="card card-border flex-row items-center gap-4 bg-primary p-6 text-primary-content sm:p-8">
        <HeartHandshake className="h-10 w-10 shrink-0 text-brass-300" />
        <div>
          <h2 className="font-display text-xl font-bold">Terbantu dengan kitab ini?</h2>
          <p className="mt-1 text-sm text-paper/70">
            Checkout lewat link toko di tiap perangkat untuk mendukung reviewer,
            atau traktir via Saweria di bio @fernandagunsan.
          </p>
        </div>
      </section>

      <SheetConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={() => {
          setIsConfigOpen(false);
          resetStore();
          void handleRefresh();
        }}
      />
    </div>
  );
};
