'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarDays,
  Images, Newspaper, Settings, LogOut, Menu, X, ChevronRight, Bell,
  Banknote, FileText, History, MessageSquare, Shield, Loader2, Globe, ShieldCheck,
  Handshake, BriefcaseBusiness, Sparkles, Target,
} from 'lucide-react';
import Image from 'next/image';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { isSuperAdmin, hasAdminRole, hasAnyPermission } from '@/lib/auth/roles';
import { apiClient } from '@/lib/api/client';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberAvatarRingClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import AdminAccountTabs from '@/components/admin/AdminAccountTabs';
import AuthSessionKeeper from '@/components/auth/AuthSessionKeeper';
import { NotificationCenter } from '@/components/portal/NotificationCenter';
import { AvatarLightbox } from '@/components/portal/AvatarLightbox';

type NavItem = { label: string; href: string; icon: React.ElementType; superAdminOnly?: boolean; permissions?: string[] };

const BASE_NAV: NavItem[] = [
  { label: 'Tableau de bord',   href: '/admin/dashboard',         icon: LayoutDashboard },
  { label: 'Adhérents',         href: '/admin/adherents',         icon: Users },
  { label: "Frais d'adhésion",  href: '/admin/cotisations',       icon: Banknote },
  { label: 'Facturation',       href: '/admin/facturation',       icon: FileText },
  { label: 'Tresorerie',        href: '/admin/tresorerie',        icon: Banknote, permissions: ['treasury.read', 'treasury.create', 'treasury.update', 'treasury.delete'] },
  { label: 'Activités',         href: '/admin/activites',         icon: CalendarDays },
  { label: 'Galerie',           href: '/admin/galerie',           icon: Images },
  { label: 'Actualités',        href: '/admin/actualites',        icon: Newspaper },
  { label: 'Networking',        href: '/admin/networking',        icon: Handshake, permissions: ['networking.publish'] },
  { label: 'Opportunites',      href: '/admin/opportunites',      icon: BriefcaseBusiness, permissions: ['opportunities.publish', 'opportunities.create', 'opportunities.update', 'opportunities.delete'] },
  { label: 'Messages',          href: '/admin/messages',          icon: MessageSquare },
  { label: 'Assistant IA',      href: '/admin/assistant-ia',      icon: Sparkles },
  { label: 'IDP/ISP',           href: '/admin/idp-isp',           icon: Target },
  { label: 'Validations',       href: '/admin/validations',       icon: ShieldCheck, permissions: ['content.publish', 'gallery.publish', 'networking.publish', 'opportunities.publish'] },
  { label: 'Historique',        href: '/admin/historique',        icon: History },
  { label: 'Rôles & Accès',     href: '/admin/roles',             icon: Shield, superAdminOnly: true },
  { label: 'Bureau',            href: '/admin/bureau',            icon: Users },
  { label: 'Compte',            href: '/admin/parametres',        icon: Settings },
];

