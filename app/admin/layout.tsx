'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserPlus, CreditCard, CalendarDays,
  Images, Newspaper, Settings, LogOut, Menu, X, ChevronRight, Bell,
  Banknote, FileText, History,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/lib/api/client';

const NAV = [
  { label: 'Tableau de bord',   href: '/admin/dashboard',         icon: LayoutDashboard },
  { label: 'Adhérents',         href: '/admin/adherents',         icon: Users },
  { label: 'Nouveau membre',    href: '/admin/adherents/nouveau', icon: UserPlus },
  { label: 'Cartes membres',    href: '/admin/cartes',            icon: CreditCard },
  { label: "Frais d'adhésion",  href: '/admin/cotisations',       icon: Banknote },
  { label: 'Facturation',       href: '/admin/facturation',       icon: FileText },
  { label: 'Activités',         href: '/admin/activites',         icon: CalendarDays },
  { label: 'Galerie',           href: '/admin/galerie',           icon: Images },
  { label: 'Actualités',        href: '/admin/actualites',        icon: Newspaper },
  { label: 'Historique',        href: '/admin/historique',        icon: History },
  { label: 'Paramètres',        href: '/admin/parametres',        icon: Settings },
];

function AdminSidebar({ open, onClose, initials, displayName, adminRole, onLogout }: {
  open: boolean; onClose: () => void;
  initials: string; displayName: string; adminRole: string;
  onLogout: () => void;
}) {
  const pathname = usePathname();

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
      >
        {/* Flag stripe */}
        <div className="h-[4px] w-full shrink-0" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/logo_salam_wbg.png" alt="SALAM" className="h-9 w-9 rounded-full object-cover ring-1 ring-emerald-500/30" />
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
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-black text-white/80">{displayName}</p>
              <p className="truncate text-[10px] text-white/30">{adminRole}</p>
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
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = async () => {
    try { await apiClient('/api/v1/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    clearAuth();
    router.push('/bureau-executif/connexion');
  };

  const currentPage = NAV.find(n => n.href === pathname || (n.href !== '/admin/dashboard' && pathname.startsWith(n.href)));
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'A';
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Administrateur';
  const adminRole = user?.roles.find(r => ['admin', 'super_admin'].includes(r.slug))?.name ?? 'Admin';

  return (
    <div className="flex min-h-screen bg-[#f4f6f5]">
      <AdminSidebar
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        initials={initials} displayName={displayName} adminRole={adminRole}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-neutral-200/80 bg-white/95 px-5 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700 lg:hidden"
          >
            <Menu size={16} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-neutral-400">Admin</span>
            {currentPage && (
              <>
                <ChevronRight size={13} className="text-neutral-300" />
                <span className="font-black text-neutral-800">{currentPage.label}</span>
              </>
            )}
          </div>

          {/* Right */}
          <div className="ml-auto flex items-center gap-3">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700">
              <Bell size={15} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
