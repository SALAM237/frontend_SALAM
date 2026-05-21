'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Loader2, MapPin, Users } from 'lucide-react';
import { ACTIVITY_CATEGORIES, useMemberActivity } from '@/lib/api/activities';

export default function MemberActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = useMemberActivity(slug);
  const activity = data?.data;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/member/activites" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline">
        <ArrowLeft size={14} /> Retour aux activites
      </Link>

      {isLoading && (
        <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white py-16 shadow-sm">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
          <p className="mt-3 text-sm text-neutral-400">Chargement...</p>
        </div>
      )}

      {(isError || (!isLoading && !activity)) && (
        <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">Activite introuvable ou indisponible.</p>
        </div>
      )}

      {activity && (
        <article className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="h-40 bg-gradient-to-br from-emerald-500 to-teal-700" />
          <div className="space-y-5 p-5 sm:p-7">
            <div>
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-100">
                {ACTIVITY_CATEGORIES.find(c => c.value === activity.category)?.label ?? activity.category}
              </span>
              <h1 className="mt-3 text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-tight tracking-[-0.03em] text-neutral-900">
                {activity.title}
              </h1>
            </div>

            <div className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
              {activity.startDate && <Info icon={CalendarDays} text={new Date(activity.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />}
              {activity.location && <Info icon={MapPin} text={activity.location} />}
              {activity.capacity && <Info icon={Users} text={`${activity.capacity} places`} />}
            </div>

            {activity.description && (
              <div className="rounded-2xl bg-neutral-50 p-5">
                <p className="whitespace-pre-line text-sm leading-7 text-neutral-700">{activity.description}</p>
              </div>
            )}
          </div>
        </article>
      )}
    </div>
  );
}

function Info({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
      <Icon size={14} className="text-emerald-600" />
      <span className="min-w-0 truncate">{text}</span>
    </div>
  );
}
