'use client';

import { Briefcase, CheckCircle2, Eye, Plus, Trash2 } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoOpportunities } from '@/data/demo/demo-extra';

export default function DemoAdminOpportunitiesPage() {
  return (
    <DemoPortalShell type="admin" title="Opportunites">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-black text-neutral-900">Opportunites</h1><p className="text-sm text-neutral-500">Publication, validation et suivi des opportunites demo.</p></div>
          <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white"><Plus size={14} /> Nouvelle opportunite</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {demoOpportunities.map(item => (
            <article key={item.id} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Briefcase size={17} /></div>
                <DemoStatus tone={item.status === 'published' ? 'green' : 'amber'}>{item.status === 'published' ? 'Publiee' : 'A valider'}</DemoStatus>
              </div>
              <h2 className="mt-4 text-base font-black text-neutral-900">{item.title}</h2>
              <p className="mt-1 text-sm text-neutral-500">{item.company} - {item.location}</p>
              <p className="mt-3 text-xs font-bold text-neutral-400">Echeance : {new Date(item.deadline).toLocaleDateString('fr-FR')}</p>
              <div className="mt-4 flex gap-2">
                <button className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600"><Eye size={12} /> Voir</button>
                <button className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-200 text-xs font-bold text-emerald-700"><CheckCircle2 size={12} /> Publier</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500"><Trash2 size={12} /></button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DemoPortalShell>
  );
}
