'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, User, CalendarDays, MessageSquare, ArrowRight, Bell } from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { GenderIcon } from '@/components/ui/GenderIcon';
import { DemoPortalShell } from '../_components/DemoShell';
import { demoMemberProfile } from '@/data/demo/demo-portal';

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function DemoMemberDashboard() {
  const firstName = demoMemberProfile.firstName;
  const lastName = demoMemberProfile.lastName;
  const gender: 'femme' = 'femme';
  const civility = 'Madame';
  const memberId = demoMemberProfile.id;

  const memberCardData: MemberCardData = {
    id: memberId,
    firstName,
    lastName,
    gender,
    role: 'Membre actif',
    antenne: demoMemberProfile.antenne,
    year: new Date().getFullYear(),
  };

  return (
    <DemoPortalShell type="member" title="Mon espace">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-900 via-[#0b1f15] to-[#061009] p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/50">Bienvenue, {civility}</p>
              <h1 className="flex items-center gap-2 text-2xl font-black tracking-[-0.03em]">
                <GenderIcon gender={gender} size={22} />
                {firstName} {lastName}
              </h1>
              <p className="mt-1 text-sm text-white/50">Membre actif</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">No membre</p>
              <p className="font-mono text-sm font-bold text-emerald-400">{memberId}</p>
            </div>
          </div>
          <div className="mt-4 h-px bg-white/[0.08]" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/demo/member/carte" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-500 px-5 text-xs font-black text-white transition-all hover:bg-emerald-400">
              <CreditCard size={13} /> Ma carte membre
            </Link>
            <Link href="/demo/member/activites" className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white">
              <CalendarDays size={13} /> Voir les activites
            </Link>
          </div>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Activites inscrites', value: '3', icon: CalendarDays, href: '/demo/member/activites', color: 'bg-blue-50 text-blue-700' },
            { label: 'Messages non lus', value: '1', icon: MessageSquare, href: '/demo/member/messages', color: 'bg-red-50 text-red-700' },
            { label: 'Mon profil', value: 'OK', icon: User, href: '/demo/member/profil', color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Ma carte', value: 'OK', icon: CreditCard, href: '/demo/member/carte', color: 'bg-emerald-50 text-emerald-700' },
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
          <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 className="font-black text-neutral-900">Prochaines activites</h2>
              <Link href="/demo/member/activites" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                Toutes <ArrowRight size={11} />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <CalendarDays size={28} className="mb-3 opacity-30" />
              <p className="text-sm font-semibold">3 activites demo a venir</p>
              <p className="mt-1 text-xs">Les activites publiees apparaissent ici.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black text-neutral-900">Ma carte membre</p>
                <Link href="/demo/member/carte" className="text-xs font-bold text-emerald-600 hover:underline">
                  Voir <ArrowRight className="inline" size={10} />
                </Link>
              </div>
              <div className="mx-auto" style={{ maxWidth: 288 }}>
                <MemberCard member={memberCardData} />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Bell size={14} className="text-neutral-500" />
                <p className="text-sm font-black text-neutral-900">Notifications</p>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-neutral-400">
                <Bell size={22} className="mb-2 opacity-20" />
                <p className="text-xs font-semibold">Aucune notification reelle</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoPortalShell>
  );
}
