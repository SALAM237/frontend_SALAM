'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function AvatarDialog({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] grid min-h-[100dvh] w-screen place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={'Photo de profil de ' + alt}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/15 bg-neutral-950 p-3 shadow-2xl"
        onMouseDown={event => event.stopPropagation()}
      >
        <button type="button" aria-label="Fermer" onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-white shadow-lg backdrop-blur transition hover:bg-black">
          <X size={19} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="min-h-0 max-h-[calc(100dvh-7rem)] w-full flex-1 rounded-lg object-contain" />
        <p className="shrink-0 px-2 pb-1 pt-3 text-center text-sm font-semibold text-white/85">{alt}</p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function AvatarLightbox({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button type="button" title="Afficher la photo de profil" onClick={() => setOpen(true)} className="inline-flex shrink-0 rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
      </button>
      {mounted && <AnimatePresence>{open && <AvatarDialog src={src} alt={alt} onClose={() => setOpen(false)} />}</AnimatePresence>}
    </>
  );
}

export function ControlledAvatarDialog({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <AnimatePresence>{src && <AvatarDialog src={src} alt={alt} onClose={onClose} />}</AnimatePresence>;
}
export function GlobalProfilePhotoLightbox() {
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);
  useEffect(() => {
    const openProfilePhoto = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      const isMarked = target.hasAttribute('data-profile-photo');
      const isRoundAvatar = target.classList.contains('rounded-full');
      const isLogo = target.src.includes('/images/logo/') || target.alt.trim().toLowerCase() === 'salam';
      if ((!isMarked && !isRoundAvatar) || isLogo) return;
      event.preventDefault();
      event.stopPropagation();
      setPreview({ src: target.currentSrc || target.src, alt: target.alt || 'Photo de profil' });
    };
    document.addEventListener('click', openProfilePhoto, true);
    return () => document.removeEventListener('click', openProfilePhoto, true);
  }, []);

  return preview
    ? <ControlledAvatarDialog src={preview.src} alt={preview.alt} onClose={() => setPreview(null)} />
    : null;
}