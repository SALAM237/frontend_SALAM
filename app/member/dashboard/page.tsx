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
  UserCheck,
  CalendarCheck,
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
    id:        memberId,
    cardVerifyToken: user?.cardVerifyToken,
    firstName: firstName || '-',
    lastName: lastName || '-',
    gender,
    role: 'Membre actif',
    year: new Date().getFullYear(),
  };

  // Calculs activités (avant stats pour éviter les références avant déclaration)
  const now = Date.now();
  const allActivities = activitiesResponse?.data?.activities ?? [];
  const upcomingSorted = allActivities
    .filter(a => a.startDate && new Date(a.startDate).getTime() >= now)
    .sort((a, b) => new Date(a.startDate ?? 0).getTime() - new Date(b.startDate ?? 0).getTime());
  const upcomingActivities = upcomingSorted.slice(0, 3);
  const nextActivity = upcomingSorted[0];
  const pendingRsvpCount = allActivities.filter(a => a.myInvitation?.rsvpStatus === 'pending').length;

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
      label: 'Activités à venir',
      value: upcomingSorted.length,
      icon: CalendarCheck,
      href: '/member/activites',
      color: 'bg-violet-50 text-violet-700',
      subtitle: nextActivity ? `Imminente : ${nextActivity.title}` : undefined,
    },
    {
      label: 'Présences à confirmer',
      value: pendingRsvpCount,
      icon: UserCheck,
      href: '/member/activites',
      color: 'bg-orange-50 text-orange-700',
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
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-900 via-[#0b1f15] to-[#061009] p-3 text-white sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-white/50 sm:text-sm">
            {civility ? `Bienvenue, ${civility}` : 'Bienvenue,'}
          </p>
          <p className="font-mono text-[7px] font-bold text-emerald-400 sm:text-[10px]">{memberId}</p>
        </div>
        <h1 className="mt-0.5 flex items-center gap-1.5 text-base font-black tracking-[-0.03em] sm:mt-1 sm:gap-2 sm:text-2xl">
          <GenderIcon gender={gender} size={16} />
          {firstName || lastName ? formatFullName(firstName, lastName) : 'Membre'}
        </h1>
        <p className="mt-0.5 text-[10px] text-white/50 sm:mt-1 sm:text-sm">Membre actif</p>
        <div className="mt-2 h-px bg-white/[0.08] sm:mt-4" />
        <div className="mt-2 flex gap-2 sm:mt-4 sm:gap-3">
          <Link href="/member/carte" className="inline-flex h-7 items-center gap-1 rounded-full bg-emerald-500 px-3 text-[10px] font-black text-white transition-all hover:bg-emerald-400 sm:h-9 sm:gap-2 sm:px-5 sm:text-xs">
            <CreditCard size={11} /> Ma carte membre
          </Link>
          <Link href="/member/activites" className="inline-flex h-7 items-center gap-1 rounded-full border border-white/15 px-3 text-[10px] font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white sm:h-9 sm:gap-2 sm:px-5 sm:text-xs">
            <CalendarDays size={11} /> Voir les activites
          </Link>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, href, color, detail, subtitle } : any) => (
          <motion.div key={label} variants={fadeUp}>
            <Link href={href} className="flex h-[112px] w-full flex-col justify-between rounded-lg border border-neutral-100 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:h-[122px] lg:h-[136px]">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
                <Icon size={15} />
              </div>
              <div className="min-w-0 text-right">
                <p className="text-2xl font-black leading-none text-neutral-900 lg:text-[1.75rem]">{value}</p>
                <p className="mt-1 line-clamp-2 min-h-[1.5rem] text-[10px] font-bold leading-[14px] text-neutral-500">{label}</p>
                {subtitle && (
                  <p className="mt-0.5 truncate text-[9px] font-semibold leading-snug text-neutral-400" title={subtitle}>{subtitle}</p>
                )}
                {detail && (
                  <p className="mt-0.5 flex flex-wrap justify-end gap-x-1.5 gap-y-0.5 text-[9px] font-normal leading-snug">
                    <span className="text-red-600">{detail.rejected} ref.</span>
                    <span className="text-emerald-700">{detail.accepted} acc.</span>
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
