import { Briefcase, MapPin } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoOpportunities } from '@/data/demo/demo-extra';

export default function DemoMemberOpportunitiesPage() {
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
              <button className="mt-5 inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white"><Briefcase size={13} /> Consulter</button>
            </article>
          ))}
        </div>
      </div>
    </DemoPortalShell>
  );
}
