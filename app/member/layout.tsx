'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { apiClient } from '@/lib/api/client';
import { formatFirstName, formatFullName, formatInitials } from '@/lib/format-name';
import { memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CreditCard, User, CalendarDays,
  MessageSquare, LogOut, Menu, X, ChevronRight, Bell,
  Banknote, FileText, FolderOpen, Images, Newspaper, Loader2, Globe, Users,
  ChevronDown, Handshake, BriefcaseBusiness, WalletCards,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',     href: '/member/dashboard',   icon: LayoutDashboard },
  { label: 'Bureau',        href: '/member/bureau',      icon: Users            },
  { label: 'Mes factures',  href: '/member/factures',    icon: FileText         },
  { label: 'Activités',     href: '/member/activites',   icon: CalendarDays     },
  { label: 'Galerie',       href: '/member/galerie',     icon: Images           },
  { label: 'Actualités',    href: '/member/actualites',  icon: Newspaper        },
  { label: 'Networking',    href: '/member/networking',  icon: Handshake        },
  { label: 'Opportunites',  href: '/member/opportunites', icon: BriefcaseBusiness },
  { label: 'Tresorerie',    href: '/member/tresorerie',  icon: WalletCards      },
  { label: 'Messages',      href: '/member/messages',    icon: MessageSquare    },
];

const ACCOUNT_NAV = [
  { label: 'Mon profil',    href: '/member/profil',      icon: User       },
  { label: 'Ma carte',      href: '/member/carte',       icon: CreditCard },
  { label: 'Cotisations',   href: '/member/cotisations', icon: Banknote   },
  { label: 'Mes documents', href: '/member/documents',   icon: FolderOpen },
];


