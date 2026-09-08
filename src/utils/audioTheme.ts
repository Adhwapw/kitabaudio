import { AudioTier, SoundSignature } from '../types.ts';

export function getTierColor(tier: AudioTier): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pillBg: string;
  dotColor: string;
} {
  switch (tier) {
    case 'SS':
      return {
        badgeBg: 'bg-amber-500 text-white',
        badgeText: 'text-amber-700',
        badgeBorder: 'border-amber-400',
        pillBg: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500',
      };
    case 'S+':
    case 'S':
      return {
        badgeBg: 'bg-emerald-600 text-white',
        badgeText: 'text-emerald-700',
        badgeBorder: 'border-emerald-400',
        pillBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'A+':
    case 'A':
      return {
        badgeBg: 'bg-blue-600 text-white',
        badgeText: 'text-blue-700',
        badgeBorder: 'border-blue-400',
        pillBg: 'bg-blue-50 text-blue-800 border-blue-200',
        dotColor: 'bg-blue-500',
      };
    case 'B+':
    case 'B':
      return {
        badgeBg: 'bg-slate-700 text-white',
        badgeText: 'text-slate-700',
        badgeBorder: 'border-slate-300',
        pillBg: 'bg-slate-100 text-slate-700 border-slate-200',
        dotColor: 'bg-slate-500',
      };
    case 'C':
      return {
        badgeBg: 'bg-amber-700 text-white',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-300',
        pillBg: 'bg-amber-50/60 text-amber-900 border-amber-200',
        dotColor: 'bg-amber-600',
      };
    case 'D':
    case 'E':
    default:
      return {
        badgeBg: 'bg-slate-500 text-white',
        badgeText: 'text-slate-500',
        badgeBorder: 'border-slate-300',
        pillBg: 'bg-slate-50 text-slate-600 border-slate-200',
        dotColor: 'bg-slate-400',
      };
  }
}

export function getSignatureColor(signature: SoundSignature): string {
  switch (signature) {
    case 'Warm':
      return 'bg-amber-50 text-amber-800 border-amber-200/80';
    case 'Neutral':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Harman':
      return 'bg-purple-50 text-purple-800 border-purple-200/80';
    case 'V-Shape':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200/80';
    case 'Bright':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200/80';
    case 'Basshead':
      return 'bg-rose-50 text-rose-800 border-rose-200/80';
    case 'Mid-Centric':
      return 'bg-teal-50 text-teal-800 border-teal-200/80';
    case 'Dark':
      return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    case 'Balanced':
      return 'bg-blue-50 text-blue-800 border-blue-200/80';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function formatPrice(num: number, rawStr?: string): string {
  if (rawStr && rawStr !== '-' && rawStr.trim().length > 0) {
    return rawStr;
  }
  if (!num || num === 0) return 'Cek Toko';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}
