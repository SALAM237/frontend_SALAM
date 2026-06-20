'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Newspaper,
  ShieldCheck,
} from 'lucide-react';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { GenderIcon } from '@/components/ui/GenderIcon';
import { useAuthStore } from '@/store/auth.store';
import { formatFirstName, formatFullName } from '@/lib/format-name';
import { trackEvent } from '@/lib/analytics';
import { useMemberDashboardKpis } from '@/lib/api/member-dashboard';
import { useMemberActivities } from '@/lib/api/activities';
import { displayMemberNumber } from '@/lib/member-number';

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function MemberDashboardPage() {
  const { user } = useAuthStore();
  const { data: kpiResponse } = useMemberDashboardKpis();
  const { data: activitiesResponse, isLoading: activitiesLoading } = useMemberActivities();
  const kpis = kpiResponse?.data;

  useEffect(() => {
    trackEvent('member_dashboard_view', {
      roles: user?.roles?.map(role => role.slug) ?? [],
      member_status: user?.memberStatus,
    });
  }, [user?.memberStatus, user?.roles]);

  const firstName = formatFirstName(user?.firstName ?? '');
  const lastName = user?.lastName ?? '';
  const gender = user?.gender;
  const civility = gender === 'femme' ? 'Madame' : gender === 'homme' ? 'Monsieur' : null;
  const memberId = displayMemberNumber(user);

  const memberCardData: MemberCardData = {
    id: memberId,
    firstName: firstName || '-',
    lastName: lastName || '-',
    gender,
    role: 'Membre actif',
    year: new Date().getFullYear(),
  };

  const stats = [
    {
      label: 'Opportunites non lues',
      value: kpis?.unreadOpportunities ?? 0,
      icon: BriefcaseBusiness,
      href: '/member/opportunites',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Actualites non lues',
      value: kpis?.unreadNews ?? 0,
      icon: Newspaper,
      href: '/member/actualites',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Messages non lus',
      value: kpis?.unreadMessages ?? 0,
      icon: MessageSquare,
      href: '/member/messages',
      color: 'bg-red-50 text-red-700',
    },
    {
      label: 'Publication en attente',
      value: kpis?.submissions.pending ?? 0,
      icon: ShieldCheck,
      href: '/member/opportunites',
      color: 'bg-emerald-50 text-emerald-700',
      detail: {
        rejected: kpis?.submissions.rejected ?? 0,
        accepted: kpis?.submissions.accepted ?? 0,
      },
    },
  ];
  const now = Date.now();
  const upcomingActivities = (activitiesResponse?.data?.activities ?? [])
    .filter(activity => activity.startDate && new Date(activity.startDate).getTime() >= now)
    .sort((a, b) => new Date(a.startDate ?? 0).getTime() - new Date(b.startDate ?? 0).getTime())
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-900 via-[#0b1f15] to-[#061009] p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/50">
              {civility ? `Bienvenue, ${civility}` : 'Bienvenue,'}
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-black tracking-[-0.03em]">
              <GenderIcon gender={gender} size={22} />
              {firstName || lastName ? formatFullName(firstName, lastName) : 'Membre'}
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
          <Link href="/member/carte" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-500 px-5 text-xs font-black text-white transition-all hover:bg-emerald-400">
            <CreditCard size={13} /> Ma carte membre
          </Link>
          <Link href="/member/activites" className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white">
            <CalendarDays size={13} /> Voir les activites
          </Link>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, color, detail }) => (
          <motion.div key={label} variants={fadeUp}>
            <Link href={href} className="flex h-[168px] w-full flex-col justify-between rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 text-right">
                <p className="text-[2.35rem] font-black leading-[0.9] tracking-[-0.05em] text-neutral-900">{value}</p>
                <p className="mt-3 min-h-[2rem] text-xs font-medium leading-tight text-neutral-500">{label}</p>
                {detail && (
                  <p className="mt-1 flex flex-wrap justify-end gap-x-2 gap-y-1 text-[11px] font-normal leading-snug">
                    <span className="text-red-600">{detail.rejected} refusee{detail.rejected > 1 ? 's' : ''}</span>
                    <span className="text-emerald-700">{detail.accepted} acceptee{detail.accepted > 1 ? 's' : ''}</span>
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="font-black text-neutral-900">Prochaines activites</h2>
            <Link href="/member/activites" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
              Toutes <ArrowRight size={11} />
            </Link>
          </div>
          {activitiesLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <CalendarDays size={28} className="mb-3 opacity-30" />
              <p className="text-sm font-semibold">Chargement des activites...</p>
            </div>
          )}
          {!activitiesLoading && upcomingActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <CalendarDays size={28} className="mb-3 opacity-30" />
              <p className="text-sm font-semibold">Aucune activite a venir</p>
              <p className="mt-1 text-xs">Les activites publiees apparaitront ici.</p>
            </div>
          )}
          {!activitiesLoading && upcomingActivities.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {upcomingActivities.map(activity => (
                <Link key={activity._id} href={`/member/activites/${activity.slug}`} className="flex items-start gap-3 px-5 py-4 transition hover:bg-neutral-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CalendarDays size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-neutral-900">{activity.title}</p>
                    <p className="mt-1 text-xs font-semibold text-neutral-500">
                      {activity.startDate ? new Date(activity.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date a confirmer'}
                      {activity.location ? ` - ${activity.location}` : ''}
                    </p>
                  </div>
                  <ArrowRight size={13} className="mt-1 shrink-0 text-neutral-300" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
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
