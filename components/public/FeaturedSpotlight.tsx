'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, X, Megaphone } from 'lucide-react';
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
const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction > 0 ? '-100%' : '100%' }),
};
function Media({ item, active }: { item: FeaturedItem; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (active) return;
    videoRef.current?.pause();
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
  }, [active]);
  const source = item.mediaUrls[0]?.trim() ?? '';
  const validSource = source.startsWith('/') || source.startsWith('https://') || source.startsWith('http://');
  if (!validSource) {
    return (
      <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-neutral-900 px-6 text-center text-sm font-bold text-white/70">
        Media indisponible. Reimportez le fichier depuis l editeur.
      </div>
    );
  }
  if (item.mediaType === 'image') return <img src={source} alt={item.title} loading="lazy" className="h-full w-full object-cover" />;
  const youtube = item.videoProvider === 'youtube' ? youtubeEmbed(source) : '';
  if (youtube) return <iframe ref={iframeRef} data-exclusive-media="youtube" src={youtube + '?enablejsapi=1&playsinline=1&autoplay=' + (item.autoplay && active ? '1' : '0') + '&mute=1'} onLoad={event => event.currentTarget.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), '*')} title={item.title} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" className="h-full w-full" />;
  return <video ref={videoRef} src={source} controls preload="metadata" autoPlay={item.autoplay && active} muted={item.autoplay} playsInline className="h-full w-full object-cover" />;
}

export default function FeaturedSpotlight({ initialItems = [] }: { initialItems?: FeaturedItem[] }) {
  const token = useAuthStore(state => state.accessToken);
  const { data, isLoading } = usePublicFeatured();
  const { data: memberData } = useMemberFeatured();
  const items = (token ? memberData?.data : undefined) ?? data?.data ?? initialItems;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [preview, setPreview] = useState<FeaturedItem | null>(null);
  const [direction, setDirection] = useState(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (items.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex(value => (value + 1) % items.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);
  useEffect(() => { if (index >= items.length) setIndex(0); }, [index, items.length]);
const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch || items.length < 2) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    setDirection(deltaX < 0 ? 1 : -1);
    setIndex(value => deltaX < 0 ? (value + 1) % items.length : (value - 1 + items.length) % items.length);
  };
  if (!items.length) {
    return (
      <section className="bg-white py-12 sm:py-16" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-7">
            <p className="text-xs font-black uppercase text-emerald-700">Selection SALAM</p>
            <h2 id="featured-heading" className="mt-1 text-3xl font-black text-neutral-950 sm:text-4xl">A la une</h2>
          </div>
          <div className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-6 text-center">
            {isLoading ? <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" /> : <Megaphone size={30} className="text-emerald-700" />}
            <p className="mt-4 text-base font-black text-neutral-800">{isLoading ? 'Chargement des informations...' : 'Les prochaines informations a la une seront publiees ici.'}</p>
            {!isLoading && <p className="mt-1 max-w-lg text-sm leading-6 text-neutral-500">Actualites importantes, annonces et initiatives mises en avant par SALAM.</p>}
          </div>
        </div>
      </section>
    );
  }
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
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          className="relative min-h-[540px] touch-pan-y overflow-hidden rounded-lg border border-neutral-200 bg-neutral-950 shadow-xl lg:min-h-[460px]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div key={item._id} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="grid min-h-[540px] w-full bg-neutral-950 lg:min-h-[460px] lg:grid-cols-[1.35fr_1fr]">
              <button type="button" onClick={() => setPreview(item)}
                className="relative min-h-[280px] overflow-hidden bg-black text-left lg:min-h-[460px]">
                <Media item={item} active={!preview} />
                <span className="absolute bottom-4 left-4 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-black uppercase text-white backdrop-blur">Agrandir</span>
              </button>
              <article className="flex min-h-[260px] flex-col justify-center bg-white p-5 sm:p-7 lg:p-8">
                <a {...destinationProps(item.titleDestination)} className="text-xl font-black leading-snug text-neutral-950 hover:text-emerald-700 sm:text-2xl">{item.title}</a>
                <a {...destinationProps(item.textDestination)} className="mt-3 whitespace-pre-line text-sm leading-6 text-neutral-600 hover:text-neutral-900">{item.description}</a>
                {item.buttonDestination?.type !== 'none' && (
                  <a {...destinationProps(item.buttonDestination)} className="mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-black text-white hover:bg-emerald-800">
                    {item.buttonLabel || 'En savoir plus'} <ArrowUpRight size={15} />
                  </a>
                )}
              </article>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button type="button" onClick={() => { setDirection(-1); setIndex(value => (value - 1 + items.length) % items.length); }} aria-label="Element precedent" className="mr-2 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200"><ChevronLeft size={14} /></button>
          {items.map((entry, itemIndex) => <button key={entry._id} type="button" onClick={() => { if (itemIndex !== index) { setDirection(itemIndex > index ? 1 : -1); setIndex(itemIndex); } }} aria-label={'Afficher ' + entry.title} className={'h-1.5 rounded-full transition-all ' + (itemIndex === index ? 'w-7 bg-emerald-700' : 'w-1.5 bg-neutral-300')} />)}
          <button type="button" onClick={() => { setDirection(1); setIndex(value => (value + 1) % items.length); }} aria-label="Element suivant" className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200"><ChevronRight size={14} /></button>
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