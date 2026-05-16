'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, User, CalendarDays, MessageSquare, ArrowRight, CheckCircle2, Bell } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';

const MOCK_MEMBER: MemberCardData = {
  id: 'SALAM-2024-0042',
  firstName: 'Jean',
  lastName: 'Kamga',
  role: 'Membre actif',
  antenne: 'Paris',
  year: new Date().getFullYear(),
};

const fadeUp  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const UPCOMING = [
  { title: 'Soirée Networking SALAM',    date: '22 mai 2025',  lieu: 'Paris · Maison du Cameroun', status: 'inscrit' },
  { title: 'Atelier Leadership Jeunesse', date: '7 juin 2025',  lieu: 'En ligne (Zoom)',           status: 'ouvert'  },
  { title: 'AG Annuelle 2025',            date: '28 juin 2025', lieu: 'Paris · Salle des fêtes',   status: 'bientot' },
];

const NOTIFICATIONS = [
  { text: 'Votre carte de membre est disponible',   time: 'Il y a 2h',  read: false },
  { text: 'Nouvelle activité : Soirée Networking',  time: 'Il y a 1j',  read: false },
  { text: 'Bienvenue dans l\'espace membre SALAM !', time: 'Il y a 3j', read: true  },
];

export default function MemberDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">

      {/* Welcome */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-900 via-[#0b1f15] to-[#061009] p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/50">Bienvenue,</p>
            <h1 className="text-2xl font-black tracking-[-0.03em]">{MOCK_MEMBER.firstName} {MOCK_MEMBER.lastName} 👋</h1>
            <p className="mt-1 text-sm text-white/50">{MOCK_MEMBER.role} · Antenne {MOCK_MEMBER.antenne}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">N° membre</p>
            <p className="font-mono text-sm font-bold text-emerald-400">{MOCK_MEMBER.id}</p>
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
          { label: 'Activités inscrites', value: '3',  icon: CalendarDays, href: '/member/activites', color: 'bg-blue-50 text-blue-700'      },
          { label: 'Messages non lus',    value: '2',  icon: MessageSquare, href: '/member/messages', color: 'bg-red-50 text-red-700'        },
          { label: 'Mon profil',          value: '80%',icon: User,          href: '/member/profil',   color: 'bg-yellow-50 text-yellow-700'  },
          { label: 'Ma carte',            value: '✓',  icon: CreditCard,    href: '/member/carte',    color: 'bg-emerald-50 text-emerald-700' },
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
          <div className="divide-y divide-neutral-50">
            {UPCOMING.map(({ title, date, lieu, status }) => (
              <div key={title} className="flex items-start gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 text-center">
                  <p className="text-[10px] font-black text-emerald-600">{date.split(' ')[1]}</p>
                  <p className="text-base font-black leading-none text-emerald-700">{date.split(' ')[0]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900">{title}</p>
                  <p className="text-xs text-neutral-400">{lieu}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                  status === 'inscrit' ? 'bg-emerald-50 text-emerald-700' :
                  status === 'ouvert'  ? 'bg-blue-50 text-blue-700' :
                  'bg-neutral-50 text-neutral-500'
                }`}>
                  {status === 'inscrit' ? '✓ Inscrit' : status === 'ouvert' ? 'Inscription ouverte' : 'Bientôt'}
                </span>
              </div>
            ))}
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
            <div className="flex justify-center overflow-x-auto" style={{ transform: 'scale(0.72)', transformOrigin: 'top center', height: 180 }}>
              <MemberCard member={MOCK_MEMBER} />
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Bell size={14} className="text-neutral-500" />
              <p className="text-sm font-black text-neutral-900">Notifications</p>
            </div>
            <ul className="space-y-3">
              {NOTIFICATIONS.map(({ text, time, read }, i) => (
                <li key={i} className={`flex items-start gap-3 ${read ? 'opacity-50' : ''}`}>
                  <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${read ? 'bg-neutral-300' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="text-xs font-semibold text-neutral-700">{text}</p>
                    <p className="text-[10px] text-neutral-400">{time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
