import { Mail, MapPin, Users } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoBoardMembers } from '@/data/demo/demo-extra';

export default function DemoAdminBoardPage() {
  return (
    <DemoPortalShell type="admin" title="Bureau executif">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Users size={20} /></div>
          <div><h1 className="text-2xl font-black text-neutral-900">Bureau executif</h1><p className="text-sm text-neutral-500">Ordre demo incluant le role Censeur avant Conseiller.</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demoBoardMembers.map(member => (
            <article key={member.role} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <DemoStatus tone={member.role === 'Censeur' ? 'amber' : 'green'}>{member.role}</DemoStatus>
              <h2 className="mt-4 text-lg font-black text-neutral-900">{member.name}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-neutral-500"><MapPin size={13} /> {member.city}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500"><Mail size={13} /> {member.email}</p>
            </article>
          ))}
        </div>
      </div>
    </DemoPortalShell>
  );
}
