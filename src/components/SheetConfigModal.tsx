import React, { useState } from 'react';
import {
  X, FileSpreadsheet, Link2, HelpCircle, CheckCircle2,
  AlertCircle, RefreshCw, RotateCcw,
} from 'lucide-react';
import { parseGoogleSheetUrl } from '../utils/sheetParser.ts';
import { syncTab, getSheetId, setSheetId } from '../utils/sheetSync.ts';

interface SheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Ganti sumber spreadsheet. URL diuji langsung dari browser sebelum disimpan,
 * jadi pengguna tahu seketika apakah sheet-nya bisa dibaca.
 */
export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [urlInput, setUrlInput] = useState(getSheetId());
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = parseGoogleSheetUrl(urlInput.trim());
    if (!parsed) {
      setError('Link tidak dikenali. Tempel URL Google Sheets lengkap atau Sheet ID-nya.');
      return;
    }

    setTesting(true);
    try {
      // Uji baca tab pertama langsung dari browser
      const result = await syncTab(parsed.gid || '0', { sheetId: parsed.sheetId, force: true });
      if (result.source === 'live') {
        setSheetId(parsed.sheetId);
        setSuccess(`Berhasil! Terbaca ${result.items.length} perangkat dari spreadsheet.`);
        setTimeout(onSaved, 1200);
      } else {
        setError(
          'Spreadsheet tidak bisa dibaca langsung. Pastikan pengaturannya: Bagikan → "Siapa saja yang memiliki link" → Pelihat.'
        );
      }
    } catch {
      setError('Gagal menghubungi spreadsheet. Periksa koneksi internetmu lalu coba lagi.');
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    setSheetId(null);
    setUrlInput(getSheetId());
    setSuccess('Kembali ke spreadsheet bawaan Kitab Audio.');
    setTimeout(onSaved, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-t-3xl bg-paper shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 bg-white/60 p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-ink">Sumber Spreadsheet</h2>
              <p className="text-xs text-ink-soft">Pakai sheet-mu sendiri atau kembali ke bawaan</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-faint transition hover:bg-ink/5 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar max-h-[70vh] space-y-5 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="eyebrow mb-1.5 block text-ink-soft">Link / Sheet ID Google Spreadsheet</label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/…/edit"
                  className="w-full rounded-2xl border border-ink/15 bg-white py-3 pl-10 pr-4 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-brass-500 focus:outline-none focus:ring-2 focus:ring-brass-200"
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-faint">Bisa URL lengkap atau cukup Sheet ID-nya saja.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-bold">Gagal membaca spreadsheet</div>
                  <div className="mt-0.5">{error}</div>
                </div>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={testing}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-xs font-bold text-paper transition hover:bg-brass-800 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Menguji koneksi…' : 'Uji & Simpan Sumber'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-2xl border border-ink/15 bg-white px-4 py-3 text-xs font-bold text-ink-soft transition hover:border-brass-400 hover:text-ink"
                title="Kembali ke spreadsheet bawaan"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Bawaan
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex w-full items-center justify-between p-4 text-xs font-bold text-ink"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-brass-600" /> Cara membagikan spreadsheet-mu
              </span>
              <span className="text-ink-faint">{showGuide ? 'Tutup' : 'Lihat'}</span>
            </button>
            {showGuide && (
              <ol className="list-decimal space-y-2 border-t border-ink/10 bg-parchment/50 px-8 py-4 text-xs leading-relaxed text-ink-soft">
                <li>Buka Google Sheets-mu di browser.</li>
                <li>Klik <strong>Bagikan</strong> di kanan atas.</li>
                <li>Ubah akses umum menjadi <strong>"Siapa saja yang memiliki link"</strong> sebagai <strong>Pelihat</strong>.</li>
                <li>Salin link-nya, tempel di kolom atas, lalu ketuk <strong>Uji & Simpan</strong>.</li>
              </ol>
            )}
          </div>
        </div>

        <div className="border-t border-ink/10 bg-white/60 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-ink/5 py-2.5 text-xs font-bold text-ink transition hover:bg-ink/10 sm:w-auto sm:px-8"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
