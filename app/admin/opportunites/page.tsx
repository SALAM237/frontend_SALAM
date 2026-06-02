'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BriefcaseBusiness, CalendarDays, Clock, ExternalLink, Eye, Loader2, Mail, MapPin, Phone, Tag, X } from 'lucide-react';
import { OPPORTUNITY_TYPES, useAdminOpportunities, type OpportunityDoc, type OpportunityStatus } from '@/lib/api/opportunities';
import { formatFullName } from '@/lib/format-name';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { RichText } from '@/components/ui/RichText';

const statusTabs: { value: OpportunityStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Publiees' },
  { value: 'rejected', label: 'Refusees' },
  { value: 'all', label: 'Toutes' },
];

const typeLabels = Object.fromEntries(OPPORTUNITY_TYPES.map(type => [type.value, type.label]));

export default function AdminOpportunitesPage() {
  const [status, setStatus] = useState<OpportunityStatus | 'all'>('pending');
  const [viewOpportunity, setViewOpportunity] = useState<OpportunityDoc | null>(null);
  const opportunities = useAdminOpportunities(status);
  const items = opportunities.data?.data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Opportunites</h1>
          <p className="mt-1 text-sm text-neutral-500">Suivi des offres, partenariats et projets soumis par les membres.</p>
        </div>
        <Link href="/admin/validations" className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700">
          <ExternalLink size={14} /> Validations en attente
        </Link>
      </div>

      <AnimatedTabBar items={statusTabs} value={status} onChange={setStatus} />

      <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {opportunities.isLoading && (
          <div className="flex flex-col items-center py-16">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <p className="mt-3 text-sm text-neutral-400">Chargement...</p>
          </div>
        )}

        {!opportunities.isLoading && items.length === 0 && (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <BriefcaseBusiness size={36} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucune opportunite dans cette vue.</p>
          </div>
        )}

        {!opportunities.isLoading && items.length > 0 && (
          <div className="divide-y divide-neutral-50">
            {items.map(item => (
              <article key={item._id} className="grid gap-3 px-5 py-4 transition hover:bg-neutral-50/70 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700">
                      {typeLabels[item.type] ?? item.type}
                    </span>
                    <span className="rounded-full border border-neutral-100 bg-neutral-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">
                      {item.status}
                    </span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${
                      item.visibility === 'public'
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                        : 'border-blue-100 bg-blue-50 text-blue-700'
                    }`}>
                      {item.visibility === 'public' ? 'Public' : 'Membres'}
                    </span>
                  </div>
                  <h2 className="mt-2 truncate text-sm font-black text-neutral-900"><RichText value={item.title} /></h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500"><RichText value={item.description} /></p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-neutral-400">
                    {item.location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {item.location}</span>}
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
                    {item.submittedBy && <span>Par {formatFullName(item.submittedBy.firstName ?? '', item.submittedBy.lastName ?? '') || item.submittedBy.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewOpportunity(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" title="Visualiser">
                    <Eye size={14} />
                  </button>
                  {item.status === 'pending' && (
                    <Link href="/admin/validations" className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-200 px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
                      Examiner
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
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
          <p className="mt-1 text-xs font-semibold text-white/55">{item.status}</p>
          <p className="mt-1 text-xs font-semibold text-white/55">
            Visibilite : {item.visibility === 'public' ? 'Public' : 'Membres uniquement'}
          </p>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-line text-sm leading-7 text-neutral-600"><RichText value={item.description} /></p>
          <div className="grid gap-2 text-xs font-semibold text-neutral-500 sm:grid-cols-2">
            {item.organization && <Meta icon={BriefcaseBusiness}>{item.organization}</Meta>}
            {item.location && <Meta icon={MapPin}>{item.location}</Meta>}
            {item.deadline && <Meta icon={CalendarDays}>Avant {new Date(item.deadline).toLocaleDateString('fr-FR')}</Meta>}
            {item.contactEmail && <Meta icon={Mail}>{item.contactEmail}</Meta>}
            {item.contactPhone && <Meta icon={Phone}>{item.contactPhone}</Meta>}
            {item.contactUrl && <Meta icon={ExternalLink}>{item.contactUrl}</Meta>}
          </div>
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
