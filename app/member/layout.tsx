'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CreditCard, User, CalendarDays,
  MessageSquare, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react';

const NAV = [
  { label: 'Mon espace',   href: '/member/dashboard', icon: LayoutDashboard },
  { label: 'Ma carte',     href: '/member/carte',     icon: CreditCard       },
  { label: 'Mon profil',   href: '/member/profil',    icon: User             },
  { label: 'Activités',    href: '/member/activites', icon: CalendarDays     },
  { label: 'Messages',     href: '/member/messages',  icon: MessageSquare    },
];

const MOCK_MEMBER = { firstName: 'Jean', lastName: 'Kamga', id: 'SALAM-2024-0042', role: 'Membre actif' };

function MemberSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      >
        {/* Flag stripe */}
        <div className="h-[4px] w-full shrink-0" style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/logo_salam_wbg.png" alt="SALAM" className="h-9 w-9 rounded-full object-cover ring-1 ring-emerald-500/30" />
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
          <p className="mt-1 text-sm font-black text-white">{MOCK_MEMBER.firstName} {MOCK_MEMBER.lastName}</p>
          <p className="text-[10px] text-white/35">{MOCK_MEMBER.id}</p>
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
              {MOCK_MEMBER.firstName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-black text-white/80">{MOCK_MEMBER.firstName} {MOCK_MEMBER.lastName}</p>
              <p className="truncate text-[10px] text-white/30">{MOCK_MEMBER.role}</p>
            </div>
            <Link href="/" className="text-white/25 transition-colors hover:text-red-400" title="Déconnexion">
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const currentPage = NAV.find(n => n.href === pathname);

  return (
    <div className="flex min-h-screen bg-[#f4f6f5]">
      <MemberSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-neutral-200/80 bg-white/95 px-5 backdrop-blur-sm">
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
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500">
              <Bell size={15} />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white">
              {MOCK_MEMBER.firstName[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
