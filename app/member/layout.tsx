'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { apiClient } from '@/lib/api/client';
import { hasAdminRole } from '@/lib/auth/roles';
import { formatFirstName, formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberAvatarRingClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import MemberAccountTabs, { isMemberAccountPath } from '@/components/member/MemberAccountTabs';
import AuthSessionKeeper from '@/components/auth/AuthSessionKeeper';
import { NotificationCenter } from '@/components/portal/NotificationCenter';
import { CauriBadge } from '@/components/member/CauriWallet';
import { AvatarLightbox, GlobalProfilePhotoLightbox } from '@/components/portal/AvatarLightbox';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, CalendarDays,
  MessageSquare, Menu, X, ChevronRight, Bell,
  Images, Newspaper, Loader2, Globe, Users,
  Handshake, BriefcaseBusiness, WalletCards,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',     href: '/member/dashboard',   icon: LayoutDashboard },
  { label: 'Mon compte',    href: '/member/profil',      icon: User            },
  { label: 'Bureau',        href: '/member/bureau',      icon: Users            },
  { label: 'Activités',     href: '/member/activites',   icon: CalendarDays     },
  { label: 'Galerie',       href: '/member/galerie',     icon: Images           },
  { label: 'Actualités',    href: '/member/actualites',  icon: Newspaper        },
  { label: 'Networking',    href: '/member/networking',  icon: Handshake        },
  { label: 'Opportunites',  href: '/member/opportunites', icon: BriefcaseBusiness },
  { label: 'Tresorerie',    href: '/member/tresorerie',  icon: WalletCards      },
  { label: 'Messages',      href: '/member/messages',    icon: MessageSquare    },
];

function missingProfileFields(user: AuthUser | null) {
  if (!user) return [];
  const required: Array<keyof AuthUser> = [
    'firstName', 'lastName', 'email', 'phone', 'gender', 'promotionYear',
    'birthDate', 'city', 'country', 'residenceCity', 'antenne',
    'activitySector', 'recoveryContact', 'bio', 'motivation',
    'skills', 'expertiseDomains',
  ];
  return required.filter(field => {
    const value = user[field] as unknown;
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || String(value).trim() === '';
  });
}


function MemberSidebar({ open, onClose, firstName, lastName, initials, avatarUrl, initialsClass, gender, canSwitchAdmin, onLogout }: {
  open: boolean; onClose: () => void;
  firstName: string; lastName: string; initials: string;
  avatarUrl: string; initialsClass: string; gender?: string | null; canSwitchAdmin: boolean;
  onLogout: () => void;
}) {
  const pathname = usePathname();

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
          <Image src="/images/logo/logo_salam_96.webp" alt="SALAM" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-1 ring-emerald-500/30" priority />
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
            {firstName || lastName ? formatFullName(firstName, lastName) : '-'}
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
          </ul>
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <AvatarLightbox src={avatarUrl} alt={formatFullName(firstName, lastName)} className={'h-9 w-9 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(gender)} />
            ) : (
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${initialsClass}`}>
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-black text-white/80">
                {firstName || lastName ? formatFullName(firstName, lastName) : '-'}
              </p>
              <p className="truncate text-[10px] text-white/30">Membre actif</p>
            </div>
            <button type="button" onClick={onLogout} className="shrink-0 text-[11px] font-semibold text-red-300/70 transition-colors hover:text-red-300">
              Déconnexion
            </button>
          </div>
          {canSwitchAdmin && (
            <Link href="/admin/dashboard" onClick={() => {
              document.cookie = 'salam_space=admin; path=/; SameSite=Lax; max-age=86400';
              onClose();
            }} className="mt-3 block border-t border-white/[0.06] pt-3 text-center text-[11px] font-bold text-emerald-400 transition hover:text-emerald-300">
              Aller au portail administrateur
            </Link>
          )}
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
        let token: string;
        let restoredUser: AuthUser;
        try {
          const refreshRes = await apiClient<{ accessToken: string }>(
            '/api/v1/auth/refresh', { method: 'POST' },
          );
          token = refreshRes.data.accessToken;

          const meRes = await apiClient<AuthUser>('/api/v1/auth/me', { token });
          restoredUser = meRes.data;
        } catch {
          const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
          if (!sessionRes.ok) throw new Error('local_session_expired');
          const session = await sessionRes.json();
          token = session.accessToken;
          restoredUser = session.user;
        }

        // Renouveler les cookies httpOnly avec le nouveau token
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ accessToken: token }),
        });

        restoreAuth(restoredUser, token);
      } catch {
        // Session expiree - retour au login
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

  // Ecran de chargement pendant la restauration de session
  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f5]">
        <Loader2 className="animate-spin text-emerald-600" size={24} />
      </div>
    );
  }

  const currentPage = NAV.find(n => pathname.startsWith(n.href));
  const firstName  = formatFirstName(user?.firstName ?? '');
  const lastName   = user?.lastName ?? '';
  const initials   = firstName && lastName ? formatInitials(firstName, lastName) : '⬦';
  const avatarUrl = memberPhotoUrl(user);
  const initialsClass = memberInitialsClass(user?.gender);
  const profileMissing = missingProfileFields(user);

  return (
    <div className="flex min-h-screen bg-[#f4f6f5]">
      <AuthSessionKeeper />
      <GlobalProfilePhotoLightbox />
      <MemberSidebar
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        firstName={firstName} lastName={lastName} initials={initials}
        avatarUrl={avatarUrl} initialsClass={initialsClass} gender={user?.gender} canSwitchAdmin={hasAdminRole(user)}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky z-20 flex h-14 items-center gap-2 border-b border-neutral-200/80 bg-white/95 px-3 backdrop-blur-sm sm:gap-4 sm:px-5" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700 lg:hidden"
          >
            <Menu size={16} />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden whitespace-nowrap text-[clamp(0.68rem,2.3vw,0.875rem)] sm:gap-1.5">
            <span className="shrink-0 font-semibold text-neutral-400">Espace membre</span>
            {currentPage && (
              <>
                <ChevronRight size={12} className="shrink-0 text-neutral-300" />
                <span className="min-w-0 truncate font-black text-neutral-800">{currentPage.label}</span>
              </>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2 py-1.5 text-[clamp(0.68rem,2vw,0.75rem)] font-semibold text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700 sm:px-3"
            >
              <Globe size={13} />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>
            <NotificationCenter space="member" />
            {avatarUrl ? (
              <AvatarLightbox src={avatarUrl} alt={user ? formatFullName(user.firstName, user.lastName) : 'Profil'} className={'h-8 w-8 rounded-full border-2 object-cover ring-1 ' + memberAvatarBorderClass(user?.gender) + ' ' + memberAvatarRingClass(user?.gender)} />
            ) : (
              <Link href="/member/profil" title="Mon compte" className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${initialsClass}`}>
                {initials}
              </Link>
            )}
            <CauriBadge compact />

          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 md:px-6 lg:px-8">
          {profileMissing.length > 0 && (
            <Link
              href="/member/profil"
              className="mb-4 block rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-100"
            >
              Profil incomplet : merci de compléter toutes vos informations pour finaliser votre fiche membre.
            </Link>
          )}
          {isMemberAccountPath(pathname) && <MemberAccountTabs />}
          {children}
        </main>
      </div>
    </div>
  );
}
