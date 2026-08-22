'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageIcon,
  Megaphone,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import {
  useMemberFeatured,
  usePublicFeatured,
  type FeaturedDestination,
  type FeaturedItem,
} from '@/lib/api/featured';
import { useAuthStore } from '@/store/auth.store';

const SLIDE_DELAY = 12_000;
const DESKTOP_VIDEO_DELAY = 2_000;
const YOUTUBE_ORIGINS = new Set(['https://www.youtube.com', 'https://www.youtube-nocookie.com']);

function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const allowedHost = hostname === 'youtu.be'
      || hostname === 'youtube.com'
      || hostname === 'www.youtube.com'
      || hostname === 'm.youtube.com'
      || hostname === 'youtube-nocookie.com'
      || hostname === 'www.youtube-nocookie.com';
    if (!allowedHost) return '';
    const id = hostname === 'youtu.be'
      ? parsed.pathname.slice(1).split('/')[0]
      : parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

function validMediaSource(value?: string) {
  const source = value?.trim() ?? '';
  if (source.startsWith('/') && !source.startsWith('//')) return source;
  try {
    const parsed = new URL(source);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function destinationProps(destination?: FeaturedDestination): AnchorHTMLAttributes<HTMLAnchorElement> | null {
  const href = destination?.href?.trim() ?? '';
  if (!destination || destination.type === 'none' || !href) return null;

  if (destination.type === 'internal') {
    if (!href.startsWith('/') || href.startsWith('//')) return null;
    return { href };
  }

  try {
    const parsed = new URL(href);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return { href: parsed.toString(), target: '_blank', rel: 'noopener noreferrer' };
  } catch {
    return null;
  }
}

function DestinationContent({
  destination,
  className,
  children,
}: {
  destination?: FeaturedDestination;
  className: string;
  children: ReactNode;
}) {
  const props = destinationProps(destination);
  return props
    ? <a {...props} className={className}>{children}</a>
    : <span className={className}>{children}</span>;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

type MediaProps = {
  item: FeaturedItem;
  active: boolean;
  playbackId: string;
  onPlaybackChange: (id: string, playing: boolean) => void;
};

/**
 * Media historique du carousel mobile. Il reste volontairement séparé afin
 * de préserver le comportement validé sur téléphone pendant le test desktop.
 */
function LegacyMedia({ item, active, playbackId, onPlaybackChange }: MediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (active) return;
    videoRef.current?.pause();
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
      'https://www.youtube-nocookie.com',
    );
    onPlaybackChange(playbackId, false);
  }, [active, onPlaybackChange, playbackId]);

  useEffect(() => {
    const receiveYoutubeState = (event: MessageEvent) => {
      if (!YOUTUBE_ORIGINS.has(event.origin) || !iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
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

  const source = validMediaSource(item.mediaUrls[0]);
  if (!source) return <MediaUnavailable />;
  if (item.mediaType === 'image') {
    return <img src={source} alt={item.title} loading="lazy" className="h-full w-full object-cover" />;
  }

  const youtube = item.videoProvider === 'youtube' ? youtubeId(source) : '';
  if (youtube) {
    return (
      <iframe
        ref={iframeRef}
        data-exclusive-media="youtube"
        src={`https://www.youtube-nocookie.com/embed/${youtube}?enablejsapi=1&playsinline=1&autoplay=${item.autoplay && active ? '1' : '0'}&mute=1`}
        onLoad={event => event.currentTarget.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), 'https://www.youtube-nocookie.com')}
        title={item.title}
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={source}
      controls
      preload="metadata"
      autoPlay={item.autoplay && active}
      muted={item.autoplay}
      playsInline
      onPlay={() => onPlaybackChange(playbackId, true)}
      onPause={() => onPlaybackChange(playbackId, false)}
      onEnded={() => onPlaybackChange(playbackId, false)}
      className="h-full w-full object-cover"
    />
  );
}

function MediaUnavailable() {
  return (
    <div className="grid h-full w-full place-items-center bg-neutral-950 px-6 text-center text-sm font-bold text-white/65">
      Media indisponible. Reimportez le fichier depuis l editeur.
    </div>
  );
}

function CinematicMedia({
  item,
  active,
  playbackId,
  onPlaybackChange,
  onExpand,
}: MediaProps & { onExpand: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeSinceRef = useRef(0);
  const youtubeAutoplayTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const source = validMediaSource(item.mediaUrls[0]);
  const youtube = item.mediaType === 'video' && item.videoProvider === 'youtube' ? youtubeId(source) : '';

  const updatePlaying = useCallback((value: boolean) => {
    setPlaying(value);
    onPlaybackChange(playbackId, value);
  }, [onPlaybackChange, playbackId]);

  const sendYoutubeCommand = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      'https://www.youtube-nocookie.com',
    );
  }, []);

  useEffect(() => {
    if (active) {
      activeSinceRef.current = Date.now();
      return;
    }
    if (youtubeAutoplayTimerRef.current !== null) {
      window.clearTimeout(youtubeAutoplayTimerRef.current);
      youtubeAutoplayTimerRef.current = null;
    }
    videoRef.current?.pause();
    sendYoutubeCommand('pauseVideo');
    const animationFrame = window.requestAnimationFrame(() => updatePlaying(false));
    return () => window.cancelAnimationFrame(animationFrame);
  }, [active, sendYoutubeCommand, updatePlaying]);

  useEffect(() => {
    const receiveYoutubeState = (event: MessageEvent) => {
      if (!YOUTUBE_ORIGINS.has(event.origin) || !iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      let payload: unknown = event.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { return; }
      }
      if (!payload || typeof payload !== 'object') return;
      const data = payload as { event?: string; info?: number };
      if (data.event !== 'onStateChange') return;
      if (data.info === 1) updatePlaying(true);
      if (data.info === 0 || data.info === 2 || data.info === 5) updatePlaying(false);
    };
    window.addEventListener('message', receiveYoutubeState);
    return () => window.removeEventListener('message', receiveYoutubeState);
  }, [updatePlaying]);

  useEffect(() => {
    if (!active || item.mediaType !== 'video' || !source || youtube) return;

    const elapsedInActivePosition = Math.max(0, Date.now() - activeSinceRef.current);
    const remainingDelay = Math.max(0, DESKTOP_VIDEO_DELAY - elapsedInActivePosition);

    const timer = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = true;
      setMuted(true);
      void video.play().catch(() => updatePlaying(false));
    }, remainingDelay);

    return () => window.clearTimeout(timer);
  }, [active, item.mediaType, source, updatePlaying, youtube]);

  useEffect(() => () => {
    if (youtubeAutoplayTimerRef.current !== null) {
      window.clearTimeout(youtubeAutoplayTimerRef.current);
    }
    onPlaybackChange(playbackId, false);
  }, [onPlaybackChange, playbackId]);

  const togglePlay = () => {
    if (youtube) {
      sendYoutubeCommand(playing ? 'pauseVideo' : 'playVideo');
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => updatePlaying(false));
    else video.pause();
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (youtube) {
      sendYoutubeCommand(nextMuted ? 'mute' : 'unMute');
      return;
    }
    if (videoRef.current) videoRef.current.muted = nextMuted;
  };

  if (!source) return <MediaUnavailable />;

  return (
    <div className="featured-media-root relative h-full w-full overflow-hidden bg-[#020806]">
      {item.mediaType === 'image' ? (
        <img
          src={source}
          alt={active ? item.title : ''}
          loading={active ? 'eager' : 'lazy'}
          className="featured-media-visual h-full w-full object-cover"
        />
      ) : youtube && !active ? (
        <img
          src={`https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="featured-media-visual h-full w-full object-cover"
        />
      ) : youtube ? (
        <iframe
          ref={iframeRef}
          data-exclusive-media="youtube"
          src={`https://www.youtube-nocookie.com/embed/${youtube}?enablejsapi=1&playsinline=1&autoplay=0&mute=1&controls=0&rel=0`}
          onLoad={event => {
            event.currentTarget.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: playbackId }), 'https://www.youtube-nocookie.com');
            if (youtubeAutoplayTimerRef.current !== null) {
              window.clearTimeout(youtubeAutoplayTimerRef.current);
            }
            const elapsedInActivePosition = Math.max(0, Date.now() - activeSinceRef.current);
            const remainingDelay = Math.max(0, DESKTOP_VIDEO_DELAY - elapsedInActivePosition);
            youtubeAutoplayTimerRef.current = window.setTimeout(() => {
              sendYoutubeCommand('mute');
              sendYoutubeCommand('playVideo');
              setMuted(true);
              youtubeAutoplayTimerRef.current = null;
            }, remainingDelay);
          }}
          title={item.title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="featured-media-visual h-full w-full border-0"
        />
      ) : (
        <video
          ref={videoRef}
          src={source}
          preload="metadata"
          muted={muted}
          playsInline
          onPlay={() => updatePlaying(true)}
          onPause={() => updatePlaying(false)}
          onEnded={() => updatePlaying(false)}
          className="featured-media-visual h-full w-full object-cover"
        />
      )}

      {active && item.mediaType === 'video' && (
        <div className="featured-media-controls absolute bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 p-1.5 text-white shadow-2xl backdrop-blur-xl lg:bottom-5 lg:right-5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Mettre la video en pause' : 'Lire la video'}
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Activer le son' : 'Couper le son'}
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button
            type="button"
            onClick={onExpand}
            aria-label="Agrandir la video"
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Expand size={16} />
          </button>
        </div>
      )}

      {active && item.mediaType === 'image' && (
        <button
          type="button"
          onClick={onExpand}
          aria-label="Agrandir l image"
          className="featured-media-controls absolute right-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/55 text-white shadow-xl backdrop-blur-xl transition hover:scale-105 hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:right-5 lg:top-5"
        >
          <Expand size={17} />
        </button>
      )}
    </div>
  );
}

