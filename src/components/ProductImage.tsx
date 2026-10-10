import React, { useState } from 'react';
import { AudioTemplateAvatar } from './AudioTemplateAvatar.tsx';
import { AudioItem } from '../types.ts';

interface ProductImageProps {
  item: AudioItem;
  /** Kelas untuk <img> (ukuran & rounding). */
  className?: string;
  /** Ukuran avatar fallback bila tidak ada gambar / gagal dimuat. */
  avatarSize?: 'sm' | 'md' | 'lg';
}

/**
 * Foto produk bila tersedia (dari kolom "Gambar" di spreadsheet atau cache
 * kurasi). Otomatis jatuh ke monogram avatar bila tidak ada atau gagal dimuat.
 * referrerPolicy no-referrer membantu melewati proteksi hotlink sederhana.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  item,
  className = 'h-14 w-14 rounded-2xl',
  avatarSize = 'md',
}) => {
  const [failed, setFailed] = useState(false);

  if (!item.imageUrl || failed) {
    return (
      <AudioTemplateAvatar
        category={item.category}
        name={item.name}
        brand={item.brand}
        tier={item.tier}
        size={avatarSize}
      />
    );
  }

  return (
    <img
      src={item.imageUrl}
      alt={`Foto ${item.name}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`shrink-0 border border-ink/10 bg-parchment object-cover ${className}`}
    />
  );
};
