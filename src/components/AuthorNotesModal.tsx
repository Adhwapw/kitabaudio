import React from 'react';
import { X, Heart, ShieldAlert, Sparkles, ExternalLink, ThumbsUp, ShoppingBag } from 'lucide-react';

interface AuthorNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorNotesModal: React.FC<AuthorNotesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div
        id="author-notes-modal"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Revolut-like clean styling */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-xl">
            📖
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              BACA INI DULU WOI!
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pesan Penting dari Pembuat Kitab: <strong className="text-slate-700">Fernanda Gunsan</strong>
            </p>
          </div>
        </div>

        {/* Core Guidelines */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 block font-bold mb-1">Review Sangat Subjektif</strong>
              <p className="text-amber-800/90">
                Semua produk sudah ditest/dicoba langsung dan penilaian murni sesuai subjektifitas reviewer.
                <strong> Trust your ears!</strong> Jangan ditelan mentah-mentah, dan jadikan referensi komparasi bersama reviewer audio lainnya.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Etika Berbagi & Berdiskusi</strong>
              <p className="text-slate-600">
                Review ini bukan untuk diperdebatkan atau dilempar ke forum/grup untuk menjatuhkan pihak lain. Berbeda selera suara itu wajar dalam dunia audiophile. Sampaikan pendapat dengan bijaksana.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-2.5">
            <ShoppingBag className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-900 block font-bold mb-1">Dukung Pembuat Kitab</strong>
              <p className="text-blue-800/90">
                Jika terbantu dengan kurasi ini, dukung Fernanda Gunsan dengan checkout melalui link Tokopedia/Shopee yang tersedia (langsung masukkan ke keranjang belanja) atau via Saweria di bio IG/TikTok <strong>@fernandagunsan</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Saya Mengerti & Siap Eksplor
          </button>
        </div>
      </div>
    </div>
  );
};