function cleanGenericBureauTitle(value?: string | null) {
  return (value ?? '')
    .replace(/\s*\(e\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeBureauPoste(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(e\)/g, ' e')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const FEMININE_BUREAU_POSTES: Record<string, string> = {
  president: 'Présidente',
  'president e': 'Présidente',
  'vice president': 'Vice-Présidente',
  'vice president e': 'Vice-Présidente',
  'secretaire general': 'Secrétaire Générale',
  'secretaire general e': 'Secrétaire Générale',
  'secretaire adjoint': 'Secrétaire Adjointe',
  'secretaire adjoint e': 'Secrétaire Adjointe',
  tresorier: 'Trésorière',
  'tresorier e': 'Trésorière',
  'tresorier adjoint': 'Trésorière Adjointe',
  'tresorier e adjoint e': 'Trésorière Adjointe',
  censeur: 'Censeure',
  responsable: 'Responsable',
  'commissaire aux comptes': 'Commissaire aux comptes',
  'membre sage': 'Membre sage',
  conseiller: 'Conseillère',
  'conseiller e': 'Conseillère',
  'sage conseiller': 'Sage conseillère',
  'sage conseiller e': 'Sage conseillère',
};

function formatBureauPosteForGender(poste?: string | null, gender?: string | null) {
  const cleanPoste = cleanGenericBureauTitle(poste);
  if (gender?.toLowerCase() !== 'femme') return cleanPoste;
  return FEMININE_BUREAU_POSTES[normalizeBureauPoste(cleanPoste)] ?? cleanPoste;
}

function AdminSidebar({ open, onClose, initials, displayName, adminRole, bureauPoste, avatarUrl, initialsClass, gender, onLogout, nav }: {
  open: boolean; onClose: () => void;
  initials: string; displayName: string; adminRole: string; bureauPoste?: string | null;
  avatarUrl: string; initialsClass: string; gender?: string | null;
  onLogout: () => void;
  nav: NavItem[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  return (
    <>
      {/* Overlay mobile */}
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

      {/* Sidebar */}
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
            <p className="text-[10px] font-semibold tracking-widest text-white/35">ADMIN</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white/60 lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-white/20">Navigation</p>
          <ul className="flex flex-col gap-0.5">
            {nav.map(({ label, href, icon: Icon }) => {
              const [hrefPath, hrefQuery] = href.split('?');
              const hrefTab = new URLSearchParams(hrefQuery ?? '').get('tab');
              const active = hrefTab
                ? pathname === hrefPath && currentTab === hrefTab
                : pathname === hrefPath || (hrefPath !== '/admin/dashboard' && pathname.startsWith(hrefPath) && !(hrefPath === '/admin/roles' && currentTab === 'bureau'));
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
              <AvatarLightbox src={avatarUrl} alt={displayName} className={'h-9 w-9 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(gender)} />
            ) : (
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${initialsClass}`}>
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-black text-white/80">{displayName}</p>
              <p className="truncate text-[10px] text-white/30">
                {bureauPoste ?? adminRole}
              </p>
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      if (!hasAdminRole(user)) {
        clearAuth();
        fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
        router.replace('/');
        setRestoring(false);
        return;
      }
      setRestoring(false);
      return;
    }

    const restore = async () => {
      try {
        let token: string;
        let restoredUser: AuthUser;
        try {

        // Récupérer un nouvel access token via le refresh token httpOnly
        const refreshRes = await apiClient<{ accessToken: string }>(
          '/api/v1/auth/refresh', { method: 'POST' },
        );
        token = refreshRes.data.accessToken;

        // Charger les données utilisateur
        const meRes = await apiClient<AuthUser>('/api/v1/auth/me', { token });
        restoredUser = meRes.data;

        // Vérifier le rôle admin (double-check côté client)
        } catch {
          const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
          if (!sessionRes.ok) throw new Error('local_session_expired');
          const session = await sessionRes.json();
          token = session.accessToken;
          restoredUser = session.user;
        }

        if (!hasAdminRole(restoredUser)) {
          clearAuth();
          await fetch('/api/auth/session', { method: 'DELETE' });
          router.replace('/');
          return;
        }

        // Renouveler les cookies httpOnly avec le nouveau token
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ accessToken: token }),
        });

        restoreAuth(restoredUser, token);
      } catch {
        // Une reprise mobile / navigateur peut rater un refresh ponctuellement.
        // On retente une fois avant de supprimer la session pour eviter les deconnexions abusives.
        try {
          await new Promise(resolve => setTimeout(resolve, 900));
          const retry = await apiClient<{ accessToken: string }>('/api/v1/auth/refresh', { method: 'POST' });
          const retryMe = await apiClient<AuthUser>('/api/v1/auth/me', { token: retry.data.accessToken });
          if (!hasAdminRole(retryMe.data)) throw new Error('not_admin');
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ accessToken: retry.data.accessToken }),
          });
          restoreAuth(retryMe.data, retry.data.accessToken);
        } catch {
          clearAuth();
          await fetch('/api/auth/session', { method: 'DELETE' });
          router.replace('/bureau-executif/connexion');
        }
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
    router.push('/bureau-executif/connexion');
  };

  // Ecran de chargement pendant la restauration de session
  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f5]">
        <Loader2 className="animate-spin text-emerald-600" size={24} />
      </div>
    );
  }

  const SA  = isSuperAdmin(user);
  const nav = BASE_NAV.filter(n => {
    if (n.superAdminOnly && !SA) return false;
    if (n.permissions && !hasAnyPermission(user, n.permissions)) return false;
    return true;
  });

  const currentPage = nav.find(n => n.href === pathname || (n.href !== '/admin/dashboard' && pathname.startsWith(n.href)));
  const initials    = user ? formatInitials(user.firstName, user.lastName, 'A') : 'A';
  const displayName = user ? formatFullName(user.firstName, user.lastName) : 'Administrateur';
  const adminRole   = user?.roles.find(r => ['admin', 'super_admin'].includes(r.slug))?.name ?? 'Admin';
  const bureauPoste = formatBureauPosteForGender(user?.bureauPoste, user?.gender) || null;
  const avatarUrl = memberPhotoUrl(user);
  const initialsClass = memberInitialsClass(user?.gender);

  return (
    <div className="flex min-h-screen bg-[#f4f6f5]">
      <AuthSessionKeeper />
      <AdminSidebar
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        initials={initials} displayName={displayName} adminRole={adminRole}
        bureauPoste={bureauPoste}
        avatarUrl={avatarUrl} initialsClass={initialsClass} gender={user?.gender}
        onLogout={handleLogout}
        nav={nav}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">

        {/* Top bar */}
        <header className="sticky z-20 flex h-14 items-center gap-2 border-b border-neutral-200/80 bg-white/95 px-3 backdrop-blur-sm sm:gap-4 sm:px-5" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700 lg:hidden"
          >
            <Menu size={16} />
          </button>

          {/* Breadcrumb */}
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden whitespace-nowrap text-[clamp(0.68rem,2.3vw,0.875rem)] sm:gap-1.5">
            <span className="shrink-0 font-semibold text-neutral-400">Admin</span>
            {currentPage && (
              <>
                <ChevronRight size={12} className="shrink-0 text-neutral-300" />
                <span className="min-w-0 truncate font-black text-neutral-800">{currentPage.label}</span>
              </>
            )}
          </div>

          {/* Right */}
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
            <NotificationCenter space="admin" />
            {avatarUrl ? (
              <AvatarLightbox src={avatarUrl} alt={displayName} className={'h-8 w-8 rounded-full border-2 object-cover ring-1 ' + memberAvatarBorderClass(user?.gender) + ' ' + memberAvatarRingClass(user?.gender)} />
            ) : (
              <Link href="/admin/parametres" title="Paramètres" className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${initialsClass}`}>
                {initials}
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 md:px-6 lg:px-8">
          {pathname.startsWith('/admin/parametres') && <AdminAccountTabs />}
          {children}
        </main>
      </div>
    </div>
  );
}
