'use client';

import Link from 'next/link';
import { CalendarDays, Plus } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoActivities } from '@/data/demo/demo-activities';

export default function DemoAdminActivitiesPage() {
  return (
    <DemoPortalShell type="admin" title="Activites">
      <div className="mx-auto max-w-5xl space-y-5">
      <DemoCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div><p className="text-sm font-black">Programmation</p><p className="text-xs text-neutral-400">Gestion simulee des activites.</p></div>
          <button className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"><Plus size={14} /> Creer</button>
        </div>
        <div className="divide-y divide-neutral-50">
          {demoActivities.map(activity => (
            <Link key={activity.id} href={`/demo/activites/${activity.slug}`} className="grid gap-3 px-5 py-4 transition hover:bg-neutral-50 md:grid-cols-[1fr_140px_120px_90px] md:items-center">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CalendarDays size={15} /></div>
                <div><p className="text-sm font-black">{activity.title}</p><p className="text-xs text-neutral-400">{activity.location} - {activity.category}</p></div>
              </div>
              <p className="text-sm font-semibold text-neutral-600">{activity.date}</p>
              <DemoStatus tone={activity.status === 'published' ? 'green' : 'neutral'}>{activity.status === 'published' ? 'Publiee' : 'Brouillon'}</DemoStatus>
              <span className="text-xs font-bold text-neutral-500">{activity.participants} pers.</span>
            </Link>
          ))}
        </div>
      </DemoCard>
      </div>
    </DemoPortalShell>
  );
}
