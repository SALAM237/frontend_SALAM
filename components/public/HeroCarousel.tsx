'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Users, CalendarDays, Trophy, CheckCircle2,
  Share2, Globe, X as XIcon, Video,
} from 'lucide-react';
import { SalamLogo } from '@/components/brand/SalamLogo';
import { demoActivities } from '@/data/demo/demo-activities';

/* ─────────────────────────────────────────
   Slide definitions
   ───────────────────────────────────────── */
type SlidePanel = 'stats' | 'activities' | 'join';

interface Slide {
  id:       number;
  eyebrow:  string;
  heading1: string;
  heading2: string;
  body:     string;
  glow:     string;   /* hex color for the radial glow */
  stroke:   string;   /* -webkit-text-stroke color */
  panel:    SlidePanel;
  cta1:     { label: string; href: string };
  cta2:     { label: string; href: string };
}

const SLIDES: Slide[] = [
  {
    id:       1,
    eyebrow:  'Association officielle',
    heading1: 'RÉSEAU',
    heading2: 'SOLIDAIRE',
    body:     'Unir, accompagner et faire grandir la communauté camerounaise et marocaine en France.',
    glow:     '#0B8F3A',
    stroke:   '#0B8F3A',
    panel:    'stats',
    cta1:     { label: 'DEVENIR MEMBRE',  href: '/adhesion' },
    cta2:     { label: 'NOS ACTIVITÉS',   href: '/activites' },
  },
  {
    id:       2,
    eyebrow:  'Programme 2026',
    heading1: 'NOS',
    heading2: 'ACTIVITÉS',
    body:     'Sport, culture, éducation et bénévolat — des événements pour tous tout au long de l\'année.',
    glow:     '#C8102E',
    stroke:   '#C8102E',
    panel:    'activities',
    cta1:     { label: 'VOIR LE PROGRAMME', href: '/activites' },
    cta2:     { label: 'LA GALERIE',        href: '/galerie' },
  },
  {
    id:       3,
    eyebrow:  'Rejoignez-nous',
    heading1: 'FAMILLE',
    heading2: 'SALAM',
    body:     '128 membres actifs vous attendent. Bénéficiez du réseau, de l\'entraide et de tous nos services.',
    glow:     '#F7C600',
    stroke:   '#d4a200',
    panel:    'join',
    cta1:     { label: 'ADHÉRER MAINTENANT', href: '/adhesion' },
    cta2:     { label: 'EN SAVOIR PLUS',     href: '/a-propos' },
  },
];

const INTERVAL = 7000; /* ms auto-advance */

const SOCIALS = [
  { Icon: Share2, label: 'Facebook' },
  { Icon: Globe,  label: 'Instagram' },
  { Icon: XIcon,  label: 'Twitter/X' },
  { Icon: Video,  label: 'YouTube' },
];

/* ─────────────────────────────────────────
   Sub-panels
   ───────────────────────────────────────── */
function PanelStats() {
  return (
    <div className="grid grid-cols-3 divide-x divide-white/10">
      {[
        { value: '128+', label: 'MEMBRES', icon: Users },
        { value: '24',   label: 'ACTIVITÉS', icon: CalendarDays },
        { value: '5 ANS', label: 'D\'HISTOIRE', icon: Trophy },
      ].map(({ value, label, icon: Icon }) => (
        <div key={label} className="px-4 py-4 text-center sm:px-6 sm:py-5">
          <Icon className="mx-auto mb-1.5 h-4 w-4 text-white/40" />
          <p className="font-black text-white leading-none text-xl sm:text-3xl">{value}</p>
          <p className="mt-1 text-[9px] sm:text-[11px] tracking-[.18em] text-white/50">{label}</p>
        </div>
      ))}
    </div>
  );
}

