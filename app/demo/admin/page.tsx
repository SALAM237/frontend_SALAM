'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, CreditCard, CalendarDays, TrendingUp, Activity,
  ArrowRight, MoreHorizontal, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { DemoPortalShell } from '../_components/DemoShell';
import { demoMembers } from '@/data/demo/demo-members';
import { demoCotisations } from '@/data/demo/demo-portal';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const QUICK_ACTIONS = [
  { label: 'Nouveau membre', href: '/demo/admin/adherents/nouveau', icon: UserPlus, desc: 'Creer une fiche adherent', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 hover:border-emerald-200' },
  { label: 'Emettre une carte', href: '/demo/admin/cartes', icon: CreditCard, desc: 'Generer une carte membre + QR', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100 hover:border-blue-200' },
  { label: 'Voir les adherents', href: '/demo/admin/adherents', icon: Users, desc: 'Gerer la liste des membres', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100 hover:border-yellow-200' },
  { label: 'Activites', href: '/demo/admin/activites', icon: CalendarDays, desc: 'Gerer les evenements', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100 hover:border-purple-200' },
];

const statusStyle: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  active: { label: 'Actif', cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  pending: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700', icon: Clock },
  suspended: { label: 'Suspendu', cls: 'bg-red-50 text-red-700', icon: XCircle },
  rejected: { label: 'Refuse', cls: 'bg-neutral-50 text-neutral-500', icon: XCircle },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DemoAdminDashboard() {
  const active = demoMembers.filter(member => member.memberStatus === 'active').length;
  const pending = demoMembers.filter(member => member.memberStatus === 'pending').length;
  const paid = demoCotisations.filter(item => item.status === 'paid').length;

  const statCards = [
    { label: 'Adherents actifs', value: String(active), delta: `${demoMembers.length} au total`, icon: Users, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Nouvelles demandes', value: String(pending), delta: 'En attente de validation', icon: UserPlus, color: 'bg-blue-100 text-blue-700' },
    { label: 'Cotisations payees', value: String(paid), delta: '2026', icon: CreditCard, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Activites a venir', value: '3', delta: 'Donnees fictives', icon: CalendarDays, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <DemoPortalShell type="admin" title="Tableau de bord">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-[-0.03em] text-neutral-900 sm:text-2xl">Tableau de bord</h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              Bienvenue, Nadia<span className="hidden sm:inline"> - {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </p>
          </div>
          <Link href="/demo/admin/adherents/nouveau" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20">
            <UserPlus size={14} /> <span className="hidden sm:inline">Nouveau membre</span>
          </Link>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(({ label, value, delta, icon: Icon, color }) => (
            <motion.div key={label} variants={fadeUp} className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={18} />
                </div>
                <MoreHorizontal size={16} className="text-neutral-300" />
              </div>
              <div>
                <p className="text-[2rem] font-black leading-none tracking-[-0.05em] text-neutral-900">{value}</p>
                <p className="mt-1 text-xs font-semibold text-neutral-500">{label}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-600">{delta}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 className="font-black text-neutral-900">Derniers adherents</h2>
              <Link href="/demo/admin/adherents" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                Voir tous <ArrowRight size={11} />
              </Link>
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-50 bg-neutral-50/50">
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Membre</th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">No ID</th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Statut</th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {demoMembers.map((member) => {
                    const s = statusStyle[member.memberStatus] ?? statusStyle.pending;
                    const StatusIcon = s.icon;
                    return (
                      <tr key={member._id} className="group transition-colors hover:bg-neutral-50/50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white">
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <p className="font-semibold text-neutral-900">{member.firstName} {member.lastName}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><span className="font-mono text-xs text-neutral-500">{member.memberId}</span></td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${s.cls}`}>
                            <StatusIcon size={10} /> {s.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-neutral-400">{fmt(member.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <Link href={`/demo/admin/adherents/${member._id}`} className="text-xs font-bold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-emerald-700">
                            Voir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-neutral-50 sm:hidden">
              {demoMembers.map((member) => {
                const s = statusStyle[member.memberStatus] ?? statusStyle.pending;
                return (
                  <div key={member._id} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-sm font-black text-white">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-neutral-900">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-neutral-400">{member.memberId}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${s.cls}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-black text-neutral-900">Actions rapides</h2>
              <div className="flex flex-col gap-2">
                {QUICK_ACTIONS.map(({ label, href, icon: Icon, desc, color }) => (
                  <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm ${color}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/60 shadow-sm">
                      <Icon size={16} className="text-neutral-700" />
                    </div>
                    <div className="min-w-0 flex-1">
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
                <h2 className="font-black text-neutral-900">Activite recente</h2>
              </div>
              <div className="mt-4 flex flex-col items-center justify-center py-4 text-center text-neutral-400">
                <p className="text-xs font-semibold">Aucune activite reelle</p>
                <p className="mt-0.5 text-[10px]">Les actions demo restent locales.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoPortalShell>
  );
}
