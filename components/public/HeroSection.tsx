'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { getPostLoginRedirect } from '@/lib/auth/roles';
import { apiClient } from '@/lib/api/client';
import { formatInitials, formatShortName } from '@/lib/format-name';
import { DON_NAV_ITEM, PUBLIC_NAV_ITEMS } from '@/lib/navigation';

type IconProps = {
  className?: string;
};

function ArrowUpRightIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7H17V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.5 9H19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 5H17.5C18.6046 5 19.5 5.89543 19.5 7V18C19.5 19.1046 18.6046 20 17.5 20H6.5C5.39543 20 4.5 19.1046 4.5 18V7C4.5 5.89543 5.39543 5 6.5 5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M8 13H8.01M12 13H12.01M16 13H16.01M8 17H8.01M12 17H12.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function GraduationCapIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9L12 4L21 9L12 14L3 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 11.5V16C7 17.7 9.2 19 12 19C14.8 19 17 17.7 17 16V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartHandshakeIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20S4 15.2 4 8.8C4 6.2 6 4.5 8.3 4.5C9.7 4.5 11 5.2 12 6.3C13 5.2 14.3 4.5 15.7 4.5C18 4.5 20 6.2 20 8.8C20 15.2 12 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 13L10 11L12 13L14 11L16 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 19C16 16.8 14.2 15 12 15H8C5.8 15 4 16.8 4 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 12C12.2091 12 14 10.2091 14 8C14 5.79086 12.2091 4 10 4C7.79086 4 6 5.79086 6 8C6 10.2091 7.79086 12 10 12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M20 19C20 17.2 18.8 15.7 17.2 15.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 4.5C18.1 5.1 19 6.4 19 8C19 9.6 18.1 10.9 16.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SparklesIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 16L5.6 17.4L7 18L5.6 18.6L5 20L4.4 18.6L3 18L4.4 17.4L5 16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const navItems = PUBLIC_NAV_ITEMS;

