'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Images, ImageIcon } from 'lucide-react';
import { usePublicAlbums } from '@/lib/api/gallery';

const fallbackGradients = [
  'linear-gradient(135deg,#0B8F3A,#064d20)',
  'linear-gradient(135deg,#C8102E,#7f0a1d)',
  'linear-gradient(135deg,#F7C600,#d4a200)',
  'linear-gradient(135deg,#6D28D9,#4c1d95)',
  'linear-gradient(135deg,#2563EB,#1e3a8a)',
  'linear-gradient(135deg,#0891b2,#164e63)',
];

export function GalleryPreview() {
  const { data, isLoading } = usePublicAlbums();
  const albums = (data?.data ?? []).slice(0, 6);

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
              Revivez les meilleurs moments publics de l&apos;association SALAM.
            </p>
          </div>
          <Link href="/galerie" className="group inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-salam-green">
            Toute la galerie
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.2vw,1rem)] md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(item => (
              <div key={item} className="h-[clamp(140px,20vw,220px)] rounded-2xl bg-neutral-100" />
            ))}
          </div>
        )}

        {!isLoading && albums.length === 0 && (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ImageIcon size={22} />
            </div>
            <h3 className="text-lg font-black text-neutral-900">Aucun album publié pour le moment</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
              Les albums publics apparaîtront ici automatiquement.
            </p>
          </div>
        )}

        {!isLoading && albums.length > 0 && (
          <div className="grid grid-cols-2 gap-[clamp(0.5rem,1.2vw,1rem)] md:grid-cols-3">
            {albums.map((album: any, idx: number) => {
              const cover = (album.images ?? []).find((img: any) => img.isPublished !== false);
              const photoCount = (album.images ?? []).filter((img: any) => img.isPublished !== false).length;
              return (
                <motion.div
                  key={album._id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                >
                  <Link
                    href="/galerie"
                    className="group block overflow-hidden rounded-2xl border border-white/10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                    style={{ borderRadius: 'clamp(0.75rem,1.5vw,1.25rem)' }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        height: 'clamp(140px,20vw,220px)',
                        background: fallbackGradients[idx % fallbackGradients.length],
                      }}
                    >
                      {cover && (
                        <Image
                          src={cover.thumbnailUrl || cover.mediumUrl || cover.url}
                          alt={cover.alt || album.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-[clamp(0.75rem,1.5vw,1rem)]">
                        {album.tags?.[0] && (
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/70 mb-0.5">
                            {album.tags[0]}
                          </p>
                        )}
                        <p className="line-clamp-2 font-black leading-tight text-white" style={{ fontSize: 'clamp(0.78rem,1.4vw,0.95rem)' }}>
                          {album.title}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-white/60" style={{ fontSize: 'clamp(0.65rem,1vw,0.75rem)' }}>
                          <Images size={10} />
                          <span>{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {albums.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-5 text-center text-[13px] text-neutral-400"
          >
            <span className="font-bold text-salam-green">{albums.length}</span> album{albums.length > 1 ? 's' : ''} publié{albums.length > 1 ? 's' : ''}
          </motion.p>
        )}
      </div>
    </section>
  );
}
