import React, { useMemo } from 'react';
import {
  ArrowRight, BookOpenText, RefreshCw, ShieldCheck, Sparkles,
  Trophy, ChevronRight, FileSpreadsheet, Search, GitCompareArrows,
} from 'lucide-react';
import { navigate } from '../router.ts';
import { SPREADSHEET_TABS, getTabById } from '../data/spreadsheetTabs.ts';
import { useTabData, getTotalGearEstimate } from '../data/sheetStore.ts';
import { CategoryIcon } from '../components/CategoryIcon.tsx';
import { AudioTemplateAvatar } from '../components/AudioTemplateAvatar.tsx';
import { getTierColor, formatPrice } from '../utils/audioTheme.ts';
import { AudioItem } from '../types.ts';

const TIER_RANK: Record<string, number> = {
  SS: 110, 'S+': 100, S: 90, 'A+': 80, A: 70, 'B+': 60, B: 50, C: 40, D: 30, E: 20,
};

interface HomePageProps {
  onSelectItem: (item: AudioItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectItem }) => {
  const iemTab = getTabById('iem');
  const { result: iemResult, status: iemStatus } = useTabData(iemTab.gid);

  const topPicks = useMemo(() => {
    if (!iemResult) return [];
    return [...iemResult.items]
      .sort((a, b) => (TIER_RANK[b.tier] || 0) - (TIER_RANK[a.tier] || 0) || a.priceNumeric - b.priceNumeric)
      .slice(0, 6);
  }, [iemResult]);

  const totalGear = getTotalGearEstimate();

  return (
    <div>
      {/* HERO */}
      <section className="paper-grain relative overflow-hidden border-b border-ink/10">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-20">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4 flex items-center gap-2 text-brass-700">
              <BookOpenText className="h-4 w-4" />
              Kitab tier list audiophile
            </p>
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Semua gear audio terbaik,{' '}
              <span className="text-brass-700">terkurasi dalam satu kitab.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Dari IEM budget sampai endgame, TWS, headphone, hingga DAC —
              diranking jujur oleh reviewer, dan datanya tersinkron otomatis
              dari spreadsheet setiap ada update.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate({ page: 'catalog' })}
                className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-paper shadow-lg transition hover:bg-brass-800 active:scale-95"
              >
                <Search className="h-4 w-4" />
                Jelajahi Katalog
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => navigate({ page: 'tierlist' })}
                className="flex items-center gap-2 rounded-full border border-ink/15 bg-white/60 px-6 py-3.5 text-sm font-bold text-ink transition hover:border-brass-500 hover:text-brass-800 active:scale-95"
              >
                <Trophy className="h-4 w-4" />
                Lihat Tier List
              </button>
            </div>

            {/* Statistik */}
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { value: `${SPREADSHEET_TABS.length - 1}`, label: 'Kategori gear' },
                { value: `${totalGear}+`, label: 'Perangkat terkurasi' },
                { value: 'Otomatis', label: 'Sync spreadsheet' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 backdrop-blur">
                  <div className="font-display text-2xl font-bold text-ink">{s.value}</div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2 text-brass-700">Daftar isi kitab</p>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Pilih kategorimu</h2>
          </div>
          <button
            onClick={() => navigate({ page: 'catalog' })}
            className="hidden items-center gap-1 text-sm font-bold text-brass-700 hover:text-brass-800 sm:flex"
          >
            Semua katalog <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SPREADSHEET_TABS.filter(t => t.id !== 'baca-dulu' && !t.id.toLowerCase().includes('baca')).map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate({ page: 'catalog', tabId: tab.id })}
              className="group rounded-3xl border border-ink/10 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brass-400 hover:shadow-md active:scale-[0.99]"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-parchment text-brass-700 transition group-hover:bg-brass-100">
                <CategoryIcon name={tab.iconName} className="h-5 w-5" />
              </span>
              <div className="font-bold text-ink">{tab.label}</div>
              <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-faint">{tab.description}</div>
              {tab.countEstimate ? (
                <div className="mt-2 text-[11px] font-bold text-brass-700">{tab.countEstimate}+ gear</div>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      {/* TOP PICKS */}
      <section className="border-y border-ink/10 bg-parchment/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2 flex items-center gap-1.5 text-brass-700">
                <Sparkles className="h-3.5 w-3.5" /> Pilihan editor
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Tier tertinggi minggu ini</h2>
              <p className="mt-1 text-sm text-ink-soft">IEM dengan ranking tier terbaik dari spreadsheet reviewer.</p>
            </div>
            <button
              onClick={() => navigate({ page: 'catalog', tabId: 'iem' })}
              className="hidden items-center gap-1 text-sm font-bold text-brass-700 hover:text-brass-800 sm:flex"
            >
              Semua IEM <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {iemStatus === 'syncing' && topPicks.length === 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-28 animate-pulse rounded-3xl bg-ink/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topPicks.map(item => {
                const tierStyle = getTierColor(item.tier);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="group flex items-center gap-4 rounded-3xl border border-ink/10 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brass-400 hover:shadow-md"
                  >
                    <AudioTemplateAvatar category={item.category} name={item.name} brand={item.brand} tier={item.tier} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${tierStyle.pillBg}`}>
                          {item.tier}
                        </span>
                        <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{item.brand}</span>
                      </div>
                      <div className="mt-1 truncate font-bold text-ink group-hover:text-brass-800">{item.name}</div>
                      <div className="mt-0.5 text-xs font-semibold text-ink-soft">{formatPrice(item.priceNumeric, item.price)}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-brass-700" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="eyebrow mb-2 text-brass-700">Cara kerja</p>
        <h2 className="font-display mb-8 text-2xl font-bold tracking-tight sm:text-3xl">Dari spreadsheet ke genggamanmu</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: FileSpreadsheet,
              title: 'Reviewer mengkurasi',
              desc: 'Fernanda Gunsan mengetes langsung tiap perangkat dan menulis ranking tier di Google Spreadsheet pribadinya.',
            },
            {
              icon: RefreshCw,
              title: 'Website tersinkron otomatis',
              desc: 'Setiap kamu buka halaman, data terbaru ditarik langsung dari spreadsheet. Ada update harga atau tier baru? Langsung muncul di sini.',
            },
            {
              icon: GitCompareArrows,
              title: 'Kamu eksplor & bandingkan',
              desc: 'Filter berdasar budget dan karakter suara, baca impresi reviewer, lalu bandingkan dua gear sebelum checkout.',
            },
          ].map((s, i) => (
            <div key={s.title} className="kitab-frame rounded-3xl bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-paper">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-4xl font-black text-ink/10">{i + 1}</span>
              </div>
              <h3 className="font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Catatan reviewer */}
        <div className="mt-8 flex flex-col items-start gap-4 rounded-3xl border border-brass-300 bg-brass-50 p-6 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brass-500 text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h3 className="font-bold text-ink">Review ini sangat subjektif — dan itu intinya.</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Semua penilaian murni selera reviewer. Jadikan referensi pembanding, bukan kebenaran mutlak. Trust your ears!
            </p>
          </div>
          <button
            onClick={() => navigate({ page: 'about' })}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper transition hover:bg-brass-800 active:scale-95"
          >
            Baca catatannya <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