function PanelActivities() {
  const items = demoActivities.filter(a => a.status === 'published').slice(0, 3);
  return (
    <ul className="divide-y divide-white/5">
      {items.map(a => {
        const d = new Date(a.date);
        return (
          <li key={a.id} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
            <div className="shrink-0 text-center">
              <p className="font-black text-white leading-none text-sm sm:text-base">
                {d.toLocaleDateString('fr-FR', { day: '2-digit' })}
              </p>
              <p className="text-[9px] tracking-widest text-white/45 uppercase">
                {d.toLocaleDateString('fr-FR', { month: 'short' })}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs sm:text-sm font-semibold text-white">{a.title}</p>
              <p className="text-[10px] sm:text-xs text-white/50">{a.location}</p>
            </div>
            <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/60">
              {a.participants} pl.
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function PanelJoin() {
  const perks = [
    'Accès au portail adhérent',
    'Messagerie interne',
    'Tarifs préférentiels sur les activités',
    'Réseau professionnel exclusif',
  ];
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-4 sm:px-6 sm:py-5">
      {perks.map(p => (
        <div key={p} className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-salam-yellow" />
          <span className="text-[11px] sm:text-xs leading-tight text-white/75">{p}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   HeroCarousel
   ───────────────────────────────────────── */
export function HeroCarousel() {
  const [current, setCurrent]   = useState(0);
  const [paused,  setPaused]    = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const progRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const slide = SLIDES[current];

  const go = useCallback((idx: number) => {
    setCurrent(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  /* Auto-advance */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  /* Progress bar */
  useEffect(() => {
    setProgress(0);
    if (paused) return;
    const step = 100 / (INTERVAL / 80);
    progRef.current = setInterval(() => setProgress(p => Math.min(p + step, 100)), 80);
    return () => { if (progRef.current) clearInterval(progRef.current); };
  }, [current, paused]);

  /* Keyboard nav */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [prev, next]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '100dvh', minHeight: '580px', background: '#070d09' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Carrousel SALAM"
    >
      {/* ── Animated background glow ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${slide.id}`}
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {/* Primary color radial glow — changes per slide */}
          <div
            className="absolute rounded-full"
            style={{
              width: 'clamp(400px,65vw,900px)',
              height: 'clamp(400px,65vw,900px)',
              background: slide.glow,
              opacity: 0.12,
              filter: 'blur(100px)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-55%)',
            }}
          />
          {/* Secondary soft glow bottom */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: 'clamp(300px,50vw,700px)',
              height: '300px',
              background: slide.glow,
              opacity: 0.06,
              filter: 'blur(60px)',
            }}
          />
          {/* Dot grid overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Bottom dark fade */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(7,13,9,0.3) 0%, transparent 30%, transparent 55%, rgba(7,13,9,0.95) 100%)' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Social icons — right side (CVO style) ── */}
      <div className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:right-5 md:flex">
        {SOCIALS.map(({ Icon, label }) => (
          <a
            key={label}
            href="#"
            aria-label={label}
            className="grid size-8 place-items-center rounded-full border border-white/20 bg-black/20 text-white/60 backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10 hover:text-white"
          >
            <Icon className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>

      {/* ─────── SLIDE CONTENT ─────── */}
      <div className="relative z-10 flex h-full flex-col">

        {/* ── Top: Logo ── */}
        <div className="flex justify-center px-4 pt-8 sm:pt-10">
          <motion.div
            key={`logo-${slide.id}`}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <SalamLogo
              size="lg"
              variant="white"
              href="/"
              showText={false}
              className="drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </div>

        {/* ── Center: Main text ── */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide.id}`}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-3xl"
            >
              {/* Eyebrow */}
              <p className="mb-4 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.28em] text-white/60">
                <span className="h-px w-8 bg-current" />
                {slide.eyebrow}
                <span className="h-px w-8 bg-current" />
              </p>

              {/* Heading — CVO outline text style */}
              <h1
                className="select-none leading-[0.88]"
                style={{ fontWeight: 900 }}
              >
                <span
                  className="block text-transparent"
                  style={{
                    fontSize: 'clamp(3.5rem, 14vw, 11rem)',
                    WebkitTextStroke: '1.5px rgba(255,255,255,0.25)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {slide.heading1}
                </span>
                <span
                  className="block"
                  style={{
                    fontSize: 'clamp(3.5rem, 14vw, 11rem)',
                    letterSpacing: '-0.04em',
                    color: slide.glow,
                    textShadow: `0 0 60px ${slide.glow}80`,
                  }}
                >
                  {slide.heading2}
                </span>
              </h1>

              {/* Tagline */}
              <p
                className="mx-auto mt-5 text-white/65 sm:mt-6"
                style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.15rem)', maxWidth: '520px', lineHeight: 1.6 }}
              >
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom: Glass info panel ── */}
        <div className="relative z-10 px-3 pb-[72px] sm:px-6 sm:pb-[84px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`panel-${slide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl sm:rounded-2xl"
              style={{
                maxWidth: '680px',
                background: 'rgba(7,13,9,0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5 sm:px-6">
                <span
                  className="text-[10px] font-bold uppercase tracking-[.2em]"
                  style={{ color: slide.glow }}
                >
                  {slide.panel === 'stats'      ? 'SALAM EN CHIFFRES'
                  : slide.panel === 'activities' ? 'PROCHAINES DATES'
                  :                               'AVANTAGES ADHÉRENTS'
                  }
                </span>
                {/* Colored dot */}
                <span
                  className="size-2 rounded-full"
                  style={{ background: slide.glow, boxShadow: `0 0 8px ${slide.glow}` }}
                />
              </div>

              {/* Panel content */}
              {slide.panel === 'stats'      && <PanelStats />}
              {slide.panel === 'activities' && <PanelActivities />}
              {slide.panel === 'join'       && <PanelJoin />}

              {/* CTA row */}
              <div className="grid grid-cols-2 gap-2 border-t border-white/8 p-3 sm:p-4">
                <Link
                  href={slide.cta1.href}
                  className="flex items-center justify-center rounded-lg border-2 border-white bg-black/10 py-2.5 text-center text-[11px] font-bold tracking-[.1em] text-white backdrop-blur-sm transition-all sm:text-xs hover:border-transparent"
                  style={{
                    transition: 'background 0.25s, border-color 0.25s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = slide.glow;
                    (e.currentTarget as HTMLElement).style.borderColor = slide.glow;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = '';
                    (e.currentTarget as HTMLElement).style.borderColor = 'white';
                  }}
                >
                  {slide.cta1.label}
                </Link>
                <Link
                  href={slide.cta2.href}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-black/10 py-2.5 text-center text-[11px] font-semibold tracking-[.06em] text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white sm:text-xs"
                >
                  {slide.cta2.label} <ArrowRight className="h-3 w-3 shrink-0" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─────── NAVIGATION ─────── */}

      {/* Arrow left */}
      <button
        onClick={prev}
        aria-label="Slide précédent"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/10 sm:left-5 sm:size-12"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Arrow right */}
      <button
        onClick={next}
        aria-label="Slide suivant"
        className="absolute right-10 top-1/2 z-20 -translate-y-1/2 grid size-10 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/10 sm:right-14 md:right-16 sm:size-12"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Bottom: Dots + Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-5 sm:px-6 sm:pb-7">
        {/* Dots */}
        <div className="mb-3 flex items-center justify-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`Aller au slide ${i + 1}`}
              className="relative h-[3px] rounded-full transition-all duration-300"
              style={{
                width: i === current ? '32px' : '16px',
                background: i === current ? slide.glow : 'rgba(255,255,255,0.25)',
              }}
            >
              {i === current && (
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: slide.glow }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Flag stripe */}
        <div
          className="mx-auto h-[3px] rounded-full"
          style={{
            maxWidth: '680px',
            background: 'linear-gradient(90deg, #0B8F3A 33.33%, #C8102E 33.33%, #C8102E 66.66%, #F7C600 66.66%)',
            opacity: 0.5,
          }}
        />
      </div>
    </section>
  );
}
