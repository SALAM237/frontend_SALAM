'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, CreditCard, CalendarDays, TrendingUp, Activity,
  ArrowRight, CheckCircle2, Clock, XCircle, ShieldCheck, MessageSquare, Sparkles, AlertTriangle,
} from 'lucide-react';
import { useAdminStats } from '@/lib/api/dashboard';
import { usePendingValidations } from '@/lib/api/validations';
import { useAuthStore } from '@/store/auth.store';
import { formatFirstName, formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const QUICK_ACTIONS = [
  { label: 'Nouveau membre',    href: '/admin/adherents/nouveau', icon: UserPlus,     desc: 'Créer une fiche adhérent',       color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 hover:border-emerald-200' },
  { label: 'Émettre une carte', href: '/admin/cartes',           icon: CreditCard,   desc: 'Générer une carte membre + QR',  color: 'bg-blue-50 hover:bg-blue-100 border-blue-100 hover:border-blue-200'             },
  { label: 'Voir les adhérents',href: '/admin/adherents',        icon: Users,        desc: 'Gérer la liste des membres',     color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100 hover:border-yellow-200'     },
  { label: 'Activités',         href: '/admin/activites',        icon: CalendarDays, desc: 'Gérer les événements',           color: 'bg-purple-50 hover:bg-purple-100 border-purple-100 hover:border-purple-200'     },
];

const statusStyle: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  active:    { label: 'Inscrit',                 cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  pending:   { label: 'Inscription en attente',  cls: 'bg-yellow-50 text-yellow-700',   icon: Clock        },
  suspended: { label: 'Suspendu',                cls: 'bg-red-50 text-red-700',         icon: XCircle      },
  rejected:  { label: 'Refusé',                  cls: 'bg-neutral-50 text-neutral-500', icon: XCircle      },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminDashboardPage() {
  const { data: statsRes, isLoading } = useAdminStats();
  const { data: pendingRes } = usePendingValidations();
  const { user } = useAuthStore();
  const stats = statsRes?.data;
  const pendingTotal = pendingRes?.data?.total ?? 0;

  const statCards = [
    { label: 'Adherents actifs', value: stats?.members.active ?? 0, detail: stats ? stats.members.total + ' au total' : '-', icon: Users, color: 'bg-emerald-100 text-emerald-700', href: '/admin/adherents?status=active' },
    { label: 'Nouvelles demandes', value: stats?.requests.pending ?? 0, detail: 'A valider', icon: UserPlus, color: 'bg-blue-100 text-blue-700', href: '/admin/validations' },
    { label: 'Cotisations en attente', value: stats?.cotisations.pendingInvoices ?? 0, detail: 'Echeance a venir', icon: Clock, color: 'bg-amber-100 text-amber-700', href: '/admin/facturation?payment=pending' },
    { label: 'Cotisations impayees', value: stats?.cotisations.overdueInvoices ?? 0, detail: 'Echeance depassee', icon: AlertTriangle, color: 'bg-red-100 text-red-700', href: '/admin/facturation?payment=overdue' },
    { label: 'Cotisations payees', value: stats?.cotisations.paid ?? 0, detail: String(stats?.cotisations.year ?? ''), icon: CreditCard, color: 'bg-yellow-100 text-yellow-700', href: '/admin/cotisations?status=paid' },
    { label: 'Messages non lus', value: stats?.messages.unread ?? 0, detail: 'A consulter', icon: MessageSquare, color: 'bg-cyan-100 text-cyan-700', href: '/admin/messages?unread=1' },
    { label: 'Activites a venir', value: stats?.activities.upcoming ?? 0, detail: 'Programmees', icon: CalendarDays, color: 'bg-violet-100 text-violet-700', href: '/admin/activites?period=upcoming' },
    { label: 'Recommandations IA', value: stats?.recommendations.unread ?? 0, detail: 'Non consultees', icon: Sparkles, color: 'bg-fuchsia-100 text-fuchsia-700', href: '/admin/assistant-ia' },
  ];
  const recentMembers = stats?.recentMembers ?? [];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Tableau de bord</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Bienvenue{user ? `, ${formatFirstName(user.firstName)}` : ''}<span className="hidden sm:inline"> · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pendingTotal > 0 && (
            <Link href="/admin/validations" className="inline-flex h-9 items-center gap-2 rounded-full bg-amber-500 px-4 text-sm font-black text-white transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20">
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Validation en attente</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{pendingTotal}</span>
            </Link>
          )}
          <Link href="/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20">
            <UserPlus size={14} /> <span className="hidden sm:inline">Nouveau membre</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-8">
        {statCards.map(({ label, value, detail, icon: Icon, color, href }) => (
          <motion.div key={label} variants={fadeUp}>
            <Link href={href}
              className="flex h-[112px] min-w-0 flex-col justify-between rounded-lg border border-neutral-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:h-[122px] lg:h-[136px] lg:p-3">
              <div className={'flex h-8 w-8 items-center justify-center rounded-lg ' + color}><Icon size={15} /></div>
              <div className="min-w-0 text-right">
                <p className="text-2xl font-black leading-none text-neutral-900 lg:text-[1.75rem]">{isLoading ? '...' : value}</p>
                <p className="mt-1 line-clamp-2 min-h-7 text-[10px] font-bold leading-3.5 text-neutral-600">{label}</p>
                <p className="mt-0.5 truncate text-[9px] text-neutral-400">{detail}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

        {/* Adhérents récents */}
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="font-black text-neutral-900">Derniers adhérents</h2>
            <Link href="/admin/adherents" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
              Voir tous <ArrowRight size={11} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            {recentMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <Users size={28} className="mb-3 opacity-30" />
                <p className="text-sm font-semibold">Aucun adhérent pour le moment</p>
                <p className="mt-1 text-xs">Les nouveaux membres apparaîtront ici.</p>
              </div>
            ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-50 bg-neutral-50/50">
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Membre</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">N° ID</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Statut</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {recentMembers.map((m) => {
                  const s = statusStyle[m.memberStatus] ?? statusStyle.pending;
                  const StatusIcon = s.icon;
                  return (
                    <tr key={m._id} className="group transition-colors hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/adherents/${m._id}`} className="shrink-0">
                            {memberPhotoUrl(m) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={memberPhotoUrl(m)} alt={formatFullName(m.firstName, m.lastName)} className={`h-8 w-8 rounded-full border-2 object-cover ${memberAvatarBorderClass((m as any).gender)}`} />
                            ) : (
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${memberInitialsClass((m as any).gender)}`}>
                                {formatInitials(m.firstName, m.lastName)}
                              </div>
                            )}
                          </Link>
                          <Link href={`/admin/adherents/${m._id}`} className="font-semibold text-neutral-900 transition hover:text-emerald-700">{formatFullName(m.firstName, m.lastName)}</Link>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-neutral-500">{m.memberId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${s.cls}`}>
                          <StatusIcon size={10} /> {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-neutral-400">{fmt(m.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/adherents/${m._id}`} className="text-xs font-bold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-emerald-700">
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-neutral-50 sm:hidden">
            {recentMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <p className="text-sm">Aucun adhérent pour le moment</p>
              </div>
            ) : recentMembers.map((m) => {
              const s = statusStyle[m.memberStatus] ?? statusStyle.pending;
              return (
                <div key={m._id} className="flex items-center gap-3 px-4 py-3.5">
                  {memberPhotoUrl(m) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={memberPhotoUrl(m)} alt={formatFullName(m.firstName, m.lastName)} className={`h-10 w-10 shrink-0 rounded-full border-2 object-cover ${memberAvatarBorderClass((m as any).gender)}`} />
                  ) : (
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${memberInitialsClass((m as any).gender)}`}>
                      {formatInitials(m.firstName, m.lastName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900">{formatFullName(m.firstName, m.lastName)}</p>
                    <p className="text-xs text-neutral-400">{m.memberId}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions + Activity */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-black text-neutral-900">Actions rapides</h2>
            <div className="flex flex-col gap-2">
              {QUICK_ACTIONS.map(({ label, href, icon: Icon, desc, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm ${color}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/60 shadow-sm">
                    <Icon size={16} className="text-neutral-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-neutral-900">{label}</p>
                    <p className="text-[11px] text-neutral-500">{desc}</p>
                  </div>
                  <ArrowRight size={14} className="shrink-0 text-neutral-400" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-emerald-600" />
              <h2 className="font-black text-neutral-900">Activité récente</h2>
            </div>
            <div className="mt-4 flex flex-col items-center justify-center py-4 text-center text-neutral-400">
              <p className="text-xs font-semibold">Aucune activité récente</p>
              <p className="mt-0.5 text-[10px]">Les actions admin apparaîtront ici.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
