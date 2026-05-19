'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, LayoutGrid } from 'lucide-react';
import { SalamLogo } from '@/components/brand/SalamLogo';
import { useAuthStore } from '@/store/auth.store';
import { getPostLoginRedirect } from '@/lib/auth/roles';

const NAV = [
  { label: 'À propos',   href: '/a-propos' },
  { label: 'Activités',  href: '/activites' },
  { label: 'Galerie',    href: '/galerie' },
  { label: 'Actualités', href: '/actualites' },
  { label: 'Adhésion',   href: '/adhesion' },
  { label: 'Contact',    href: '/contact' },
];

export function Header() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const userSpace  = user ? getPostLoginRedirect(user) : '/auth/login';
  const initials   = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '';
  const shortName  = user ? `${user.firstName} ${user.lastName[0]}.` : '';

  return (
    <>
      <header
        className="sticky z-50 transition-all duration-300"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          background: 'rgba(255,255,255,0.94)',
          WebkitBackdropFilter: 'blur(14px)',
          backdropFilter: 'blur(14px)',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,.07)' : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,.06)' : 'none',
        }}
      >
        <div className="container-salam flex h-[68px] items-center justify-between gap-4">

          {/* ── Logo ── */}
          <SalamLogo size="sm" variant="default" className="shrink-0" />

          {/* ── Desktop nav ── */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {NAV.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'relative rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-150',
                    active
                      ? 'text-salam-green'
                      : 'text-neutral-600 hover:text-salam-green hover:bg-green-50',
                  ].join(' ')}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full bg-salam-green"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop CTAs ── */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/demo"
              className="rounded-full border border-neutral-200 px-4 py-2 text-[13px] font-semibold text-neutral-600 transition-colors hover:border-salam-green hover:text-salam-green"
            >
              Démo
            </Link>
            {user ? (
              <Link
                href={userSpace}
                className="inline-flex items-center gap-2 rounded-full bg-salam-green px-4 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-green-900/15 transition-colors hover:bg-green-800"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-black">
                  {initials}
                </span>
                <span>{shortName}</span>
                <LayoutGrid size={13} />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-salam-green px-5 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-green-900/15 transition-colors hover:bg-green-800"
              >
                Connexion <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {/* ── Mobile burger ── */}
          <button
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 transition-colors hover:border-salam-green lg:hidden focus:outline-none"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open
                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: .18 }}>
                    <X size={17} />
                  </motion.span>
                : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: .18 }}>
                    <Menu size={17} />
                  </motion.span>
              }
            </AnimatePresence>
          </button>
        </div>

        {/* ── Mobile dropdown ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: .32, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
              className="overflow-hidden border-t border-neutral-100 bg-white lg:hidden"
            >
              <nav className="container-salam flex flex-col gap-1 py-4" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }} aria-label="Navigation mobile">
                {NAV.map(({ label, href }, i) => {
                  const active = pathname === href;
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.055, duration: .28 }}
                    >
                      <Link
                        href={href}
                        className={[
                          'flex items-center rounded-xl px-4 py-3 text-[14px] font-semibold transition-colors',
                          active ? 'bg-green-50 text-salam-green' : 'text-neutral-700 hover:bg-neutral-50',
                        ].join(' ')}
                      >
                        {label}
                        {active && <span className="ml-auto size-1.5 rounded-full bg-salam-green" />}
                      </Link>
                    </motion.div>
                  );
                })}
                <div className="mt-3 flex gap-2 border-t border-neutral-100 pt-4">
                  <Link href="/demo" className="flex-1 rounded-xl border border-neutral-200 py-3 text-center text-sm font-semibold text-neutral-600">Démo</Link>
                  {user ? (
                    <Link href={userSpace} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-salam-green py-3 text-sm font-bold text-white">
                      <LayoutGrid size={14} /> Mon espace
                    </Link>
                  ) : (
                    <Link href="/auth/login" className="flex-1 rounded-xl bg-salam-green py-3 text-center text-sm font-bold text-white">Connexion</Link>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