type LegacyCarouselProps = {
  items: FeaturedItem[];
  activeIndex: number;
  progress: number;
  preview: FeaturedItem | null;
  swiperRef: React.MutableRefObject<SwiperInstance | null>;
  onActiveIndexChange: (index: number) => void;
  onProgressChange: (progress: number) => void;
  onPreview: (item: FeaturedItem) => void;
  onPlaybackChange: (id: string, playing: boolean) => void;
  onSelect: (index: number) => void;
};

function LegacyMobileCarousel({
  items,
  activeIndex,
  progress,
  preview,
  swiperRef,
  onActiveIndexChange,
  onProgressChange,
  onPreview,
  onPlaybackChange,
  onSelect,
}: LegacyCarouselProps) {
  return (
    <div className="featured-legacy-mobile relative h-[85vh] min-h-[520px] max-h-[780px] overflow-hidden md:hidden">
      <Swiper
        modules={[Autoplay, A11y]}
        className="h-full"
        slidesPerView={1.12}
        centeredSlides={false}
        spaceBetween={2}
        loop={items.length > 1}
        speed={500}
        autoplay={items.length > 1 ? { delay: SLIDE_DELAY, disableOnInteraction: false, waitForTransition: true } : false}
        onSwiper={swiper => {
          swiperRef.current = swiper;
          onActiveIndexChange(swiper.realIndex);
        }}
        onSlideChange={swiper => {
          onActiveIndexChange(swiper.realIndex);
          onProgressChange(0);
        }}
        onAutoplayTimeLeft={(_swiper, _timeLeft, percentage) =>
          onProgressChange(Math.max(0, Math.min(100, (1 - percentage) * 100)))}
      >
        {items.map((item, itemIndex) => (
          <SwiperSlide key={item._id} className="!flex h-full items-start justify-end pt-7">
            <div
              className="grid h-[88%] w-[93%] min-h-0 grid-rows-[42%_58%] overflow-hidden rounded-2xl border-0 bg-transparent"
              style={{ boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px' }}
            >
              <article
                className="isolate relative order-2 flex min-h-0 flex-col justify-center rounded-b-2xl bg-white p-4 text-left text-neutral-950"
                style={{ boxShadow: '0 -10px 32px rgba(0,0,0,0.10), 0 -2px 8px rgba(0,0,0,0.06)' }}
              >
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <DestinationContent destination={item.titleDestination} className="text-xl font-black leading-snug text-neutral-950 hover:text-emerald-700 sm:text-2xl">
                    {item.title}
                  </DestinationContent>
                  <DestinationContent destination={item.textDestination} className="mt-2.5 block whitespace-pre-line break-words text-sm leading-6 text-neutral-600 hover:text-neutral-900">
                    {item.description}
                  </DestinationContent>
                </div>
                {destinationProps(item.buttonDestination) && (
                  <DestinationContent
                    destination={item.buttonDestination}
                    className="absolute bottom-9 left-4 z-10 inline-flex h-8 w-fit items-center gap-1.5 rounded-full border border-emerald-600/45 bg-emerald-100/75 px-3.5 text-[11px] font-black text-emerald-800 backdrop-blur transition hover:border-emerald-700/70 hover:bg-emerald-100"
                  >
                    {item.buttonLabel || 'En savoir plus'} <ArrowUpRight size={12} />
                  </DestinationContent>
                )}
                <CarouselDots items={items} activeIndex={activeIndex} onSelect={onSelect} tone="light" />
              </article>

              <button
                type="button"
                onClick={() => onPreview(item)}
                className="relative order-1 h-full min-h-0 overflow-hidden rounded-t-2xl bg-black text-left"
              >
                <ProgressBar progress={progress} />
                <LegacyMedia
                  item={item}
                  active={itemIndex === activeIndex && !preview}
                  playbackId={`mobile-slide-${item._id}`}
                  onPlaybackChange={onPlaybackChange}
                />
                <span className="absolute right-3 top-3 z-30 grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-black/70 text-white shadow-lg backdrop-blur" aria-hidden="true">
                  <Expand size={13} />
                </span>
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function relativeOffset(index: number, activeIndex: number, length: number) {
  const forward = (index - activeIndex + length) % length;
  if (forward === 0) return 0;
  const backward = forward - length;
  return Math.abs(backward) < forward ? backward : forward;
}

function rightCardPosition(offset: number) {
  const terms = ['var(--featured-peek)', 'var(--featured-active-width)'];
  for (let index = 0; index < offset + 1; index += 1) terms.push('var(--featured-gap)');
  for (let index = 1; index < offset; index += 1) terms.push('var(--featured-thumb-width)');
  return `calc(${terms.join(' + ')})`;
}

function DesktopAccordionCarousel({
  items,
  activeIndex,
  progress,
  preview,
  onSelect,
  onPreview,
  onPlaybackChange,
}: {
  items: FeaturedItem[];
  activeIndex: number;
  progress: number;
  preview: FeaturedItem | null;
  onSelect: (index: number) => void;
  onPreview: (item: FeaturedItem) => void;
  onPlaybackChange: (id: string, playing: boolean) => void;
}) {
  const reducedMotion = useReducedMotion();
  const singleton = items.length === 1;

  return (
    <div
      className="featured-accordion-track relative hidden w-full overflow-hidden md:block"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Informations à la une"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onSelect((activeIndex - 1 + items.length) % items.length);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          onSelect((activeIndex + 1) % items.length);
        }
      }}
    >
      <span className="sr-only" aria-live="polite">
        Élément {activeIndex + 1} sur {items.length} : {items[activeIndex]?.title}
      </span>

      {items.map((item, itemIndex) => {
        const offset = relativeOffset(itemIndex, activeIndex, items.length);
        const active = offset === 0;
        const visible = singleton || offset >= -1 && offset <= 4;
        const ctaProps = destinationProps(item.buttonDestination)
          ?? destinationProps(item.titleDestination)
          ?? destinationProps(item.textDestination);
        const left = singleton
          ? '0px'
          : offset < -1
            ? 'calc(0px - var(--featured-thumb-width) - var(--featured-gap))'
            : offset === -1
              ? 'calc(var(--featured-peek) - var(--featured-thumb-width))'
              : offset === 0
                ? 'calc(var(--featured-peek) + var(--featured-gap))'
                : rightCardPosition(offset);

        return (
          <article
            key={item._id}
            aria-hidden={!visible}
            className={`featured-accordion-card group absolute overflow-hidden border border-white/10 bg-[#06130d] shadow-2xl ${active ? 'is-active' : ''}`}
            style={{
              left,
              top: '0%',
              width: singleton ? '100%' : active ? 'var(--featured-active-width)' : 'var(--featured-thumb-width)',
              height: '95%',
              opacity: visible ? 1 : 0,
              zIndex: active ? 30 : offset === -1 ? 8 : Math.max(4, 20 - offset),
              pointerEvents: visible ? 'auto' : 'none',
              transitionDuration: reducedMotion ? '1ms' : '680ms',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <CinematicMedia
              item={item}
              active={active && !preview}
              playbackId={`desktop-slide-${item._id}`}
              onPlaybackChange={onPlaybackChange}
              onExpand={() => onPreview(item)}
            />

            <span className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

            {!active && (
              <>
                <button
                  type="button"
                  onClick={() => onSelect(itemIndex)}
                  aria-label={`Afficher ${item.title}`}
                  className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
                />
                <div className="pointer-events-none absolute left-3 top-3 z-30 flex max-w-[90%] flex-wrap gap-1.5">
                  <span className="rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-lg">
                    {item.mediaType === 'video' ? 'Vidéo' : 'À la une'}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/12 px-2 py-1 text-[9px] font-black tabular-nums text-white backdrop-blur-lg">
                    {String(itemIndex + 1).padStart(2, '0')}
                  </span>
                </div>
              </>
            )}

            {active && (
              <>
                <ProgressBar progress={progress} />
                <span className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(68deg,rgba(0,8,5,0.96)_0%,rgba(0,10,6,0.84)_32%,rgba(0,8,5,0.28)_61%,transparent_82%)]" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={item._id}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -22 }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.42, delay: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="featured-active-content absolute inset-y-0 left-0 z-30 flex w-[88%] max-w-[720px] flex-col justify-end px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5 lg:w-[72%] lg:px-7 lg:pb-7 lg:pt-6 xl:w-[68%] xl:px-9 xl:pb-9"
                  >
                    <div className="mb-auto flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-500/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-emerald-100 backdrop-blur-xl sm:text-[9px]">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                        Sélection SALAM
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/80 backdrop-blur-xl sm:text-[9px]">
                        {item.mediaType === 'video' ? <Play size={9} fill="currentColor" /> : <ImageIcon size={9} />}
                        {item.mediaType === 'video' ? 'Vidéo' : 'Image'}
                      </span>
                    </div>

                    <DestinationContent
                      destination={item.titleDestination}
                      className="featured-active-title block max-w-2xl text-balance font-black leading-[0.98] tracking-[-0.045em] text-white drop-shadow-2xl transition hover:text-emerald-100"
                    >
                      {item.title}
                    </DestinationContent>
                    <DestinationContent
                      destination={item.textDestination}
                      className="featured-active-description mt-3 block max-w-xl whitespace-pre-line break-words font-medium text-white/76 drop-shadow lg:mt-4"
                    >
                      {item.description}
                    </DestinationContent>

                    <div className="mt-4 flex max-w-full flex-wrap items-center gap-2.5 lg:mt-5">
                      {ctaProps ? (
                        <a
                          {...ctaProps}
                          className="featured-active-cta inline-flex w-fit items-center gap-1 rounded-full bg-white font-black text-[#07150d] shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          {item.buttonLabel || 'En savoir plus'} <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPreview(item)}
                          className="featured-active-cta inline-flex w-fit items-center gap-1 rounded-full bg-white font-black text-[#07150d] shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          {item.buttonLabel || 'En savoir plus'} <ArrowUpRight size={12} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="featured-active-dots absolute left-1/2 z-40 -translate-x-1/2">
                  <CarouselDots items={items} activeIndex={activeIndex} onSelect={onSelect} tone="dark" />
                </div>
              </>
            )}
          </article>
        );
      })}

      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-40 w-[var(--featured-peek)] bg-gradient-to-r from-[#03110a]/55 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-40 w-10 bg-gradient-to-l from-[#03110a]/70 to-transparent" />
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <span className="absolute inset-x-0 top-0 z-50 h-1 bg-black/25">
      <span
        className="block h-full origin-left"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg,#0B8F3A 0%,#F7C600 52%,#C8102E 100%)',
          boxShadow: '0 0 16px rgba(247,198,0,0.5)',
          transition: 'width 100ms linear',
        }}
      />
    </span>
  );
}

function CarouselDots({
  items,
  activeIndex,
  onSelect,
  tone,
}: {
  items: FeaturedItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  tone: 'light' | 'dark';
}) {
  return (
    <div className={`${tone === 'light' ? 'mt-3 justify-center' : 'justify-start'} flex shrink-0 items-center gap-1.5`}>
      {items.map((entry, dotIndex) => (
        <button
          key={entry._id}
          type="button"
          onClick={() => onSelect(dotIndex)}
          aria-label={`Afficher ${entry.title}`}
          aria-current={dotIndex === activeIndex ? 'true' : undefined}
          style={{ height: '4px', minHeight: '0' }}
          className={`relative overflow-hidden rounded-full p-0 transition-all duration-300 ${
            dotIndex === activeIndex
              ? tone === 'light' ? 'w-5 bg-emerald-600' : 'w-7 bg-white'
              : tone === 'light' ? 'w-1 bg-neutral-300 hover:bg-neutral-400' : 'w-2 bg-white/30 hover:bg-white/65'
          }`}
        />
      ))}
    </div>
  );
}

export default function FeaturedSpotlight({ initialItems = [] }: { initialItems?: FeaturedItem[] }) {
  const token = useAuthStore(state => state.accessToken);
  const { data, isLoading } = usePublicFeatured();
  const { data: memberData } = useMemberFeatured();
  const items = (token ? memberData?.data : undefined) ?? data?.data ?? initialItems;
  const swiperRef = useRef<SwiperInstance | null>(null);
  const autoplayElapsed = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [lastNav, setLastNav] = useState<'prev' | 'next' | null>(null);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<FeaturedItem | null>(null);
  const [playingMediaIds, setPlayingMediaIds] = useState<Set<string>>(() => new Set());
  const isDesktopOrTablet = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (!preview) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreview(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [preview]);

  const handlePlaybackChange = useCallback((id: string, playing: boolean) => {
    setPlayingMediaIds(current => {
      const next = new Set(current);
      if (playing) next.add(id);
      else next.delete(id);
      if (next.size === current.size && [...next].every(value => current.has(value))) return current;
      return next;
    });
  }, []);
  const mediaPlaying = playingMediaIds.size > 0;
  const carouselPaused = manualPaused || Boolean(preview) || (!isDesktopOrTablet && mediaPlaying);

  const moveDesktop = useCallback((direction: 'prev' | 'next') => {
    if (items.length < 2) return;
    autoplayElapsed.current = 0;
    setProgress(0);
    setLastNav(direction);
    setActiveIndex(current => direction === 'next'
      ? (current + 1) % items.length
      : (current - 1 + items.length) % items.length);
  }, [items.length]);

  const selectSlide = useCallback((index: number) => {
    if (index === activeIndex || index < 0 || index >= items.length) return;
    const forward = (index - activeIndex + items.length) % items.length;
    const backward = (activeIndex - index + items.length) % items.length;
    setLastNav(forward <= backward ? 'next' : 'prev');
    if (isDesktopOrTablet) {
      autoplayElapsed.current = 0;
      setProgress(0);
      setActiveIndex(index);
    }
    else swiperRef.current?.slideToLoop(index);
  }, [activeIndex, isDesktopOrTablet, items.length]);

  const navigate = (direction: 'prev' | 'next') => {
    if (isDesktopOrTablet) moveDesktop(direction);
    else if (direction === 'next') swiperRef.current?.slideNext();
    else swiperRef.current?.slidePrev();
    setLastNav(direction);
  };

  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay) return;
    if (isDesktopOrTablet || carouselPaused) autoplay.pause();
    else autoplay.resume();
  }, [carouselPaused, isDesktopOrTablet]);

  useEffect(() => {
    swiperRef.current?.update();
    if (!items.length || activeIndex < items.length) return;
    const animationFrame = window.requestAnimationFrame(() => {
      swiperRef.current?.slideTo(0, 0);
      autoplayElapsed.current = 0;
      setProgress(0);
      setActiveIndex(0);
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (!isDesktopOrTablet || items.length < 2) return;
    let animationFrame = 0;
    let previousTime = 0;
    let previousPaint = 0;

    const tick = (time: number) => {
      if (!previousTime) previousTime = time;
      const elapsed = Math.min(100, time - previousTime);
      previousTime = time;

      if (!carouselPaused) {
        autoplayElapsed.current += elapsed;
        if (time - previousPaint > 80) {
          setProgress(Math.min(100, autoplayElapsed.current / SLIDE_DELAY * 100));
          previousPaint = time;
        }
        if (autoplayElapsed.current >= SLIDE_DELAY) {
          autoplayElapsed.current = 0;
          setProgress(0);
          moveDesktop('next');
          return;
        }
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [carouselPaused, isDesktopOrTablet, items.length, moveDesktop]);

  const activeItem = useMemo(() => items[activeIndex] ?? items[0], [activeIndex, items]);

  if (!items.length) {
    return (
      <section className="featured-gradient relative w-full overflow-hidden py-12 sm:py-16" aria-labelledby="featured-heading">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.15] md:opacity-[0.20]"
          style={{
            backgroundImage: "url('/images/placeholders/ndop motif WBG.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'soft-light',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase text-emerald-500">Sélection SALAM</p>
            <h2 id="featured-heading" className="text-3xl font-black text-neutral-950 sm:text-4xl">À la une</h2>
          </div>
          <div className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white/90 px-6 text-center backdrop-blur-sm">
            {isLoading
              ? <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              : <Megaphone size={30} className="text-emerald-700" />}
            <p className="mt-4 text-base font-black text-neutral-800">
              {isLoading ? 'Chargement des informations...' : 'Les prochaines informations à la une seront publiées ici.'}
            </p>
            {!isLoading && <p className="mt-1 max-w-lg text-sm leading-6 text-neutral-500">Actualités importantes, annonces et initiatives mises en avant par SALAM.</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-spotlight-shell relative w-full overflow-hidden pb-7 pt-4 sm:pb-8 sm:pt-6 md:pb-0 md:pt-7 lg:pt-9" aria-labelledby="featured-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-soft-light md:opacity-[0.08]"
        style={{
          backgroundImage: "url('/images/placeholders/ndop motif WBG.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-36 top-12 hidden h-80 w-80 rounded-full bg-emerald-500/15 blur-[110px] md:block" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 bottom-0 hidden h-80 w-80 rounded-full bg-yellow-400/10 blur-[120px] md:block" />

      <div className="relative z-50 mb-1 flex w-full items-end justify-between gap-4 px-4 sm:px-6 md:mb-6 md:px-7 lg:mb-7 lg:px-10 xl:px-14">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 md:text-emerald-300/80 lg:text-xs">Sélection SALAM</p>
          <h2 id="featured-heading" className="text-3xl font-black tracking-[-0.04em] text-neutral-950 sm:text-4xl md:text-white lg:text-[44px]">À la une</h2>
        </div>

        <div className="flex items-center gap-1.5 rounded-full md:border md:border-white/10 md:bg-white/[0.06] md:p-1.5 md:shadow-xl md:backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate('prev')}
            disabled={items.length < 2}
            aria-label="Élément précédent"
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-35 md:h-9 md:w-9 md:border-0 ${
              lastNav === 'prev'
                ? 'border-transparent bg-neutral-700 text-white md:bg-white md:text-[#06130d]'
                : 'border-neutral-300 bg-white/70 text-neutral-500 hover:border-neutral-500 hover:bg-white hover:text-neutral-800 md:bg-transparent md:text-white/65 md:hover:bg-white/15 md:hover:text-white'
            }`}
          >
            <ChevronLeft size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setManualPaused(value => !value)}
            disabled={items.length < 2}
            aria-label={manualPaused ? 'Relancer le carrousel' : 'Mettre le carrousel en pause'}
            aria-pressed={manualPaused}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white/70 text-neutral-500 transition-all duration-200 hover:border-neutral-500 hover:bg-white hover:text-neutral-800 disabled:opacity-35 md:h-9 md:w-9 md:border-0 md:bg-transparent md:text-white/65 md:hover:bg-white/15 md:hover:text-white"
          >
            {manualPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={() => navigate('next')}
            disabled={items.length < 2}
            aria-label="Élément suivant"
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-35 md:h-9 md:w-9 md:border-0 ${
              lastNav === 'next'
                ? 'border-transparent bg-neutral-700 text-white md:bg-white md:text-[#06130d]'
                : 'border-neutral-300 bg-white/70 text-neutral-500 hover:border-neutral-500 hover:bg-white hover:text-neutral-800 md:bg-transparent md:text-white/65 md:hover:bg-white/15 md:hover:text-white'
            }`}
          >
            <ChevronRight size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/*
        Ancien carousel conservé pendant la phase de validation.
        Il reste volontairement actif uniquement sur mobile et ne sera retiré
        qu'après validation explicite du nouveau rendu desktop/tablette.
      */}
      {!isDesktopOrTablet && (
        <LegacyMobileCarousel
          items={items}
          activeIndex={activeIndex}
          progress={progress}
          preview={preview}
          swiperRef={swiperRef}
          onActiveIndexChange={setActiveIndex}
          onProgressChange={setProgress}
          onPreview={setPreview}
          onPlaybackChange={handlePlaybackChange}
          onSelect={selectSlide}
        />
      )}

      {isDesktopOrTablet && (
        <DesktopAccordionCarousel
          items={items}
          activeIndex={activeIndex}
          progress={progress}
          preview={preview}
          onSelect={selectSlide}
          onPreview={setPreview}
          onPlaybackChange={handlePlaybackChange}
        />
      )}

      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 z-[160] flex h-screen h-[100dvh] w-screen items-center justify-center bg-black backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Aperçu de ${preview.title}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-screen h-[100dvh] w-screen max-w-none overflow-hidden bg-black"
              onClick={event => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Fermer l aperçu"
                autoFocus
                className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-xl backdrop-blur transition hover:scale-105 hover:bg-black/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X size={18} />
              </button>
              <div className="featured-preview-fullscreen h-full w-full">
                <LegacyMedia item={preview} active playbackId={`preview-${preview._id}`} onPlaybackChange={handlePlaybackChange} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeItem && <span className="sr-only">Élément actif : {activeItem.title}</span>}
    </section>
  );
}
