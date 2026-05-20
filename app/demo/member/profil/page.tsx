'use client';

import { Save, User } from 'lucide-react';
import { DemoCard, DemoPortalShell } from '../../_components/DemoShell';
import { demoMemberProfile } from '@/data/demo/demo-portal';
import { formatFirstName, formatLastName } from '@/lib/format-name';

export default function DemoMemberProfilePage() {
  const fields = [
    ['Prenom', formatFirstName(demoMemberProfile.firstName)], ['Nom', formatLastName(demoMemberProfile.lastName)], ['Email', demoMemberProfile.email],
    ['Telephone', demoMemberProfile.phone], ['Ville', demoMemberProfile.city], ['Profession', demoMemberProfile.profession],
  ];
  return (
    <DemoPortalShell type="member" title="Mon profil">
      <DemoCard className="p-5">
        <div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><User size={18} /></div><div><p className="text-sm font-black">Informations personnelles</p><p className="text-xs text-neutral-400">Modification simulee, rien n'est sauvegarde.</p></div></div>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([label, value]) => (
            <label key={label} className="space-y-1.5"><span className="text-xs font-black uppercase tracking-wide text-neutral-500">{label}</span><input className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm" defaultValue={value} /></label>
          ))}
        </div>
        <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white"><Save size={14} /> Simuler la sauvegarde</button>
      </DemoCard>
    </DemoPortalShell>
  );
}
