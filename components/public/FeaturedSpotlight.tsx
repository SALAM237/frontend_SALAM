'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, X, Megaphone } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import { useMemberFeatured, usePublicFeatured, type FeaturedDestination, type FeaturedItem } from '@/lib/api/featured';
import { useAuthStore } from '@/store/auth.store';

const SLIDE_DELAY = 12_000;

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
  const curtainRef = useRef<HTMLDivElement>(null);
  const firstSlideEvent = useRef(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
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
    if (manualPaused || mediaPlaying) autoplay.pause();
    else autoplay.resume();
  }, [manualPaused, mediaPlaying]);

  useEffect(() => {
    swiperRef.current?.update();
    if (activeIndex >= items.length) {
      swiperRef.current?.slideTo(0, 0);
      setActiveIndex(0);
    }
  }, [activeIndex, items.length]);

  const revealCurtain = useCallback(() => {
    const curtain = curtainRef.current;
    if (!curtain || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const horizontal = window.matchMedia('(min-width: 768px)').matches;
    gsap.killTweensOf(curtain);
    gsap.set(curtain, horizontal
      ? { scaleX: 0, scaleY: 1, transformOrigin: 'right center' }
      : { scaleY: 0, scaleX: 1, transformOrigin: 'center top' });
    const timeline = gsap.timeline();
    timeline.to(curtain, horizontal
      ? { scaleX: 1, duration: 0.32, ease: 'power3.inOut' }
      : { scaleY: 1, duration: 0.32, ease: 'power3.inOut' });
    timeline.set(curtain, horizontal ? { transformOrigin: 'left center' } : { transformOrigin: 'center bottom' });
    timeline.to(curtain, horizontal
      ? { scaleX: 0, duration: 0.42, ease: 'power3.inOut', delay: 0.06 }
      : { scaleY: 0, duration: 0.42, ease: 'power3.inOut', delay: 0.06 });
  }, []);

  const selectSlide = (index: number) => {
    if (index === activeIndex) return;
    swiperRef.current?.slideTo(index);
  };

  if (!items.length) {
    return <section className="bg-white py-12 sm:py-16" aria-labelledby="featured-heading"><div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="mb-7"><p className="text-xs font-black uppercase text-emerald-700">Selection SALAM</p><h2 id="featured-heading" className="mt-1 text-3xl font-black text-neutral-950 sm:text-4xl">A la une</h2></div><div className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-6 text-center">{isLoading ? <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" /> : <Megaphone size={30} className="text-emerald-700" />}<p className="mt-4 text-base font-black text-neutral-800">{isLoading ? 'Chargement des informations...' : 'Les prochaines informations a la une seront publiees ici.'}</p>{!isLoading && <p className="mt-1 max-w-lg text-sm leading-6 text-neutral-500">Actualites importantes, annonces et initiatives mises en avant par SALAM.</p>}</div></div></section>;
  }

  return (
    <section className="overflow-hidden bg-white py-10 sm:py-14" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-[1500px]">
        <div className="mx-auto mb-4 flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6">
          <div><p className="text-xs font-black uppercase text-emerald-700">Selection SALAM</p><h2 id="featured-heading" className="mt-1 text-3xl font-black text-neutral-950 sm:text-4xl">A la une</h2></div>
          <button type="button" onClick={() => setManualPaused(value => !value)} aria-label={manualPaused ? 'Relancer le carrousel' : 'Mettre le carrousel en pause'} className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-emerald-300 hover:text-emerald-700">{manualPaused ? <Play size={15} /> : <Pause size={15} />}</button>
        </div>

        <div className="mx-auto mb-3 h-1.5 max-w-7xl overflow-hidden bg-emerald-100 sm:rounded-full">
          <div className="h-full origin-left bg-[#0B8F3A] transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>

        <div className="relative h-[90svh] min-h-[600px] max-h-[920px] overflow-hidden">
          <Swiper
            modules={[Autoplay, A11y]}
            className="h-full !overflow-visible"
            slidesPerView={1.08}
            spaceBetween={12}
            centeredSlides={false}
            rewind={items.length > 1}
            speed={650}
            autoplay={items.length > 1 ? { delay: SLIDE_DELAY, disableOnInteraction: false, waitForTransition: true } : false}
            breakpoints={{
              768: { slidesPerView: 1.16, centeredSlides: true, spaceBetween: 20 },
              1024: { slidesPerView: 1.12, centeredSlides: true, spaceBetween: 24 },
            }}
            onSwiper={swiper => { swiperRef.current = swiper; setActiveIndex(swiper.realIndex); }}
            onSlideChange={swiper => {
              setActiveIndex(swiper.realIndex);
              if (firstSlideEvent.current) firstSlideEvent.current = false; else revealCurtain();
            }}
            onAutoplayTimeLeft={(_swiper, _timeLeft, percentage) => setProgress(Math.max(0, Math.min(100, (1 - percentage) * 100)))}
          >
            {items.map((item, itemIndex) => (
              <SwiperSlide key={item._id} className="h-full overflow-hidden rounded-lg border border-neutral-200 bg-[#0a3040] shadow-xl">
                <div className="grid h-full min-h-0 grid-rows-[55%_45%] md:grid-cols-[1fr_1.35fr] md:grid-rows-1">
                  <article className="relative order-2 flex min-h-0 flex-col bg-[#0a3040] p-5 text-white md:order-1 md:p-7 lg:p-9">
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                      <a {...destinationProps(item.titleDestination)} className="text-xl font-black leading-snug hover:text-emerald-200 sm:text-2xl lg:text-3xl">{item.title}</a>
                      <a {...destinationProps(item.textDestination)} className="mt-3 block whitespace-pre-line text-sm leading-6 text-white/75 hover:text-white">{item.description}</a>
                      {item.buttonDestination?.type !== 'none' && <a {...destinationProps(item.buttonDestination)} className="mt-4 inline-flex h-8 w-fit items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-200/15 px-3.5 text-[11px] font-black text-emerald-50 backdrop-blur transition hover:border-emerald-200 hover:bg-emerald-200/25">{item.buttonLabel || 'En savoir plus'} <ArrowUpRight size={12} /></a>}
                    </div>
                    <div className="mt-4 flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => swiperRef.current?.slidePrev()} aria-label="Element precedent" className="grid h-7 w-7 place-items-center rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white"><ChevronLeft size={13} /></button>
                      <div className="flex flex-1 items-center justify-center gap-2">
                        {items.map((entry, dotIndex) => <button key={entry._id} type="button" onClick={() => selectSlide(dotIndex)} aria-label={'Afficher ' + entry.title} className={'h-1.5 rounded-full transition-all ' + (dotIndex === activeIndex ? 'w-7 bg-emerald-300' : 'w-1.5 bg-white/35')} />)}
                      </div>
                      <button type="button" onClick={() => swiperRef.current?.slideNext()} aria-label="Element suivant" className="grid h-7 w-7 place-items-center rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white"><ChevronRight size={13} /></button>
                    </div>
                  </article>

                  <button type="button" onClick={() => setPreview(item)} className="relative order-1 h-full min-h-0 overflow-hidden bg-black text-left md:order-2">
                    <Media item={item} active={itemIndex === activeIndex && !preview} playbackId={'slide-' + item._id} onPlaybackChange={handlePlaybackChange} />
                    <span className="absolute bottom-4 left-4 rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-black uppercase text-white backdrop-blur">Agrandir</span>
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div ref={curtainRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 origin-right scale-x-0 bg-[#0B8F3A]" />
        </div>
      </div>

      <AnimatePresence>
        {preview && <motion.div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreview(null)}><div className="relative h-auto max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-lg bg-black" onClick={event => event.stopPropagation()}><button type="button" onClick={() => setPreview(null)} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white"><X size={18} /></button><div className="aspect-video"><Media item={preview} active playbackId={'preview-' + preview._id} onPlaybackChange={handlePlaybackChange} /></div></div></motion.div>}
      </AnimatePresence>
    </section>
  );
}