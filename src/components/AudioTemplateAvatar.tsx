import React from 'react';
import { AudioCategory } from '../types.ts';

interface AudioTemplateAvatarProps {
  category: AudioCategory | string;
  name: string;
  brand: string;
  tier?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AudioTemplateAvatar: React.FC<AudioTemplateAvatarProps> = ({
  category,
  name,
  brand,
  tier,
  size = 'md',
  className = '',
}) => {
  // Brand monogram: first 2 characters
  const monogram = (brand || name || 'AU').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();

  // Tier color accent
  const getTierAccent = (t?: string) => {
    switch (t) {
      case 'SS':
        return {
          bg: 'from-amber-500/20 via-orange-500/10 to-rose-500/10',
          badge: 'bg-amber-500 text-white',
          border: 'border-amber-400/40',
        };
      case 'S+':
      case 'S':
        return {
          bg: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/10',
          badge: 'bg-emerald-600 text-white',
          border: 'border-emerald-400/40',
        };
      case 'A+':
      case 'A':
        return {
          bg: 'from-blue-500/20 via-indigo-500/10 to-slate-500/10',
          badge: 'bg-blue-600 text-white',
          border: 'border-blue-300/50',
        };
      case 'B+':
      case 'B':
        return {
          bg: 'from-slate-200 via-slate-100 to-white',
          badge: 'bg-slate-700 text-white',
          border: 'border-slate-300/60',
        };
      default:
        return {
          bg: 'from-slate-100 to-slate-50',
          badge: 'bg-slate-500 text-white',
          border: 'border-slate-200',
        };
    }
  };

  const accent = getTierAccent(tier);

  // Size dimensions
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-13 h-13 rounded-2xl',
    lg: 'w-18 h-18 rounded-3xl',
    xl: 'w-24 h-24 rounded-3xl',
  }[size];

  const catClean = (category || '').toLowerCase();

  // Vector graphics depending on audio category
  const renderIconGraphic = () => {
    if (catClean.includes('tws') || catClean.includes('ows')) {
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-3/5 h-3/5 text-slate-800" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* TWS charging case */}
          <rect x="8" y="14" width="32" height="26" rx="10" className="fill-slate-100/90" stroke="currentColor" />
          <path d="M8 24h32" strokeDasharray="2 2" stroke="currentColor" />
          <circle cx="24" cy="20" r="1.5" className="fill-emerald-500 text-emerald-500" stroke="none" />
          {/* Earbud stem silhouette */}
          <path d="M19 12V8a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4" />
        </svg>
      );
    }

    if (catClean.includes('headphone') || catClean.includes('hp')) {
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-3/5 h-3/5 text-slate-800" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Headband */}
          <path d="M10 24C10 16.268 16.268 10 24 10s14 6.268 14 14" />
          <path d="M8 22h4v14a4 4 0 0 1-4 4v0a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4z" className="fill-slate-100/90" />
          <path d="M36 22h4a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4v0a4 4 0 0 1-4-4V22z" className="fill-slate-100/90" />
          <circle cx="24" cy="24" r="3" className="fill-slate-200" stroke="none" />
        </svg>
      );
    }

    if (catClean.includes('dongle') || catClean.includes('dac')) {
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-3/5 h-3/5 text-slate-800" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Type-C connector */}
          <rect x="18" y="6" width="12" height="6" rx="2" className="fill-amber-100" />
          {/* CNC Dongle aluminum body */}
          <rect x="12" y="12" width="24" height="28" rx="6" className="fill-slate-100/90" />
          {/* Headphone jack 3.5mm and 4.4mm */}
          <circle cx="20" cy="32" r="3" className="fill-amber-400" />
          <circle cx="28" cy="32" r="2.2" className="fill-slate-300" />
          {/* OLED / Indicator LED */}
          <rect x="17" y="17" width="14" height="6" rx="1.5" className="fill-slate-900" />
          <line x1="20" y1="20" x2="28" y2="20" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      );
    }

    if (catClean.includes('speaker') || catClean.includes('soundbar')) {
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-3/5 h-3/5 text-slate-800" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="8" width="28" height="32" rx="6" className="fill-slate-100/90" />
          {/* Tweeter */}
          <circle cx="24" cy="18" r="4" className="fill-slate-300" />
          {/* Main Woofer */}
          <circle cx="24" cy="29" r="7" className="fill-slate-200" />
          <circle cx="24" cy="29" r="3" className="fill-slate-700" />
        </svg>
      );
    }

    // Default: Audiophile In-Ear Monitor (IEM)
    return (
      <svg viewBox="0 0 48 48" fill="none" className="w-3/5 h-3/5 text-slate-800" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Ergonomic IEM Resin Shell */}
        <path d="M12 24c0-7.732 6-14 14-14 6 0 11 4 11 10 0 7-5 14-11 16-4 1.3-9-.5-11-4-2-2.5-3-5.2-3-8z" className="fill-slate-100/90" />
        {/* Nozzle & Eartip */}
        <path d="M28 35l6 5a2 2 0 0 0 3-2l-3-7" className="fill-amber-200/80" />
        {/* 2-Pin Cable Connector Socket */}
        <rect x="18" y="9" width="6" height="4" rx="1" className="fill-amber-400" />
        {/* Driver acoustic faceplate acoustic line */}
        <path d="M17 22c3 0 7 2 7 6" stroke="#64748b" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div
      id={`audio-avatar-${monogram}-${size}`}
      className={`relative flex items-center justify-center bg-gradient-to-br ${accent.bg} border ${accent.border} shadow-xs shrink-0 select-none ${sizeClasses} ${className}`}
    >
      {renderIconGraphic()}

      {/* Monogram chip in corner */}
      <span className="absolute -top-1 -right-1 px-1 py-0.2 text-[9px] font-bold tracking-tight bg-slate-900 text-white rounded-md shadow-xs ring-1 ring-white">
        {monogram}
      </span>
    </div>
  );
};
