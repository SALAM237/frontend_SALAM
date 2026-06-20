'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useMemberFeatured, usePublicFeatured, type FeaturedDestination, type FeaturedItem } from '@/lib/api/featured';
import { useAuthStore } from '@/store/auth.store';

function youtubeEmbed(url: string) {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? 'https://www.youtube-nocookie.com/embed/' + id : '';
  } catch { return ''; }
}
function destinationProps(destination?: FeaturedDestination) {
  if (!destination || destination.type === 'none' || !destination.href) return {};
  return destination.type === 'external' ? { href: destination.href, target: '_blank', rel: 'noopener noreferrer' } : { href: destination.href };
}
function Media({ item, active }: { item: FeaturedItem; active: boolean }) {
  const source = item.mediaUrls[0];
  if (item.mediaType === 'image') return <img src={source} alt={item.title} loading="lazy" className="h-full w-full object-cover" />;
  const youtube = item.videoProvider === 'youtube' ? youtubeEmbed(source) : '';
  if (youtube) return <iframe src={youtube + '?autoplay=' + (item.autoplay && active ? '1' : '0') + '&mute=1'} title={item.title} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" className="h-full w-full" />;
  return <video src={source} controls preload="metadata" autoPlay={item.autoplay && active} muted={item.autoplay} playsInline className="h-full w-full object-cover" />;
}

export default function FeaturedSpotlight({ initialItems = [] }: { initialItems?: FeaturedItem[] }) {
  const token = useAuthStore(state => state.accessToken);
  const { data, isLoading } = usePublicFeatured();
  const { data: memberData } = useMemberFeatured();
  const items = (token ? memberData?.data : undefined) ?? data?.data ?? initialItems;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [preview, setPreview] = useState<FeaturedItem | null>(null);
  useEffect(() => {
    if (items.length < 2 || paused) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % items.length), 7000);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);
  useEffect(() => { if (index >= items.length) setIndex(0); }, [index, items.length]);
  if (isLoading || !items.length) return null;
  const item = items[index];

  return (
    <section className="bg-white py-12 sm:py-16" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-emerald-700">Selection SALAM</p>
            <h2 id="featured-heading" className="mt-1 text-3xl font-black text-neutral-950 sm:text-4xl">A la une</h2>
          </div>
          <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Relancer le carrousel' : 'Mettre le carrousel en pause'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-emerald-300 hover:text-emerald-700">
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
        <div className="grid min-h-[420px] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-950 shadow-xl lg:grid-cols-[1.35fr_1fr]">
          <AnimatePresence mode="wait">
            <motion.button key={'media-' + item._id} type="button" onClick={() => setPreview(item)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}
              className="relative min-h-[280px] overflow-hidden bg-black text-left lg:min-h-[460px]">
              <Media item={item} active />
              <span className="absolute bottom-4 left-4 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-black uppercase text-white backdrop-blur">Agrandir</span>
            </motion.button>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.article key={'text-' + item._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }} className="flex min-h-[300px] flex-col justify-center bg-white p-7 sm:p-10">
              <a {...destinationProps(item.titleDestination)} className="text-2xl font-black leading-tight text-neutral-950 hover:text-emerald-700 sm:text-3xl">{item.title}</a>
              <a {...destinationProps(item.textDestination)} className="mt-5 whitespace-pre-line text-sm leading-7 text-neutral-600 hover:text-neutral-900">{item.description}</a>
              {item.buttonDestination?.type !== 'none' && (
                <a {...destinationProps(item.buttonDestination)} className="mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-black text-white hover:bg-emerald-800">
                  {item.buttonLabel || 'En savoir plus'} <ArrowUpRight size={15} />
                </a>
              )}
            </motion.article>
          </AnimatePresence>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button type="button" onClick={() => setIndex(value => (value - 1 + items.length) % items.length)} aria-label="Element precedent" className="mr-2 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200"><ChevronLeft size={14} /></button>
          {items.map((entry, itemIndex) => <button key={entry._id} type="button" onClick={() => setIndex(itemIndex)} aria-label={'Afficher ' + entry.title} className={'h-2 rounded-full transition-all ' + (itemIndex === index ? 'w-7 bg-emerald-700' : 'w-2 bg-neutral-300')} />)}
          <button type="button" onClick={() => setIndex(value => (value + 1) % items.length)} aria-label="Element suivant" className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200"><ChevronRight size={14} /></button>
        </div>
      </div>
      <AnimatePresence>
        {preview && (
          <motion.div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreview(null)}>
            <div className="relative h-auto max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-lg bg-black" onClick={event => event.stopPropagation()}>
              <button type="button" onClick={() => setPreview(null)} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white"><X size={18} /></button>
              <div className="aspect-video"><Media item={preview} active /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}