'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BriefcaseBusiness, CalendarDays, Clock, ExternalLink, Eye,
  Loader2, Mail, MapPin, Phone, Tag, ThumbsUp, X,
} from 'lucide-react';
import { OPPORTUNITY_TYPES, useAdminOpportunities, type OpportunityDoc, type OpportunityStatus } from '@/lib/api/opportunities';
import { formatFullName } from '@/lib/format-name';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { RichText } from '@/components/ui/RichText';
import { useUnreadByHref, useMarkHrefRead } from '@/lib/api/notifications';
import { UnreadCorner } from '@/components/ui/UnreadCorner';

const statusTabs: { value: OpportunityStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Publiées' },
  { value: 'rejected', label: 'Refusées' },
  { value: 'all', label: 'Toutes' },
];

const STATUS_CFG: Record<string, { cls: string; label: string }> = {
  pending:   { cls: 'border-yellow-200 bg-yellow-50 text-yellow-700',   label: 'En attente' },
  published: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', label: 'Publiée'   },
  rejected:  { cls: 'border-red-200 bg-red-50 text-red-700',            label: 'Refusée'   },
  archived:  { cls: 'border-neutral-200 bg-neutral-50 text-neutral-500', label: 'Archivée'  },
  draft:     { cls: 'border-neutral-200 bg-neutral-50 text-neutral-500', label: 'Brouillon' },
};

const typeLabels = Object.fromEntries(OPPORTUNITY_TYPES.map(type => [type.value, type.label]));

function fmtDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isExpiringSoon(expiresAt?: string) {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 3600 * 1000;
}

