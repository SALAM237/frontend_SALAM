'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Expand, Pause, Play, X, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import { useMemberFeatured, usePublicFeatured, type FeaturedDestination, type FeaturedItem } from '@/lib/api/featured';
import { useAuthStore } from '@/store/auth.store';

const SLIDE_DELAY = 5_000;

function youtubeEmbed(url: string) {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? 'https://www.youtube-nocookie.com/embed/' + id : '';
  } catch { return ''; }
}

function destinationProps(destination?: FeaturedDestination) {
  if (!destination || destination.type === 'none' || !destination.href) return {};
  return destination.type === 'external'
    ? { href: destination.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: destination.href };
}

function Media({ item, active, playbackId, onPlaybackChange }: {
  item: FeaturedItem;
  active: boolean;
  playbackId: string;
  onPlaybackChange: (id: string, playing: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (active) return;
    videoRef.current?.pause();
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
    onPlaybackChange(playbackId, false);
  }, [active, onPlaybackChange, playbackId]);

  useEffect(() => {
    const receiveYoutubeState = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      let payload: unknown = event.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { return; }
      }
      if (!payload || typeof payload !== 'object') return;
      const data = payload as { event?: string; info?: number };
      if (data.event !== 'onStateChange') return;
      if (data.info === 1) onPlaybackChange(playbackId, true);
      if (data.info === 0 || data.info === 2 || data.info === 5) onPlaybackChange(playbackId, false);
    };
    window.addEventListener('message', receiveYoutubeState);
    return () => {
      window.removeEventListener('message', receiveYoutubeState);
      onPlaybackChange(playbackId, false);
    };
  }, [onPlaybackChange, playbackId]);

  const source = item.mediaUrls[0]?.trim() ?? '';
  const validSource = source.startsWith('/') || source.startsWith('https://') || source.startsWith('http://');
  if (!validSource) return <div className="grid h-full w-full place-items-center bg-neutral-900 px-6 text-center text-sm font-bold text-white/70">Media indisponible. Reimportez le fichier depuis l editeur.</div>;
  if (item.mediaType === 'image') return <img src={source} alt={item.title} loading="lazy" className="h-full w-full object-cover" />;

  const youtube = item.videoProvider === 'youtube' ? youtubeEmbed(source) : '';
  if (youtube) return <iframe ref={iframeRef} data-exclusive-media="youtube" src={youtube + '?enablejsapi=1&playsinline=1&autoplay=' + (item.autoplay && active ? '1' : '0') + '&mute=1'} onLoad={event => event.currentTarget.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), '*')} title={item.title} loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" className="h-full w-full" />;

  return <video ref={videoRef} src={source} controls preload="metadata" autoPlay={item.autoplay && active} muted={item.autoplay} playsInline
    onPlay={() => onPlaybackChange(playbackId, true)} onPause={() => onPlaybackChange(playbackId, false)} onEnded={() => onPlaybackChange(playbackId, false)}
    className="h-full w-full object-cover" />;
}

