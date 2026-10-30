import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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
    <div className="modal modal-open modal-bottom sm:modal-middle" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sumber spreadsheet"
        className="modal-box max-h-[92vh] w-full max-w-xl overflow-hidden bg-base-100 p-0"
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
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm" aria-label="Tutup pengaturan spreadsheet">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar max-h-[70vh] space-y-5 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="label" htmlFor="sheet-source-input">
                <span className="label-text font-bold">Link / Sheet ID Google Spreadsheet</span>
              </label>
              <label className="input w-full">
                <Link2 className="h-4 w-4 text-base-content/60" aria-hidden="true" />
                <input
                  id="sheet-source-input"
                  type="text"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/…/edit"
                  className="grow font-mono text-xs"
                />
              </label>
              <p className="mt-1 text-[11px] text-ink-faint">Bisa URL lengkap atau cukup Sheet ID-nya saja.</p>
            </div>

            {error && (
              <div role="alert" className="alert alert-error text-xs">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-bold">Gagal membaca spreadsheet</div>
                  <div className="mt-0.5">{error}</div>
                </div>
              </div>
            )}
            {success && (
              <div role="status" className="alert alert-success text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> {success}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={testing}
                className="btn btn-primary flex-1"
              >
                <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Menguji koneksi…' : 'Uji & Simpan Sumber'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline"
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
            className="btn btn-ghost w-full sm:w-auto"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
