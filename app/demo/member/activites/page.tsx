'use client';

import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { DemoCard, DemoPortalShell, DemoStatus } from '../../_components/DemoShell';
import { demoActivities } from '@/data/demo/demo-activities';

export default function DemoMemberActivitiesPage() {
  return (
    <DemoPortalShell type="member" title="Activites">
      <div className="grid gap-4 lg:grid-cols-2">
        {demoActivities.filter(a => a.status === 'published').map(activity => (
          <Link key={activity.id} href={`/demo/activites/${activity.slug}`}>
            <DemoCard className="p-5 transition hover:border-emerald-200">
              <CalendarDays className="mb-3 text-emerald-600" size={20} />
              <p className="text-sm font-black">{activity.title}</p>
              <p className="mt-1 text-xs text-neutral-400">{activity.date} - {activity.location}</p>
              <p className="mt-3 text-sm text-neutral-600">{activity.description}</p>
              <div className="mt-4"><DemoStatus tone="green">Inscription ouverte</DemoStatus></div>
            </DemoCard>
          </Link>
        ))}
      </div>
    </DemoPortalShell>
  );
}