function isExpired(expiresAt?: string) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export default function AdminOpportunitesPage() {
  const [status, setStatus] = useState<OpportunityStatus | 'all'>('pending');
  const [viewOpportunity, setViewOpportunity] = useState<OpportunityDoc | null>(null);
  const opportunities = useAdminOpportunities(status);
  const items         = opportunities.data?.data?.items ?? [];
  const unreadHrefs   = useUnreadByHref('admin');
  const markHrefRead  = useMarkHrefRead('admin');

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Opportunités</h1>
          <p className="mt-1 text-sm text-neutral-500">Suivi des offres, partenariats et projets soumis par les membres.</p>
        </div>
        <Link href="/admin/validations" className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700">
          <ExternalLink size={14} /> Validations en attente
        </Link>
      </div>

      <AnimatedTabBar items={statusTabs} value={status} onChange={setStatus} />

      {opportunities.isLoading && (
        <div className="flex flex-col items-center py-16">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
          <p className="mt-3 text-sm text-neutral-400">Chargement...</p>
        </div>
      )}

      {!opportunities.isLoading && items.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white px-5 py-16 text-center shadow-sm">
          <BriefcaseBusiness size={36} className="mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-400">Aucune opportunité dans cette vue.</p>
        </div>
      )}

      {!opportunities.isLoading && items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(item => {
            const statusCfg = STATUS_CFG[item.status] ?? STATUS_CFG.draft;
            const expired   = isExpired(item.expiresAt);
            const expiring  = !expired && isExpiringSoon(item.expiresAt);
            const isUnread  = [...unreadHrefs].some(h => h.includes(item.slug ?? item._id));
            return (
              <article key={item._id} className="relative flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                {isUnread && <UnreadCorner />}
                {/* Header bloc */}
                <div className="border-b border-neutral-50 bg-gradient-to-br from-emerald-800 to-emerald-950 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white/80">
                      {typeLabels[item.type] ?? item.type}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${statusCfg.cls}`}>
                      {statusCfg.label}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black ${item.visibility === 'public' ? 'border-blue-200/50 bg-blue-500/20 text-blue-200' : 'border-violet-200/50 bg-violet-500/20 text-violet-200'}`}>
                      {item.visibility === 'public' ? 'Public' : 'Membres'}
                    </span>
                  </div>
                  <h2 className="text-sm font-black leading-snug text-white line-clamp-2">
                    <RichText value={item.title} />
                  </h2>
                  {item.organization && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-white/60">
                      <BriefcaseBusiness size={10} /> {item.organization}
                    </p>
                  )}
                </div>

                {/* Body bloc */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <p className="line-clamp-3 text-xs leading-5 text-neutral-500">
                    <RichText value={item.description} />
                  </p>

                  {/* Métriques */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-neutral-400">
                    <span className="inline-flex items-center gap-1" title="Vues">
                      <Eye size={11} className="text-neutral-400" />
                      {item.viewCount ?? 0} vue{(item.viewCount ?? 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1" title="J'aime">
                      <ThumbsUp size={11} className="text-neutral-400" />
                      {item.likeCount ?? 0} j&apos;aime
                    </span>
                    {item.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} /> {item.location}
                      </span>
                    )}
                  </div>

                  {/* Date expiration */}
                  {item.expiresAt && (
                    <div className={`rounded-xl border px-3 py-2 text-xs ${
                      expired   ? 'border-red-200 bg-red-50 text-red-700' :
                      expiring  ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                  'border-neutral-100 bg-neutral-50 text-neutral-500'
                    }`}>
                      <p className="font-black">
                        {expired ? 'Expirée' : expiring ? 'Expire bientôt' : 'Expire le'} — {fmtDate(item.expiresAt)}
                      </p>
                      {item.extendedBy && (
                        <p className="mt-0.5 text-[10px] font-semibold opacity-80">
                          Prolongation : {formatFullName(item.extendedBy.firstName ?? '', item.extendedBy.lastName ?? '') || item.extendedBy.email}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Soumis par + date */}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-1 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {fmtDate(item.createdAt)}
                    </span>
                    {item.submittedBy && (
                      <span>Par {formatFullName(item.submittedBy.firstName ?? '', item.submittedBy.lastName ?? '') || item.submittedBy.email}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t border-neutral-50 px-4 py-3">
                  <button onClick={() => { setViewOpportunity(item); markHrefRead(`/admin/opportunites/${item.slug ?? item._id}`); }}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
                    <Eye size={11} /> Voir
                  </button>
                  {item.status === 'pending' && (
                    <Link href="/admin/validations"
                      className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-black text-emerald-700 transition hover:bg-emerald-100">
                      Examiner
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {viewOpportunity && <OpportunityDetailModal item={viewOpportunity} onClose={() => setViewOpportunity(null)} />}
    </div>
  );
}

function OpportunityDetailModal({ item, onClose }: { item: OpportunityDoc; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative border-b border-neutral-100 bg-gradient-to-br from-emerald-800 to-emerald-950 px-6 py-5 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white"><X size={16} /></button>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">{typeLabels[item.type] ?? item.type}</p>
          <h2 className="mt-2 pr-10 text-xl font-black leading-tight"><RichText value={item.title} /></h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-white/55">
            <span>{item.status}</span>
            <span>·</span>
            <span>{item.visibility === 'public' ? 'Public' : 'Membres uniquement'}</span>
            {(item.viewCount ?? 0) > 0 && <><span>·</span><span className="flex items-center gap-1"><Eye size={11} /> {item.viewCount} vue(s)</span></>}
            {(item.likeCount ?? 0) > 0 && <><span>·</span><span className="flex items-center gap-1"><ThumbsUp size={11} /> {item.likeCount}</span></>}
          </div>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <RichText value={item.description} className="text-sm leading-7 text-neutral-600" block />
          <div className="grid gap-2 text-xs font-semibold text-neutral-500 sm:grid-cols-2">
            {item.organization && <Meta icon={BriefcaseBusiness}>{item.organization}</Meta>}
            {item.location && <Meta icon={MapPin}>{item.location}</Meta>}
            {item.deadline && <Meta icon={CalendarDays}>Avant {new Date(item.deadline).toLocaleDateString('fr-FR')}</Meta>}
            {item.expiresAt && <Meta icon={CalendarDays}>Expire le {new Date(item.expiresAt).toLocaleDateString('fr-FR')}</Meta>}
            {item.contactEmail && <Meta icon={Mail}>{item.contactEmail}</Meta>}
            {item.contactPhone && <Meta icon={Phone}>{item.contactPhone}</Meta>}
            {item.contactUrl && <Meta icon={ExternalLink}>{item.contactUrl}</Meta>}
          </div>
          {item.extendedBy && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
              Prolongée par : {formatFullName(item.extendedBy.firstName ?? '', item.extendedBy.lastName ?? '') || item.extendedBy.email}
            </div>
          )}
          {!!item.skills?.length && (
            <div className="flex flex-wrap gap-1.5">
              {item.skills.map(skill => <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-2 py-1 text-[10px] font-bold text-neutral-500"><Tag size={10} />{skill}</span>)}
            </div>
          )}
          {item.submittedBy && (
            <p className="rounded-2xl bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
              Soumis par {formatFullName(item.submittedBy.firstName ?? '', item.submittedBy.lastName ?? '') || item.submittedBy.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1"><Icon size={12} />{children}</span>;
}
