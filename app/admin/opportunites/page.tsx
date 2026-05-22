'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BriefcaseBusiness, Clock, ExternalLink, Loader2, MapPin } from 'lucide-react';
import { OPPORTUNITY_TYPES, useAdminOpportunities, type OpportunityStatus } from '@/lib/api/opportunities';
import { formatFullName } from '@/lib/format-name';

const statusTabs: { value: OpportunityStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Publiees' },
  { value: 'rejected', label: 'Refusees' },
  { value: 'all', label: 'Toutes' },
];

const typeLabels = Object.fromEntries(OPPORTUNITY_TYPES.map(type => [type.value, type.label]));

export default function AdminOpportunitesPage() {
  const [status, setStatus] = useState<OpportunityStatus | 'all'>('pending');
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

      <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1 shadow-sm">
        <div className="flex min-w-max gap-1">
          {statusTabs.map(tab => (
            <button key={tab.value} onClick={() => setStatus(tab.value)} className={`h-10 rounded-xl px-4 text-xs font-black transition ${status === tab.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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
                  </div>
                  <h2 className="mt-2 truncate text-sm font-black text-neutral-900">{item.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">{item.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-neutral-400">
                    {item.location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {item.location}</span>}
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
                    {item.submittedBy && <span>Par {formatFullName(item.submittedBy.firstName ?? '', item.submittedBy.lastName ?? '') || item.submittedBy.email}</span>}
                  </div>
                </div>
                {item.status === 'pending' && (
                  <Link href="/admin/validations" className="inline-flex h-9 items-center justify-center rounded-xl border border-neutral-200 px-3 text-xs font-black text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
                    Examiner
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
