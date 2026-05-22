import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react';
import { DemoPortalShell, DemoStatus } from '../../../_components/DemoShell';
import { demoActivities } from '@/data/demo/demo-activities';

export default async function DemoMemberActivityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = demoActivities.find(activity => activity.slug === slug || activity.id === slug);
  if (!item) notFound();
  return (
    <DemoPortalShell type="member" title="Activite">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link href="/demo/member/activites" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft size={14} /> Retour</Link>
        <article className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <DemoStatus tone="green">{item.category}</DemoStatus>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-neutral-900">{item.title}</h1>
          <p className="mt-3 text-neutral-600">{item.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm"><CalendarDays className="mb-2 text-emerald-700" size={17} />{new Date(item.date).toLocaleDateString('fr-FR')}</div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm"><MapPin className="mb-2 text-emerald-700" size={17} />{item.location}</div>
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm"><Users className="mb-2 text-emerald-700" size={17} />{item.participants} participants</div>
          </div>
        </article>
      </div>
    </DemoPortalShell>
  );
}
