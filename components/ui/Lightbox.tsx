'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { assetUrl } from '@/lib/assets';

export interface LightboxImage { url: string; alt?: string }

interface LightboxProps {
  images:  LightboxImage[];
  current: number;
  onClose: () => void;
  onPrev:  () => void;
  onNext:  () => void;
}

export function Lightbox({ images, current, onClose, onPrev, onNext }: LightboxProps) {
  const img = images[current];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape')     onClose();
    if (e.key === 'ArrowLeft')  onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!img) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/92 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        onClick={e => { e.stopPropagation(); onClose(); }}
      >
        <X size={20} />
      </button>

      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white/80">
          {current + 1} / {images.length}
        </div>
      )}

      {images.length > 1 && (
        <button
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          onClick={e => { e.stopPropagation(); onPrev(); }}
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetUrl(img.url)}
        alt={img.alt ?? ''}
        className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          onClick={e => { e.stopPropagation(); onNext(); }}
        >
          <ChevronRight size={26} />
        </button>
      )}
    </div>
  );
}

export function useLightbox(images: LightboxImage[]) {
  const [index, setIndex] = useState<number | null>(null);
  const len = images.length;
  return {
    index,
    open:  (i: number) => setIndex(i),
    close: () => setIndex(null),
    prev:  () => setIndex(i => i !== null ? (i - 1 + len) % len : null),
    next:  () => setIndex(i => i !== null ? (i + 1) % len : null),
  };
}
