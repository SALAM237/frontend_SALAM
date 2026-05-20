'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, User, CalendarDays, MessageSquare, ArrowRight, Bell } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { GenderIcon } from '@/components/ui/GenderIcon';
import { useAuthStore } from '@/store/auth.store';
import { formatFirstName, formatFullName } from '@/lib/format-name';

const fadeUp  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function MemberDashboardPage() {
  const { user } = useAuthStore();

  const firstName = formatFirstName(user?.firstName ?? '');
  const lastName  = user?.lastName ?? '';
  const gender    = user?.gender;
  const civility  = gender === 'femme' ? 'Madame' : gender === 'homme' ? 'Monsieur' : null;
  const memberId  = user?._id ? `SALAM-${new Date().getFullYear()}-${user._id.slice(-4).toUpperCase()}` : '—';

  const memberCardData: MemberCardData = {
    id:        memberId,
    firstName: firstName || '—',
    lastName:  lastName  || '—',
    gender,
    role:      'Membre actif',
    year:      new Date().getFullYear(),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      {/* Welcome */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-900 via-[#0b1f15] to-[#061009] p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/50">
              {civility ? `Bienvenue, ${civility}` : 'Bienvenue,'}
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-black tracking-[-0.03em]">
              <GenderIcon gender={gender} size={22} />
              {firstName || lastName ? formatFullName(firstName, lastName) : 'Membre'} 👋
            </h1>
            <p className="mt-1 text-sm text-white/50">Membre actif</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">N° membre</p>
            <p className="font-mono text-sm font-bold text-emerald-400">{memberId}</p>
          </div>
        </div>
        <div className="mt-4 h-px bg-white/[0.08]" />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/member/carte" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-500 px-5 text-xs font-black text-white hover:bg-emerald-400 transition-all">
            <CreditCard size={13} /> Ma carte membre
          </Link>
          <Link href="/member/activites" className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold text-white/70 hover:border-white/30 hover:text-white transition-all">
            <CalendarDays size={13} /> Voir les activités
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Activités inscrites', value: '—', icon: CalendarDays, href: '/member/activites', color: 'bg-blue-50 text-blue-700'       },
          { label: 'Messages non lus',    value: '—', icon: MessageSquare, href: '/member/messages', color: 'bg-red-50 text-red-700'         },
          { label: 'Mon profil',          value: '—', icon: User,          href: '/member/profil',   color: 'bg-yellow-50 text-yellow-700'   },
          { label: 'Ma carte',            value: '✓', icon: CreditCard,    href: '/member/carte',    color: 'bg-emerald-50 text-emerald-700' },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <motion.div key={label} variants={fadeUp}>
            <Link href={href} className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-black leading-none tracking-[-0.05em] text-neutral-900">{value}</p>
                <p className="mt-1 text-xs font-semibold text-neutral-500">{label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">

        {/* Activités à venir */}
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="font-black text-neutral-900">Prochaines activités</h2>
            <Link href="/member/activites" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
              Toutes <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <CalendarDays size={28} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">Aucune activité à venir</p>
            <p className="mt-1 text-xs">Les activités publiées apparaîtront ici.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Mini carte */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-neutral-900">Ma carte membre</p>
              <Link href="/member/carte" className="text-xs font-bold text-emerald-600 hover:underline">
                Voir <ArrowRight className="inline" size={10} />
              </Link>
            </div>
            <div className="mx-auto" style={{ maxWidth: 288 }}>
              <MemberCard member={memberCardData} />
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Bell size={14} className="text-neutral-500" />
              <p className="text-sm font-black text-neutral-900">Notifications</p>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-neutral-400">
              <Bell size={22} className="mb-2 opacity-20" />
              <p className="text-xs font-semibold">Aucune notification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