export default function FeaturedSpotlight({ initialItems = [] }: { initialItems?: FeaturedItem[] }) {
  const token = useAuthStore(state => state.accessToken);
  const { data, isLoading } = usePublicFeatured();
  const { data: memberData } = useMemberFeatured();
  const items = (token ? memberData?.data : undefined) ?? data?.data ?? initialItems;
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [lastNav, setLastNav] = useState<'prev' | 'next' | null>(null);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<FeaturedItem | null>(null);
  const [playingMediaIds, setPlayingMediaIds] = useState<Set<string>>(() => new Set());

  const handlePlaybackChange = useCallback((id: string, playing: boolean) => {
    setPlayingMediaIds(current => {
      const next = new Set(current);
      if (playing) next.add(id); else next.delete(id);
      if (next.size === current.size && [...next].every(value => current.has(value))) return current;
      return next;
    });
  }, []);
  const mediaPlaying = playingMediaIds.size > 0;

  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay) return;
    if (manualPaused || mediaPlaying || preview) autoplay.pause();
    else autoplay.resume();
  }, [manualPaused, mediaPlaying, preview]);

  useEffect(() => {
    swiperRef.current?.update();
    if (activeIndex >= items.length) {
      swiperRef.current?.slideTo(0, 0);
      setActiveIndex(0);
    }
  }, [activeIndex, items.length]);

  const selectSlide = (index: number) => {
    if (index === activeIndex) return;
    setLastNav(index > activeIndex ? 'next' : 'prev');
    swiperRef.current?.slideTo(index);
  };

  if (!items.length) {
    return (
      <section className="bg-white py-12 sm:py-16" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase text-emerald-700">Selection SALAM</p>
            <h2 id="featured-heading" className="text-3xl font-black text-neutral-950 sm:text-4xl">A la une</h2>
          </div>
          <div className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-6 text-center">
            {isLoading ? <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" /> : <Megaphone size={30} className="text-emerald-700" />}
            <p className="mt-4 text-base font-black text-neutral-800">{isLoading ? 'Chargement des informations...' : 'Les prochaines informations a la une seront publiees ici.'}</p>
            {!isLoading && <p className="mt-1 max-w-lg text-sm leading-6 text-neutral-500">Actualites importantes, annonces et initiatives mises en avant par SALAM.</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden py-10 sm:py-14"
      style={{ background: 'linear-gradient(to right, #ffffff 0%, #ffffff 30%, #0b1f15 72%, #07140d 100%)' }}
      aria-labelledby="featured-heading"
    >
      {/* Motif ndop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.15] md:opacity-[0.12]"
        style={{
          backgroundImage: "url('/images/placeholders/ndop motif WBG.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'soft-light',
        }}
      />

      <div className="relative mx-auto max-w-[1500px]">

        {/* ── Header : titre + contrôles ── */}
        <div className="mx-auto mb-1 flex max-w-7xl items-end justify-between gap-4 px-4 sm:mb-2 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase text-emerald-700">Selection SALAM</p>
            <h2 id="featured-heading" className="text-3xl font-black text-neutral-950 sm:text-4xl">A la une</h2>
          </div>

          {/* Chevron gauche · Pause · Chevron droit */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { swiperRef.current?.slidePrev(); setLastNav('prev'); }}
              aria-label="Element précédent"
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                lastNav === 'prev'
                  ? 'border-transparent bg-emerald-600 text-white'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={() => setManualPaused(v => !v)}
              aria-label={manualPaused ? 'Relancer le carrousel' : 'Mettre le carrousel en pause'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-all duration-200 hover:border-emerald-300 hover:text-emerald-700"
            >
              {manualPaused ? <Play size={13} /> : <Pause size={13} />}
            </button>

            <button
              type="button"
              onClick={() => { swiperRef.current?.slideNext(); setLastNav('next'); }}
              aria-label="Element suivant"
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                lastNav === 'next'
                  ? 'border-transparent bg-emerald-600 text-white'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* ── Carrousel ── */}
        <div className="relative h-[90vh] min-h-[560px] max-h-[860px] overflow-hidden">
          <Swiper
            modules={[Autoplay, A11y]}
            className="h-full !overflow-visible"
            slidesPerView={1.1}
            centeredSlides
            spaceBetween={12}
            rewind={items.length > 1}
            speed={500}
            autoplay={items.length > 1 ? { delay: SLIDE_DELAY, disableOnInteraction: false, waitForTransition: true } : false}
            breakpoints={{
              768:  { slidesPerView: 1.1, centeredSlides: true, spaceBetween: 18 },
              1024: { slidesPerView: 1.1, centeredSlides: true, spaceBetween: 22 },
            }}
            onSwiper={swiper => { swiperRef.current = swiper; setActiveIndex(swiper.realIndex); }}
            onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
            onAutoplayTimeLeft={(_swiper, _timeLeft, percentage) => setProgress(Math.max(0, Math.min(100, (1 - percentage) * 100)))}
          >
            {items.map((item, itemIndex) => (
              <SwiperSlide key={item._id} className="!flex h-full items-center justify-center">
                <div className="grid h-[78%] w-full min-h-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white grid-rows-[58%_42%] md:h-[520px] md:grid-cols-[1fr_1.35fr] md:grid-rows-1 lg:h-[560px]">

                  {/* Texte */}
                  <article className="relative order-2 flex min-h-0 flex-col justify-center bg-white p-4 text-left text-neutral-950 md:order-1 md:p-6 lg:p-7">
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                      <a {...destinationProps(item.titleDestination)} className="text-xl font-black leading-snug text-neutral-950 hover:text-emerald-700 sm:text-2xl lg:text-3xl">{item.title}</a>
                      <a {...destinationProps(item.textDestination)} className="mt-2.5 block whitespace-pre-line text-sm leading-6 text-neutral-600 hover:text-neutral-900">{item.description}</a>
                      {item.buttonDestination?.type !== 'none' && (
                        <a {...destinationProps(item.buttonDestination)} className="mt-4 inline-flex h-8 w-fit items-center gap-1.5 rounded-full border border-emerald-600/45 bg-emerald-100/75 px-3.5 text-[11px] font-black text-emerald-800 backdrop-blur transition hover:border-emerald-700/70 hover:bg-emerald-100">
                          {item.buttonLabel || 'En savoir plus'} <ArrowUpRight size={12} />
                        </a>
                      )}
                    </div>

                    {/* Dots — style mission tab nav (layoutId slide) */}
                    <div className="mt-3 flex shrink-0 items-center justify-center gap-1.5">
                      {items.map((entry, dotIndex) => (
                        <button
                          key={entry._id}
                          type="button"
                          onClick={() => selectSlide(dotIndex)}
                          aria-label={'Afficher ' + entry.title}
                          className={`relative rounded-full transition-all duration-300 ${
                            dotIndex === activeIndex
                              ? 'h-1.5 w-6 md:h-1 md:w-5'
                              : 'h-1.5 w-1.5 bg-neutral-300 hover:bg-neutral-400 md:h-1 md:w-1'
                          }`}
                        >
                          {dotIndex === activeIndex && (
                            <motion.span
                              layoutId="carousel-active-dot"
                              className="absolute inset-0 rounded-full bg-emerald-600"
                              transition={{ type: 'spring', bounce: 0.18, duration: 0.42 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </article>

                  {/* Média */}
                  <button type="button" onClick={() => setPreview(item)} className="relative order-1 h-full min-h-0 overflow-hidden bg-black text-left md:order-2" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>
                    {/* Barre de progression */}
                    <span className="absolute left-0 right-0 top-0 z-20 h-1.5 bg-black/20">
                      <span className="block h-full origin-left transition-[width] duration-100 ease-linear" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#0B8F3A 0%,#C8102E 50%,#F7C600 100%)' }} />
                    </span>
                    <Media item={item} active={itemIndex === activeIndex && !preview} playbackId={'slide-' + item._id} onPlaybackChange={handlePlaybackChange} />
                    <span className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/70 text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-black/85" aria-hidden="true">
                      <Expand size={19} />
                    </span>
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* ── Lightbox preview ── */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 p-4 backdrop-blur"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <div className="relative h-auto max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-black" onClick={e => e.stopPropagation()}>
              <button type="button" onClick={() => setPreview(null)} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white">
                <X size={18} />
              </button>
              <div className="aspect-video">
                <Media item={preview} active playbackId={'preview-' + preview._id} onPlaybackChange={handlePlaybackChange} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