function MemberSidebar({ open, onClose, firstName, lastName, initials, avatarUrl, initialsClass, onLogout }: {
  open: boolean; onClose: () => void;
  firstName: string; lastName: string; initials: string;
  avatarUrl: string; initialsClass: string;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(() => ACCOUNT_NAV.some(item => pathname.startsWith(item.href)));

  useEffect(() => {
    if (ACCOUNT_NAV.some(item => pathname.startsWith(item.href))) setAccountOpen(true);
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-gradient-to-b from-[#07140d] via-[#0b1f15] to-[#061009] shadow-[4px_0_40px_rgba(0,0,0,0.4)] transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Flag stripe */}
        <div className="h-[4px] w-full shrink-0" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <Image src="/images/logo/logo_salam_wbg.png" alt="SALAM" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-1 ring-emerald-500/30" priority />
          <div>
            <p className="text-sm font-black tracking-[0.16em] text-white">SALAM</p>
            <p className="text-[10px] font-semibold tracking-widest text-white/35">ESPACE MEMBRE</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white/60 lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Mini card preview */}
        <div className="mx-3 my-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400/70">Carte membre</p>
          <p className="mt-1 text-sm font-black text-white">
            {firstName || lastName ? formatFullName(firstName, lastName) : '—'}
          </p>
          <Link
            href="/member/carte"
            onClick={onClose}
            className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300"
          >
            Voir ma carte <ChevronRight size={10} />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-0.5">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                      active
                        ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                        : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-emerald-400' : 'text-white/30 group-hover:text-white/60'} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight size={12} className="text-emerald-400/60" />}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => setAccountOpen(v => !v)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                  ACCOUNT_NAV.some(item => pathname.startsWith(item.href))
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                    : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
                }`}
              >
                <User size={16} className={ACCOUNT_NAV.some(item => pathname.startsWith(item.href)) ? 'text-emerald-400' : 'text-white/30 group-hover:text-white/60'} />
                <span className="flex-1 text-left">Mon compte</span>
                <ChevronDown size={13} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {accountOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-3 overflow-hidden border-l border-white/10 pl-2"
                  >
                    {ACCOUNT_NAV.map(({ label, href, icon: Icon }) => {
                      const active = pathname === href;
                      return (
                        <li key={href} className="mt-0.5">
                          <Link
                            href={href}
                            onClick={onClose}
                            className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                              active ? 'bg-emerald-500/10 text-emerald-300' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/75'
                            }`}
                          >
                            <Icon size={14} className={active ? 'text-emerald-300' : 'text-white/25 group-hover:text-white/55'} />
                            <span className="flex-1">{label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={formatFullName(firstName, lastName)} className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-emerald-400/40" />
            ) : (
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${initialsClass}`}>
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-black text-white/80">
                {firstName || lastName ? formatFullName(firstName, lastName) : '—'}
              </p>
              <p className="truncate text-[10px] text-white/30">Membre actif</p>
            </div>
            <button onClick={onLogout} className="text-white/25 transition-colors hover:text-red-400" title="Déconnexion">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [restoring,   setRestoring]   = useState(true);
  const pathname = usePathname();
  const { user, clearAuth, restoreAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Restauration de session après rechargement de page (Zustand est vide)
  useEffect(() => {
    if (user) {
      setRestoring(false);
      return;
    }

    const restore = async () => {
      try {
        const refreshRes = await apiClient<{ accessToken: string }>(
          '/api/v1/auth/refresh', { method: 'POST' },
        );
        const token = refreshRes.data.accessToken;

        const meRes = await apiClient<AuthUser>('/api/v1/auth/me', { token });

        // Renouveler les cookies httpOnly avec le nouveau token
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: token }),
        });

        restoreAuth(meRes.data, token);
      } catch {
        // Session expirée → retour au login
        clearAuth();
        await fetch('/api/auth/session', { method: 'DELETE' });
        router.replace('/auth/login');
      } finally {
        setRestoring(false);
      }
    };

    restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try { await apiClient('/api/v1/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    // Effacer les cookies httpOnly côté serveur
    await fetch('/api/auth/session', { method: 'DELETE' });
    clearAuth();
    router.push('/auth/login');
  };

  // Écran de chargement pendant la restauration de session
  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f5]">
        <Loader2 className="animate-spin text-emerald-600" size={24} />
      </div>
    );
  }

  const currentPage = [...NAV, ...ACCOUNT_NAV].find(n => n.href === pathname);
  const firstName  = formatFirstName(user?.firstName ?? '');
  const lastName   = user?.lastName ?? '';
  const initials   = firstName && lastName ? formatInitials(firstName, lastName) : '…';
  const avatarUrl = memberPhotoUrl(user);
  const initialsClass = memberInitialsClass(user?.gender);

  return (
    <div className="flex min-h-screen bg-[#f4f6f5]">
      <MemberSidebar
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        firstName={firstName} lastName={lastName} initials={initials}
        avatarUrl={avatarUrl} initialsClass={initialsClass}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky z-20 flex h-14 items-center gap-4 border-b border-neutral-200/80 bg-white/95 px-5 backdrop-blur-sm" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700 lg:hidden"
          >
            <Menu size={16} />
          </button>

          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-neutral-400">Espace membre</span>
            {currentPage && (
              <>
                <ChevronRight size={13} className="text-neutral-300" />
                <span className="font-black text-neutral-800">{currentPage.label}</span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              <Globe size={13} />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                <Bell size={15} />
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-[99]" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full z-[100] mt-2 w-72 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl">
                    <div className="border-b border-neutral-100 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Notifications</p>
                    </div>
                    <div className="flex flex-col items-center py-10 text-center">
                      <Bell size={28} className="mb-3 text-neutral-200" />
                      <p className="text-sm font-semibold text-neutral-400">Aucune notification</p>
                      <p className="mt-1 text-xs text-neutral-300">Vous êtes à jour !</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={user ? formatFullName(user.firstName, user.lastName) : 'Profil'} className="h-8 w-8 rounded-full object-cover ring-1 ring-neutral-200" />
            ) : (
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${initialsClass}`}>
                {initials}
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
