import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Link, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw 
} from 'lucide-react';
import { SheetMetadata } from '../types';

interface SheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: SheetMetadata;
  currentUrl: string;
  onSaveAndSync: (url: string, gid?: string) => Promise<boolean>;
  onResetToDefault: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  isOpen,
  onClose,
  metadata,
  currentUrl,
  onSaveAndSync,
  onResetToDefault,
  isLoading,
  error: initialError,
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [gidInput, setGidInput] = useState('0');
  const [showGuide, setShowGuide] = useState(false);
  const [localError, setLocalError] = useState<string | null>(initialError || null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!urlInput.trim()) {
      setLocalError('Silakan masukkan link Google Spreadsheet teman Anda.');
      return;
    }

    const success = await onSaveAndSync(urlInput.trim(), gidInput.trim());
    if (success) {
      setSuccessMsg('Data spreadsheet berhasil di-scrape dan disinkronkan!');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    }
  };

  const handleUseExample = () => {
    // Example public test sheet format or instructions
    setUrlInput('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
    setGidInput('0');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Hubungkan Google Spreedsheet
              </h2>
              <p className="text-xs text-slate-400">
                Sinkronkan Kitab Audio teman tanpa Google API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          {/* Status Alert Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
              metadata.isCustom
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold">
                {metadata.isCustom
                  ? 'Tersambung ke Spreedsheet Kustom Teman'
                  : 'Saat Ini Menggunakan Database Referensi Bawaan'}
              </div>
              <div className="text-slate-300 mt-0.5 text-[11px]">
                {metadata.rowCount} item perangkat terdata • Terakhir diperbarui:{' '}
                {new Date(metadata.lastSyncedAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                Link / URL Google Spreadsheet Teman:
              </label>
              <div className="relative">
                <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  id="sheet-url-input"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1A2B3C.../edit"
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Bisa berupa link URL lengkap sheet atau cukup Sheet ID.
              </p>
            </div>

            {/* Optional GID / Tab Selector */}
            <div className="flex items-center gap-2">
              <div className="w-28 shrink-0">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Sheet GID (Tab):
                </label>
                <input
                  type="text"
                  id="sheet-gid-input"
                  value={gidInput}
                  onChange={e => setGidInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-800 font-mono"
                />
              </div>
              <div className="text-[11px] text-slate-400 pt-4">
                (Default: <code className="text-amber-400">0</code> adalah lembar tab pertama pada spreadsheet)
              </div>
            </div>

            {/* Error or Success Feedback */}
            {localError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Gagal Mengambil Data:</div>
                  <div className="text-[11px] text-rose-200">{localError}</div>
                  <div className="text-[11px] text-slate-400">
                    Pastikan teman Anda sudah mengatur akses: <strong>Bagikan → Siapa saja yang memiliki link dapat melihat</strong>.
                  </div>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                id="submit-sheet-btn"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Sedang Scraping...' : 'Sinkronkan Data Spreedsheet'}</span>
              </button>

              {metadata.isCustom && (
                <button
                  type="button"
                  onClick={onResetToDefault}
                  id="reset-default-sheet-btn"
                  className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                  title="Kembali ke database referensi bawaan"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kitab Bawaan</span>
                </button>
              )}
            </div>
          </form>

          {/* Guide Accordion: How to Share Google Sheet */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Panduan: Cara Teman Mengatur Spreedsheet-nya</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {showGuide ? 'Tutup' : 'Lihat'}
              </span>
            </button>

            {showGuide && (
              <div className="p-4 pt-1 text-xs text-slate-300 space-y-3 border-t border-slate-800/80 bg-slate-950/70">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <strong>Buka Google Sheets:</strong> Minta teman Anda membuka file spreadsheet tier list audionya di browser.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <strong>Klik Tombol Bagikan (Share):</strong> Di pojok kanan atas Google Sheet.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <strong>Ubah Akses Umum:</strong> Pilih <em>"Siapa saja yang memiliki link"</em> dengan peran sebagai <em>"Pelihat" (Viewer)</em>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <div>
                      <strong>Salin Link & Tempel di Sini:</strong> Website ini akan langsung mengambil data secara otomatis kapan pun teman Anda melakukan update di spreadsheet!
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-amber-400">Format Kolom yang Didukung Otomatis:</strong>
                  <br />
                  Kolom bisa menggunakan bahasa Indonesia atau Inggris: <em>Tier / Rank, Nama Perangkat / Device, Brand, Kategori (IEM, Headphone, DAC), Harga, Karakter Suara / Signature, Tonal, Teknis, Driver, Kelebihan, Kekurangan, Catatan Review</em>.
                </div>
              </div>
            )}
          </div>

          {/* Detected Headers if available */}
          {metadata.columnHeaders && metadata.columnHeaders.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Kolom Terdeteksi di Spreadsheet ({metadata.columnHeaders.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar p-1">
                {metadata.columnHeaders.map((header, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
