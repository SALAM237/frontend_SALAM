'use client';

import { useState } from 'react';
import { Briefcase, CheckCircle2, MapPin, X } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoOpportunities } from '@/data/demo/demo-extra';

export default function DemoMemberOpportunitiesPage() {
  const [detail, setDetail] = useState<(typeof demoOpportunities)[number] | null>(null);
  const [applied, setApplied] = useState<string[]>([]);
  const visible = demoOpportunities.filter(item => item.status === 'published');
  return (
    <DemoPortalShell type="member" title="Opportunites">
      <div className="mx-auto max-w-5xl space-y-5">
        <div><h1 className="text-2xl font-black text-neutral-900">Opportunites</h1><p className="text-sm text-neutral-500">Stages, bourses, emploi et appels a contribution visibles pour les membres.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map(item => (
            <article key={item.id} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <DemoStatus tone="green">{item.type}</DemoStatus>
              <h2 className="mt-3 text-lg font-black text-neutral-900">{item.title}</h2>
              <p className="mt-1 text-sm font-semibold text-neutral-500">{item.company}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400"><MapPin size={12} /> {item.location}</div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => setDetail(item)} className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-xs font-black text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50"><Briefcase size={13} /> Consulter</button>
                <button onClick={() => setApplied(prev => prev.includes(item.id) ? prev : [...prev, item.id])} className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700">
                  {applied.includes(item.id) ? <CheckCircle2 size={13} /> : <Briefcase size={13} />}
                  {applied.includes(item.id) ? 'Reponse envoyee' : "Repondre a l'offre"}
                </button>
              </div>
            </article>
          ))}
        </div>
        {detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div><DemoStatus tone="green">{detail.type}</DemoStatus><h2 className="mt-3 text-xl font-black text-neutral-900">{detail.title}</h2></div>
                <button onClick={() => setDetail(null)} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"><X size={16} /></button>
              </div>
              <p className="mt-2 text-sm font-semibold text-neutral-500">{detail.company} - {detail.location}</p>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">Detail fictif de l'opportunite. Le bouton de reponse simule l'envoi d'une candidature dans l'espace membre demo.</p>
              <button onClick={() => { setApplied(prev => prev.includes(detail.id) ? prev : [...prev, detail.id]); setDetail(null); }} className="mt-5 h-10 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white">Repondre a l'offre</button>
            </div>
          </div>
        )}
      </div>
    </DemoPortalShell>
  );
}
