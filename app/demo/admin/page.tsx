'use client';

import Link from 'next/link';
import {
  LayoutDashboard, Users, Calendar, MessageSquare,
  Images, Settings, Shield, Clock, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/demo/admin',           icon: LayoutDashboard },
  { label: 'Adhérents',       href: '/demo/admin/adherents', icon: Users           },
  { label: 'Activités',       href: '/demo/admin/activites', icon: Calendar        },
  { label: 'Messages',        href: '/demo/admin/messages',  icon: MessageSquare   },
  { label: 'Galerie',         href: '/demo/admin/galerie',   icon: Images          },
  { label: 'Rôles & Accès',   href: '/demo/admin/roles',     icon: Shield          },
  { label: 'Paramètres',      href: '/demo/admin/settings',  icon: Settings        },
];

const STATS = [
  { label: 'Membres actifs', value: '47', sub: '+3 ce mois',   colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', icon: Users         },
  { label: 'En attente',     value: '3',  sub: 'À valider',    colorClass: 'text-amber-600',   bgClass: 'bg-amber-50',   icon: Clock         },
  { label: 'Activités',      value: '12', sub: 'Ce trimestre', colorClass: 'text-blue-600',    bgClass: 'bg-blue-50',    icon: Calendar      },
  { label: 'Messages',       value: '8',  sub: 'Non lus',      colorClass: 'text-red-500',     bgClass: 'bg-red-50',     icon: MessageSquare },
];

const RECENT_MEMBERS = [
  { name: 'Amina Diallo',     email: 'amina.d@email.com',    status: 'active',  cotis: 'paid',    date: '12/05/2024' },
  { name: 'Boris Tamko',      email: 'b.tamko@email.com',    status: 'pending', cotis: 'pending', date: '08/05/2024' },
  { name: 'Youssef Mansouri', email: 'y.mansouri@email.com', status: 'active',  cotis: 'paid',    date: '02/05/2024' },
  { name: 'Sophie Nkolo',     email: 's.nkolo@email.com',    status: 'active',  cotis: 'exempt',  date: '28/04/2024' },
  { name: 'Pierre Nguemo',    email: 'p.nguemo@email.com',   status: 'pending', cotis: 'unpaid',  date: '25/04/2024' },
];

const STATUS_STYLE: Record<string, string> = {
  active:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50   text-amber-700   border-amber-200',
};
const STATUS_LABEL: Record<string, string>  = { active: 'Actif', pending: 'En attente' };
const COTIS_STYLE:  Record<string, string>  = {
  paid:    'bg-emerald-50 text-emerald-700',
  unpaid:  'bg-red-50 text-red-600',
  exempt:  'bg-blue-50 text-blue-700',
  pending: 'bg-neutral-100 text-neutral-500',
};
const COTIS_LABEL: Record<string, string> = { paid: 'À jour', unpaid: 'Impayé', exempt: 'Exempté', pending: '—' };

export default function DemoAdminDashboard() {
  return (
    <div className="flex min-h-[calc(100vh-40px)] bg-[#f4f6f5]">

      {/* Sidebar — visible lg+ */}
      <aside className="hidden w-56 shrink-0 flex-col bg-gradient-to-b from-[#07140d] via-[#0b1f15] to-[#061009] lg:flex">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700">
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-white">SALAM</p>
            <p className="text-[9px] font-semibold tracking-widest text-white/35">ADMIN DÉMO</p>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all mb-0.5 ${
                href === '/demo/admin'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
              }`}>
              <Icon size={14} className={href === '/demo/admin' ? 'text-emerald-400' : 'text-white/30'} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white">LV</div>
            <div>
              <p className="text-xs font-black text-white/80">Lionel VICK</p>
              <p className="text-[9px] text-white/30">Super Admin · Démo</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-neutral-200/80 bg-white/95 px-5">
          <h2 className="font-black text-neutral-800">Tableau de bord</h2>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white">LV</div>
        </header>

        <main className="p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${s.bgClass}`}>
                  <s.icon size={16} className={s.colorClass} />
                </div>
                <p className="text-2xl font-black text-neutral-900">{s.value}</p>
                <p className="text-xs font-semibold text-neutral-500">{s.label}</p>
                <p className={`mt-0.5 text-[10px] font-semibold ${s.colorClass}`}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent members */}
          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
              <p className="text-sm font-black text-neutral-900">Adhérents récents</p>
              <Link href="/demo/admin/adherents" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Voir tout <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-neutral-50">
              {RECENT_MEMBERS.map(m => (
                <div key={m.email} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                    {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{m.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{m.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${STATUS_STYLE[m.status]}`}>
                    {STATUS_LABEL[m.status]}
                  </span>
                  <span className={`hidden sm:inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${COTIS_STYLE[m.cotis]}`}>
                    {COTIS_LABEL[m.cotis]}
                  </span>
                  <span className="hidden md:block shrink-0 text-xs text-neutral-400">{m.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile quick links */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {NAV_ITEMS.filter(n => n.href !== '/demo/admin').map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-200">
                <Icon size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-neutral-700">{label}</span>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
