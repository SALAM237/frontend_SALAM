'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, LayoutGrid, Sparkles, Users } from 'lucide-react';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { getPostLoginRedirect } from '@/lib/auth/roles';
import { apiClient } from '@/lib/api/client';

const navItems = [
  { label: 'Accueil', href: '/' },
  { label: 'A propos', href: '/a-propos' },
  { label: 'Missions', href: '/missions' },
  { label: 'Activites', href: '/activites' },
  { label: 'Galerie', href: '/galerie' },
  { label: 'Actualites', href: '/actualites' },
  { label: 'Contact', href: '/contact' },
];

export function FloatingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const pathname = usePathname();
  const { user, restoreAuth } = useAuthStore();

  useEffect(() => {
    if (user) return;
    const tryRestore = async () => {
      try {
        const refreshRes = await apiClient<{ accessToken: string }>(
          '/api/v1/auth/refresh',
          { method: 'POST' },
        );
        const token = refreshRes.data.accessToken;
        const meRes = await apiClient<AuthUser>('/api/v1/auth/me', { token });
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: token }),
        });
        restoreAuth(meRes.data, token);
      } catch {
        // Non connecte, aucune action.
      }
    };
    tryRestore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
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

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={[
        'fixed inset-x-0 z-50 transition-[transform,top] duration-300 ease-out lg:inset-x-3',
        navVisible ? 'translate-y-0 top-3 md:top-4 lg:top-6' : '-translate-y-full top-0',
      ].join(' ')}
    >
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
            src="/images/logo/logo_salam_wbg.png"
            alt="Logo SALAM"
            className="h-10 w-10 shrink-0 rounded-full object-cover shadow-md"
          />
          <div className="min-w-0 leading-tight">
            <p className="hidden text-[0.78rem] font-black tracking-[0.18em] text-white lg:block">SALAM</p>
            <p className="hidden text-[0.68rem] font-semibold text-white/70 lg:block">Cameroun - Maroc</p>
          </div>
        </Link>

        <Link
          href="/demo"
          className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[0.68rem] font-bold text-white/90 backdrop-blur-sm transition hover:bg-white/20 lg:hidden"
        >
          <Sparkles className="h-2.5 w-2.5" /> Demo
        </Link>

        <nav className="hidden items-center gap-5 text-[0.92rem] font-semibold text-white/80 lg:flex" aria-label="Navigation principale">
          {navItems.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'text-yellow-300' : 'transition hover:text-yellow-300'}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/demo" className="hidden items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20 lg:inline-flex">
            <Sparkles className="h-3.5 w-3.5" /> Demo
          </Link>
          {user ? (
            <Link
              href={getPostLoginRedirect(user)}
              className="hidden items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:-translate-y-0.5 hover:bg-emerald-600 lg:inline-flex"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-black">
                {user.firstName[0]}{user.lastName[0]}
              </span>
              {user.firstName} {user.lastName[0]}.
              <LayoutGrid size={13} />
            </Link>
          ) : (
            <Link href="/auth/login" className="hidden items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:-translate-y-0.5 hover:bg-emerald-700 lg:inline-flex">
              <Users className="h-4 w-4" /> Connexion
            </Link>
          )}

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

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="mx-[clamp(0.4rem,2vw,1rem)] mt-2 overflow-hidden rounded-2xl border border-white/[0.09] bg-emerald-950/90 shadow-[0_32px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex flex-col px-2 pt-3 pb-1">
              {navItems.map((item, i) => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.045, duration: 0.22, ease: 'easeOut' }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-[0.93rem] font-semibold transition-colors duration-150 hover:bg-white/[0.07]"
                      style={{ color: active ? '#fde047' : 'rgba(255,255,255,0.80)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-20 transition-opacity duration-150 group-hover:opacity-60" />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
              <div className="h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
              <Link
                href="/demo"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
                onClick={() => setMenuOpen(false)}
              >
                <Sparkles className="h-4 w-4" /> Voir la demo
              </Link>
              {user ? (
                <Link
                  href={getPostLoginRedirect(user)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-600 hover:to-emerald-500"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-black">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                  {user.firstName} {user.lastName[0]}. - Mon espace
                  <LayoutGrid size={13} />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-600 hover:to-emerald-500"
                  onClick={() => setMenuOpen(false)}
                >
                  <Users className="h-4 w-4" /> Connexion
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