export function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user, restoreAuth } = useAuthStore();
  const pathname = usePathname();

  // Restauration silencieuse de session depuis les cookies httpOnly
  useEffect(() => {
    if (pathname !== '/') return;
    if (user) return;
    const tryRestore = async () => {
      try {
        const refreshRes = await apiClient<{ accessToken: string }>(
          '/api/v1/auth/refresh', { method: 'POST' },
        );
        const token = refreshRes.data.accessToken;
        const meRes = await apiClient<AuthUser>('/api/v1/auth/me', { token });
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ accessToken: token }),
        });
        restoreAuth(meRes.data, token);
      } catch {
        // Non connecté — aucune action
      }
    };
    tryRestore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') return;
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;

      // Scroll-to-top button: show at 70% of scrollable height
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      setShowScrollTop(totalScrollable > 0 && y / totalScrollable >= 0.7);

      // Hide navbar entirely inside MissionsSection sticky zone
      const missionsEl = document.getElementById('missions-section');
      if (missionsEl) {
        const rect = missionsEl.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
          setNavVisible(false);
          lastY = y;
          return;
        }
      }

      setNavScrolled(y > 20);
      if (y > lastY && y > 60) {
        setNavVisible(false);
        setMenuOpen(false);
      } else {
        setNavVisible(true);
      }
      lastY = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  if (pathname !== '/') return null;

  return (
    <section className="relative h-screen min-h-svh overflow-hidden rounded-none bg-[#06130b] px-[clamp(1rem,3vw,3rem)] py-[clamp(0.8rem,2vw,1.5rem)] text-white lg:mx-3 lg:my-3 lg:h-[calc(100vh-1.5rem)] lg:min-h-[calc(100svh-1.5rem)] lg:rounded-[2.5rem]">

      {/* ── Video background ── */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/videos/hero-mobile.webm" type="video/webm" media="(max-width: 767px)" />
        <source src="/videos/hero-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/videos/hero-desktop.webm" type="video/webm" />
        <source src="/videos/hero-desktop.mp4" type="video/mp4" />
      </video>

      {/* ── Overlays ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-emerald-950/[0.78] via-emerald-950/[0.48] to-black/[0.18]" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/[0.62] via-black/[0.05] to-black/25" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_18%_24%,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_82%_30%,rgba(220,38,38,0.12),transparent_34%)]" />

      {/* ── Decorative bottom curves ── */}
      <div className="pointer-events-none absolute bottom-[-18rem] left-[-14rem] z-10 h-[30rem] w-[62rem] rotate-6 rounded-[100%] bg-emerald-700/20 blur-[1px]" />
      <div className="pointer-events-none absolute bottom-[-16rem] right-[-16rem] z-10 h-[27rem] w-[66rem] -rotate-6 rounded-[100%] bg-red-600/[0.16] blur-[1px]" />
      <div className="pointer-events-none absolute bottom-[-18rem] right-[-8rem] z-10 h-[24rem] w-[52rem] -rotate-3 rounded-[100%] bg-yellow-400/[0.18] blur-[1px]" />

      {/* ── Fixed nav wrapper (navbar + dropdown) ── */}
      <div
        className={[
          'fixed inset-x-0 z-50 transition-[transform,top,opacity] duration-300 ease-out lg:inset-x-3',
          navVisible ? 'pointer-events-auto translate-y-0 opacity-100 top-3 md:top-4 lg:top-6' : 'pointer-events-none -translate-y-[125%] opacity-0 top-0',
        ].join(' ')}
        aria-hidden={!navVisible}
      >
        {/* Navbar */}
        <header
          className={[
            'relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-full px-[clamp(1rem,3vw,3rem)] py-2 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 lg:px-4',
            navScrolled
              ? 'max-lg:border max-lg:border-white/20 max-lg:bg-white/10 max-lg:shadow-[0_18px_60px_rgba(0,0,0,0.22)] max-lg:backdrop-blur-xl'
              : 'max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none max-lg:backdrop-blur-none',
            'lg:border lg:border-white/20 lg:bg-white/10 lg:shadow-[0_18px_60px_rgba(0,0,0,0.22)] lg:backdrop-blur-xl',
          ].join(' ')}
        >
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Accueil SALAM">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/logo_salam_96.webp"
              alt="Logo SALAM"
              width={40}
              height={40}
              fetchPriority="high"
              className="h-10 w-10 shrink-0 rounded-full object-cover shadow-md"
            />
            <div className="min-w-0 leading-tight">
              <p className="hidden text-[0.78rem] font-black tracking-[0.18em] text-white lg:block">SALAM</p>
              <p className="hidden text-[0.68rem] font-semibold text-white/70 lg:block">Cameroun • Maroc</p>
            </div>
          </Link>

          {/* Mobile/tablet: demo + connexion */}
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 lg:hidden">
            <Link
              href="/demo"
              className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[0.68rem] font-bold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
            >
              <SparklesIcon className="h-3 w-3" /> Demo
            </Link>
            <Link
              href={user ? getPostLoginRedirect(user) : '/auth/login'}
              aria-label={user ? 'Ouvrir mon espace' : 'Se connecter'}
              title={user ? 'Mon espace' : 'Connexion'}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/90 backdrop-blur-sm transition hover:bg-white/20"
            >
              <UserRound size={13} strokeWidth={2} />
            </Link>
          </div>

          <nav className="hidden items-center gap-5 text-[0.92rem] font-semibold text-white/80 lg:flex" aria-label="Navigation principale">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={item.href === "/" ? "text-yellow-300" : "transition hover:text-yellow-300"}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link href={DON_NAV_ITEM.href} className="hidden items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-500 lg:inline-flex">
              {DON_NAV_ITEM.label}
            </Link>
            {/* Desktop: Démo */}
            <Link href="/demo" className="hidden items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20 lg:inline-flex">
              <SparklesIcon className="h-3.5 w-3.5" /> Démo
            </Link>
            {/* Desktop: Connexion / Mon espace */}
            {user ? (
              <Link
                href={getPostLoginRedirect(user)}
                className="hidden items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:-translate-y-0.5 hover:bg-emerald-600 lg:inline-flex"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-black">
                  {formatInitials(user.firstName, user.lastName)}
                </span>
                {formatShortName(user.firstName, user.lastName)}
                <LayoutGrid size={13} />
              </Link>
            ) : (
              <Link href="/auth/login" className="hidden items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:-translate-y-0.5 hover:bg-emerald-700 lg:inline-flex">
                <UsersIcon className="h-4 w-4" /> Connexion
              </Link>
            )}

            {/* Mobile/tablet: burger → X animé */}
            <button
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full transition hover:bg-white/10 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              <span className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${menuOpen ? 'translate-y-[3.5px] rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${menuOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
            </button>
          </div>
        </header>

        {/* Mobile/tablet dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="mx-[clamp(0.4rem,2vw,1rem)] mt-2 overflow-hidden rounded-2xl border border-white/[0.09] bg-emerald-950/90 shadow-[0_32px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:hidden"
            >
              {/* Items */}
              <nav className="flex flex-col px-2 pt-3 pb-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.045, duration: 0.22, ease: 'easeOut' }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-[0.93rem] font-semibold transition-colors duration-150 hover:bg-white/[0.07]"
                      style={{ color: item.href === '/' ? '#fde047' : 'rgba(255,255,255,0.80)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRightIcon className="h-3.5 w-3.5 opacity-20 transition-opacity duration-150 group-hover:opacity-60" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Séparateur + CTAs */}
              <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                <div className="h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
                <Link
                  href={DON_NAV_ITEM.href}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500"
                  onClick={() => setMenuOpen(false)}
                >
                  {DON_NAV_ITEM.label}
                </Link>
                <Link
                  href="/demo"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
                  onClick={() => setMenuOpen(false)}
                >
                  <SparklesIcon className="h-4 w-4" /> Voir la démo
                </Link>
                {user ? (
                  <Link
                    href={getPostLoginRedirect(user)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-600 hover:to-emerald-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-black">
                      {formatInitials(user.firstName, user.lastName)}
                    </span>
                    {formatShortName(user.firstName, user.lastName)} — Mon espace
                    <LayoutGrid size={13} />
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-600 hover:to-emerald-500"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UsersIcon className="h-4 w-4" /> Connexion
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-20 mx-auto flex h-[calc(100svh-5rem)] max-w-7xl items-center pt-14">
        <div className="max-w-[680px] pt-[clamp(0.4rem,1.5vw,1rem)] text-center lg:max-w-[900px] lg:text-left">

          {/* Pills badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
            className="mb-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.12] px-2.5 py-1 text-[0.6rem] font-bold text-white shadow-lg backdrop-blur-xl lg:gap-2.5 lg:px-3 lg:py-1.5 lg:text-xs"
          >
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 lg:h-2 lg:w-2" /> Solidarité</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500 lg:h-2 lg:w-2" /> Engagement</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-300 lg:h-2 lg:w-2" /> Réussite</span>
          </motion.div>

          {/* H1 — apparition en cascade ligne par ligne */}
          <h1 className="mx-auto max-w-4xl text-[clamp(1.4rem,3.4vw,3rem)] font-black leading-[1.18] tracking-[-0.03em] text-white drop-shadow-[0_18px_50px_rgba(0,0,0,0.55)] lg:mx-0">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 1.0, ease: EASE }}
            >
              Valorisons <span className="text-emerald-300">nos acquis.</span>
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 1.4, ease: EASE }}
            >
              Renforçons <span className="text-red-400">notre cohésion.</span>
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 2.0, ease: EASE }}
            >
              Faisons grandir <span className="text-yellow-300">notre réseau.</span>
            </motion.span>
          </h1>

          {/* Description — deux phrases apparaissant successivement */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 2.3, ease: EASE }}
            className="mx-auto mt-4 max-w-xl text-[0.75rem] leading-6 text-white/[0.82] drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] lg:mx-0 lg:mt-5 lg:max-w-none lg:whitespace-nowrap lg:text-[clamp(0.92rem,1.15vw,1rem)] lg:leading-7"
          >
            Un réseau dynamique des anciens étudiants camerounais formés au Royaume du Maroc.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 2.8, ease: EASE }}
            className="mx-auto mt-2 max-w-xl text-[0.75rem] leading-6 text-white/[0.82] drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] lg:mx-0 lg:max-w-[900px] lg:text-[clamp(0.92rem,1.15vw,1rem)] lg:leading-7"
          >
            La SALAM construit une communauté forte, engagée et tournée vers l’avenir, à travers <br /> la solidarité, le réseautage, le partage d’expériences et la valorisation des compétences.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 3.1, ease: EASE }}
            className="mt-4 flex flex-row flex-wrap items-center justify-center gap-2 lg:mt-6 lg:justify-start lg:gap-3"
          >
            <Link href="/don" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-[0.75rem] font-extrabold text-white shadow-2xl shadow-emerald-950/35 transition hover:-translate-y-0.5 hover:from-red-400 hover:to-red-400 lg:gap-2 lg:px-5 lg:py-2.5 lg:text-[0.92rem]">
              Faire un don <HeartHandshakeIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </Link>
            <Link href="#opportunites" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/[0.14] px-4 py-2 text-[0.75rem] font-extrabold text-white shadow-xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-red-400 hover:border-red-400 lg:gap-2 lg:px-5 lg:py-2.5 lg:text-[0.92rem]">
              Opportunités <ArrowUpRightIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </Link>
          </motion.div>

          {/* Info cards — mobile only, below CTAs */}
          <div className="mt-16 grid grid-cols-3 gap-2 lg:hidden">
            <div style={{ animationDelay: '2.7s' }} className="slide-in-bottom group rounded-xl border border-white/[0.18] bg-white/10 p-2.5 backdrop-blur-xl transition-colors duration-300 hover:bg-emerald-500 hover:border-transparent">
              <UsersIcon className="mx-auto mb-1 block h-3.5 w-3.5 text-emerald-300 transition-colors duration-300 group-hover:text-white" />
              <p className="text-center text-[0.65rem] font-black leading-tight text-white">Réseau</p>
              <p className="mt-0.5 text-center text-[0.55rem] font-medium leading-snug text-white/60 transition-colors duration-300 group-hover:text-white">Anciens & partenaires</p>
            </div>
            <div style={{ animationDelay: '3.1s' }} className="slide-in-bottom group rounded-xl border border-white/[0.18] bg-white/10 p-2.5 backdrop-blur-xl transition-colors duration-300 hover:bg-red-500 hover:border-transparent">
              <GraduationCapIcon className="mx-auto mb-1 block h-3.5 w-3.5 text-red-400 transition-colors duration-300 group-hover:text-yellow-300" />
              <p className="text-center text-[0.65rem] font-black leading-tight text-white">Réussite</p>
              <p className="mt-0.5 text-center text-[0.55rem] font-medium leading-snug text-white/60 transition-colors duration-300 group-hover:text-white">Diplôme & carrière</p>
            </div>
            <div style={{ animationDelay: '3.5s' }} className="slide-in-bottom group rounded-xl border border-white/[0.18] bg-white/10 p-2.5 backdrop-blur-xl transition-colors duration-300 hover:bg-yellow-400 hover:border-transparent">
              <HeartHandshakeIcon className="mx-auto mb-1 block h-3.5 w-3.5 text-yellow-300 transition-colors duration-300 group-hover:text-black" />
              <p className="text-center text-[0.65rem] font-black leading-tight text-white transition-colors duration-300 group-hover:text-black">Transmission</p>
              <p className="mt-0.5 text-center text-[0.55rem] font-medium leading-snug text-white/60 transition-colors duration-300 group-hover:text-black">Conseil, suivi & accompagnement</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Info cards — bottom right, contained inside section ── */}
      <div className="absolute bottom-[clamp(1.5rem,2.5vh,2rem)] right-[clamp(1rem,4vw,3rem)] z-20 hidden w-[clamp(22rem,28vw,32rem)] grid-cols-3 gap-2.5 lg:grid">
        <div style={{ animationDelay: '2.7s' }} className="slide-in-bottom group rounded-2xl border border-white/[0.18] bg-white/10 p-3 backdrop-blur-xl transition-colors duration-300 hover:bg-emerald-500 hover:border-transparent">
          <UsersIcon className="mx-auto mb-1.5 block h-4 w-4 text-emerald-300 transition-colors duration-300 group-hover:text-white" />
          <p className="text-center text-sm font-black leading-tight text-white">Réseau</p>
          <p className="mt-1 text-center text-[0.68rem] font-medium leading-snug text-white/70 transition-colors duration-300 group-hover:text-white">Anciens, étudiants et partenaires</p>
        </div>
        <div style={{ animationDelay: '3.1s' }} className="slide-in-bottom group rounded-2xl border border-white/[0.18] bg-white/10 p-3 backdrop-blur-xl transition-colors duration-300 hover:bg-red-500 hover:border-transparent">
          <GraduationCapIcon className="mx-auto mb-1.5 block h-4 w-4 text-red-400 transition-colors duration-300 group-hover:text-yellow-300" />
          <p className="text-center text-sm font-black leading-tight text-white">Réussite</p>
          <p className="mt-1 text-center text-[0.68rem] font-medium leading-snug text-white/70 transition-colors duration-300 group-hover:text-white">Études, diplôme, carrière</p>
        </div>
        <div style={{ animationDelay: '3.5s' }} className="slide-in-bottom group rounded-2xl border border-white/[0.18] bg-white/10 p-3 backdrop-blur-xl transition-colors duration-300 hover:bg-yellow-400 hover:border-transparent">
          <HeartHandshakeIcon className="mx-auto mb-1.5 block h-4 w-4 text-yellow-300 transition-colors duration-300 group-hover:text-black" />
          <p className="text-center text-sm font-black leading-tight text-white transition-colors duration-300 group-hover:text-black">Transmission</p>
          <p className="mt-1 text-center text-[0.68rem] font-medium leading-snug text-white/70 transition-colors duration-300 group-hover:text-black">Conseil, suivi & accompagnement</p>
        </div>
      </div>
      <style>{`
        @keyframes slide-in-bottom {
          0%   { transform: translateY(32px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        .slide-in-bottom {
          -webkit-animation: slide-in-bottom .5s cubic-bezier(.25,.46,.45,.94) both;
                  animation: slide-in-bottom .5s cubic-bezier(.25,.46,.45,.94) both;
        }
      `}</style>

      {/* ── Scroll to top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? 'auto' : 'none',
        }}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 text-white shadow-xl shadow-emerald-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
        aria-label="Retour en haut de page"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}
