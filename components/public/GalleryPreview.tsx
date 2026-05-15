'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ImageIcon, Play } from 'lucide-react';

/* Gallery items with gradient colors that represent the association */
const ITEMS = [
  {
    id: 1,
    title: 'Rencontre annuelle 2025',
    category: 'Culture',
    gradient: 'linear-gradient(135deg,#0B8F3A,#064d20)',
    span: 'md:col-span-2 md:row-span-2',
    size: 'large',
  },
  {
    id: 2,
    title: 'Tournoi de fraternité',
    category: 'Sport',
    gradient: 'linear-gradient(135deg,#C8102E,#7f0a1d)',
    span: '',
    size: 'small',
  },
  {
    id: 3,
    title: 'Soirée gastronomique',
    category: 'Culture',
    gradient: 'linear-gradient(135deg,#F7C600,#d4a200)',
    span: '',
    size: 'small',
  },
  {
    id: 4,
    title: 'Atelier orientation',
    category: 'Éducation',
    gradient: 'linear-gradient(135deg,#6D28D9,#4c1d95)',
    span: '',
    size: 'small',
  },
  {
    id: 5,
    title: 'Action bénévole',
    category: 'Bénévolat',
    gradient: 'linear-gradient(135deg,#2563EB,#1e3a8a)',
    span: '',
    size: 'small',
  },
];

export function GalleryPreview() {
  return (
    <section>
      <div className="container-salam section-salam">

        {/* ── Header ── */}
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
              Revivez les meilleurs moments de l'association SALAM.
            </p>
          </div>
          <Link
            href="/galerie"
            className="group inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-salam-green"
          >
            Toute la galerie
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ── Mosaic grid ── */}
        <div
          className="grid grid-cols-2 gap-[clamp(0.5rem,1.2vw,1rem)] md:grid-cols-3"
          style={{ gridTemplateRows: 'repeat(2, minmax(clamp(100px,16vw,180px), 1fr))' }}
        >
          {ITEMS.map(({ id, title, category, gradient, span, size }, idx) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className={`group relative overflow-hidden cursor-pointer ${span}`}
              style={{
                borderRadius: 'clamp(0.75rem,1.5vw,1.25rem)',
                background: gradient,
                minHeight: size === 'large' ? 'clamp(200px,28vw,320px)' : 'clamp(100px,14vw,180px)',
              }}
            >
              {/* Pattern overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: size === 'large' ? '24px 24px' : '18px 18px',
                }}
              />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon
                  size={size === 'large' ? 52 : 32}
                  className="text-white/20 transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Play icon for large item */}
              {size === 'large' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Play size={20} className="translate-x-0.5 text-white" />
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" />

              {/* Text (appears on hover) */}
              <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-[clamp(0.75rem,1.5vw,1.25rem)] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">{category}</p>
                <p
                  className="mt-0.5 font-bold leading-tight text-white"
                  style={{ fontSize: size === 'large' ? 'clamp(0.9rem,1.6vw,1.1rem)' : 'clamp(0.75rem,1.2vw,0.85rem)' }}
                >
                  {title}
                </p>
              </div>

              {/* Always visible small badge on small cards */}
              {size === 'small' && (
                <div className="absolute left-[clamp(0.5rem,1vw,0.75rem)] top-[clamp(0.5rem,1vw,0.75rem)]">
                  <span className="rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                    {category}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Photos count ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-5 text-center text-[13px] text-neutral-400"
        >
          Plus de{' '}
          <span className="font-bold text-salam-green">320 photos</span>{' '}
          disponibles dans la galerie
        </motion.p>
      </div>
    </section>
  );
}
