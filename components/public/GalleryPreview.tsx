'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ImageIcon, Play } from 'lucide-react';
import { usePublicAlbums } from '@/lib/api/gallery';

const fallbackGradients = [
  'linear-gradient(135deg,#0B8F3A,#064d20)',
  'linear-gradient(135deg,#C8102E,#7f0a1d)',
  'linear-gradient(135deg,#F7C600,#d4a200)',
  'linear-gradient(135deg,#6D28D9,#4c1d95)',
  'linear-gradient(135deg,#2563EB,#1e3a8a)',
];

export function GalleryPreview() {
  const { data, isLoading } = usePublicAlbums();
  const albums = data?.data ?? [];
  const photos = albums
    .flatMap(album => (album.images ?? [])
      .filter(image => image.isPublished !== false && (image.visibility ?? album.visibility) === 'public')
      .map(image => ({
        id: `${album._id}-${image.url}`,
        title: image.alt || album.title,
        category: album.tags?.[0] || 'Galerie',
        url: image.url,
        albumTitle: album.title,
      })))
    .slice(0, 5);

  return (
    <section>
      <div className="container-salam section-salam">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          viewport={{ once: true }}
          className="mb-[clamp(2rem,5vw,4rem)] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="badge-pill mb-4 border-salam-green/20 bg-green-50 text-salam-green">
              Galerie
            </span>
            <h2 className="subtitle-salam text-salam-ink">
              Nos moments<br />en images
            </h2>
            <p className="text-salam mt-3 max-w-md text-neutral-600">
              Revivez les meilleurs moments publics de l'association SALAM.
            </p>
          </div>
          <Link href="/galerie" className="group inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-salam-green">
            Toute la galerie
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.2vw,1rem)] md:grid-cols-3">
            {[1, 2, 3, 4, 5].map(item => (
              <div key={item} className="min-h-[clamp(100px,14vw,180px)] rounded-2xl bg-neutral-100" />
            ))}
          </div>
        )}

        {!isLoading && photos.length === 0 && (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ImageIcon size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900">Aucune photo publique pour le moment</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
              Les albums publics publiés dans la galerie apparaîtront ici automatiquement.
            </p>
          </div>
        )}

        {!isLoading && photos.length > 0 && (
          <div
            className="grid grid-cols-2 gap-[clamp(0.5rem,1.2vw,1rem)] md:grid-cols-3"
            style={{ gridTemplateRows: 'repeat(2, minmax(clamp(100px,16vw,180px), 1fr))' }}
          >
            {photos.map((photo, idx) => {
              const large = idx === 0;
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className={`group relative cursor-pointer overflow-hidden ${large ? 'md:col-span-2 md:row-span-2' : ''}`}
                  style={{
                    borderRadius: 'clamp(0.75rem,1.5vw,1.25rem)',
                    background: fallbackGradients[idx % fallbackGradients.length],
                    minHeight: large ? 'clamp(200px,28vw,320px)' : 'clamp(100px,14vw,180px)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/30" />
                  {large && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Play size={20} className="translate-x-0.5 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-[clamp(0.75rem,1.5vw,1.25rem)]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">{photo.category}</p>
                    <p className="mt-0.5 line-clamp-2 font-bold leading-tight text-white" style={{ fontSize: large ? 'clamp(0.9rem,1.6vw,1.1rem)' : 'clamp(0.75rem,1.2vw,0.85rem)' }}>
                      {photo.albumTitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {photos.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-5 text-center text-[13px] text-neutral-400"
          >
            <span className="font-bold text-salam-green">{photos.length}</span> photo{photos.length > 1 ? 's' : ''} publique{photos.length > 1 ? 's' : ''} mise{photos.length > 1 ? 's' : ''} en avant
          </motion.p>
        )}
      </div>
    </section>
  );
}
