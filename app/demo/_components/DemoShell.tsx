'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Banknote, Bell, CalendarDays, ChevronRight, CreditCard, FileText, FolderOpen,
  History, Images, LayoutDashboard, Menu, MessageSquare, Newspaper, Settings,
  Shield, User, Users, X, Globe, LogOut, Bot, BriefcaseBusiness, Handshake,
  Network, ClipboardCheck,
} from 'lucide-react';
import { demoAdminUser, demoMemberProfile } from '@/data/demo/demo-portal';
import { formatFullName } from '@/lib/format-name';

type NavItem = { label: string; href: string; icon: React.ElementType };

const adminNav: NavItem[] = [
  { label: 'Tableau de bord', href: '/demo/admin', icon: LayoutDashboard },
  { label: 'Assistant IA', href: '/demo/admin/assistant-ia', icon: Bot },
  { label: 'Adherents', href: '/demo/admin/adherents', icon: Users },
  { label: "Frais d'adhesion", href: '/demo/admin/cotisations', icon: Banknote },
  { label: 'Facturation', href: '/demo/admin/facturation', icon: FileText },
  { label: 'Tresorerie', href: '/demo/admin/tresorerie', icon: Banknote },
  { label: 'IDP / ISP', href: '/demo/admin/idp-isp', icon: Handshake },
  { label: 'Validations', href: '/demo/admin/validations', icon: ClipboardCheck },
  { label: 'Opportunites', href: '/demo/admin/opportunites', icon: BriefcaseBusiness },
  { label: 'Networking', href: '/demo/admin/networking', icon: Network },
  { label: 'Bureau', href: '/demo/admin/bureau', icon: Users },
  { label: 'Activites', href: '/demo/admin/activites', icon: CalendarDays },
  { label: 'Galerie', href: '/demo/admin/galerie', icon: Images },
  { label: 'Actualites', href: '/demo/admin/actualites', icon: Newspaper },
  { label: 'Messages', href: '/demo/admin/messages', icon: MessageSquare },
  { label: 'Historique', href: '/demo/admin/historique', icon: History },
  { label: 'Roles & Acces', href: '/demo/admin/roles', icon: Shield },
  { label: 'Parametres', href: '/demo/admin/parametres', icon: Settings },
];

const memberNav: NavItem[] = [
  { label: 'Mon espace', href: '/demo/member', icon: LayoutDashboard },
  { label: 'Ma carte', href: '/demo/member/carte', icon: CreditCard },
  { label: 'Mon profil', href: '/demo/member/profil', icon: User },
  { label: 'Bureau', href: '/demo/member/bureau', icon: Users },
  { label: 'Cotisations', href: '/demo/member/cotisations', icon: Banknote },
  { label: 'Mes factures', href: '/demo/member/factures', icon: FileText },
  { label: 'Mes documents', href: '/demo/member/documents', icon: FolderOpen },
  { label: 'Tresorerie', href: '/demo/member/tresorerie', icon: Banknote },
  { label: 'Opportunites', href: '/demo/member/opportunites', icon: BriefcaseBusiness },
  { label: 'Networking', href: '/demo/member/networking', icon: Network },
  { label: 'Activites', href: '/demo/member/activites', icon: CalendarDays },
  { label: 'Galerie', href: '/demo/member/galerie', icon: Images },
  { label: 'Actualites', href: '/demo/member/actualites', icon: Newspaper },
  { label: 'Messages', href: '/demo/member/messages', icon: MessageSquare },
];

function DemoSidebar({ type, nav, open, onClose }: { type: 'admin' | 'member'; nav: NavItem[]; open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const person = type === 'admin' ? demoAdminUser : demoMemberProfile;

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
        <div className="h-[4px] w-full shrink-0" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <Image src="/images/logo/logo_salam_96.webp" alt="SALAM" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-1 ring-emerald-500/30" priority />
          <div>
            <p className="text-sm font-black tracking-[0.16em] text-white">SALAM</p>
            <p className="text-[10px] font-semibold tracking-widest text-white/35">{type === 'admin' ? 'ADMIN DEMO' : 'ESPACE MEMBRE DEMO'}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white/60 lg:hidden">
            <X size={16} />
          </button>
        </div>
        {type === 'member' && (
          <div className="mx-3 my-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400/70">Carte membre</p>
            <p className="mt-1 text-sm font-black text-white">{formatFullName(demoMemberProfile.firstName, demoMemberProfile.lastName)}</p>
            <Link href="/demo/member/carte" onClick={onClose} className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300">
              Voir ma carte <ChevronRight size={10} />
            </Link>
          </div>
        )}
        <nav className={type === 'admin' ? 'flex-1 overflow-y-auto px-3 py-4' : 'flex-1 overflow-y-auto px-3 py-2'}>
          {type === 'admin' && <p className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-white/20">Navigation</p>}
          <ul className="flex flex-col gap-0.5">
            {nav.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== '/demo/admin' && href !== '/demo/member' && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                      active ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]' : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
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
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
              {person.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white/80">{type === 'admin' ? demoAdminUser.name : formatFullName(demoMemberProfile.firstName, demoMemberProfile.lastName)}</p>
              <p className="truncate text-[10px] text-white/30">{type === 'admin' ? demoAdminUser.poste : demoMemberProfile.status}</p>
            </div>
            <Link href="/demo" className="text-white/25 transition-colors hover:text-red-400" title="Quitter la demo">
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export function DemoPortalShell({ type, title, children }: { type: 'admin' | 'member'; title: string; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const nav = type === 'admin' ? adminNav : memberNav;
  const initials = type === 'admin' ? demoAdminUser.initials : demoMemberProfile.initials;
  const label = type === 'admin' ? 'Admin' : 'Espace membre';

  return (
    <div className="flex min-h-screen bg-[#f4f6f5]">
      <DemoSidebar type={type} nav={nav} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky z-20 flex h-14 items-center gap-4 border-b border-neutral-200/80 bg-white/95 px-5 backdrop-blur-sm" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700 lg:hidden"
          >
            <Menu size={16} />
          </button>
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="font-semibold text-neutral-400">{label}</span>
            <ChevronRight size={13} className="text-neutral-300" />
            <span className="truncate font-black text-neutral-800">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/demo"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              <Globe size={13} />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                <Bell size={15} />
                {type === 'admin' && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
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
                      <p className="mt-1 text-xs text-neutral-300">Vous etes a jour !</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white">
              {initials}
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DemoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-neutral-100 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function DemoStatus({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue' | 'neutral' }) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black leading-none ${styles[tone]}`}>{children}</span>;
}

