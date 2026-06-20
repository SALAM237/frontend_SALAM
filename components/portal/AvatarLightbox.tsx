'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function AvatarLightbox({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" title="Afficher la photo de profil" onClick={() => setOpen(true)} className="rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)} onKeyDown={event => event.key === 'Escape' && setOpen(false)} role="dialog" aria-modal="true" aria-label="Photo de profil">
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/15 bg-neutral-950 p-3 shadow-2xl" onClick={event => event.stopPropagation()}>
              <button type="button" aria-label="Fermer" onClick={() => setOpen(false)}
                className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur transition hover:bg-black">
                <X size={18} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className="max-h-[75vh] w-full rounded-lg object-contain" />
              <p className="px-2 pb-1 pt-3 text-center text-sm font-semibold text-white/85">{alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}