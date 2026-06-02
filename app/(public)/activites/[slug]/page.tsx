'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Tag, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { usePublicActivity, ACTIVITY_CATEGORIES } from '@/lib/api/activities';
import { RichText } from '@/components/ui/RichText';
import EventSchema from '@/components/seo/EventSchema';
import { trackEvent } from '@/lib/analytics';

const CAT_COLORS: Record<string, string> = {
  sport: 'bg-blue-100 text-blue-700', culture: 'bg-purple-100 text-purple-700',
  etude: 'bg-yellow-100 text-yellow-700', benevolat: 'bg-red-100 text-red-700',
  reseau: 'bg-emerald-100 text-emerald-700', conference: 'bg-orange-100 text-orange-700',
  atelier: 'bg-pink-100 text-pink-700', entraide: 'bg-teal-100 text-teal-700',
  orientation: 'bg-indigo-100 text-indigo-700', insertion: 'bg-cyan-100 text-cyan-700',
  assemblee_generale: 'bg-violet-100 text-violet-700', divers: 'bg-neutral-100 text-neutral-600',
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  published: { label: 'Ouvert',    cls: 'bg-emerald-100 text-emerald-700' },
  finished:  { label: 'Terminé',   cls: 'bg-neutral-100 text-neutral-500' },
  cancelled: { label: 'Annulé',    cls: 'bg-red-100 text-red-600'         },
  draft:     { label: 'Brouillon', cls: 'bg-yellow-100 text-yellow-700'   },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = usePublicActivity(slug);
  const activity = data?.data;

  useEffect(() => {
    if (!activity) return;
    trackEvent('activity_view', {
      activity_slug: activity.slug || slug,
      activity_id: activity._id,
      activity_title: activity.title,
      category: activity.category,
      status: activity.status,
    });
    trackEvent('view_item', {
      item_id: activity._id,
      item_name: activity.title,
      item_category: 'activity',
      item_slug: activity.slug || slug,
    });
  }, [activity, slug]);

  const trackActivityRegistrationClick = (action: string) => {
    if (!activity) return;
    trackEvent('activity_registration_click', {
      activity_slug: activity.slug || slug,
      activity_id: activity._id,
      activity_title: activity.title,
      category: activity.category,
      status: activity.status,
      action,
    });
  };

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white px-5 py-4 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-700 transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <Link href="/activites" className="hover:text-neutral-700 transition-colors">Activités</Link>
          <ChevronRight size={10} />
          <span className="truncate text-neutral-600 capitalize max-w-[200px]">
            {activity?.title ?? slug.replace(/-/g, ' ')}
          </span>
        </div>
      </div>

      <div className="px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/activites" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-emerald-700">
            <ArrowLeft size={15} /> Toutes les activités
          </Link>

          {isLoading && (
            <div className="flex flex-col items-center py-24 gap-4">
              <Loader2 size={28} className="animate-spin text-emerald-600" />
              <p className="text-sm text-neutral-500">Chargement…</p>
            </div>
          )}

          {(isError || (!isLoading && !activity)) && (
            <div className="mt-4 flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                <Calendar size={28} className="text-neutral-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-neutral-900">Activité introuvable</h1>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">
                  Cette activité n'existe pas ou n'est plus disponible.
                </p>
              </div>
              <Link href="/activites" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 hover:border-emerald-400 hover:text-emerald-700 transition-all">
                Voir toutes les activités
              </Link>
            </div>
          )}

          {!isLoading && activity && (
            <article className="space-y-6">
              {activity.startDate && (
                <EventSchema
                  title={activity.title}
                  description={activity.description}
                  slug={activity.slug}
                  startDate={activity.startDate}
                  endDate={activity.endDate}
                  locationName={activity.location}
                />
              )}
              {/* Cover gradient */}
              <div className="aspect-[21/9] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-emerald-400 to-teal-600" />

              {/* Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${CAT_COLORS[activity.category] ?? 'bg-neutral-100 text-neutral-600'}`}>
                    {ACTIVITY_CATEGORIES.find(c => c.value === activity.category)?.label ?? activity.category}
                  </span>
                  {activity.status && STATUS_LABELS[activity.status] && (
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_LABELS[activity.status].cls}`}>
                      {STATUS_LABELS[activity.status].label}
                    </span>
                  )}
                </div>
                <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900">
                  <RichText value={activity.title} />
                </h1>
              </div>

              {/* Info grid */}
              <div className="grid gap-3 rounded-[1.5rem] border border-neutral-100 bg-white p-5 sm:grid-cols-2">
                {activity.startDate && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <Calendar size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Date</p>
                      <p className="text-sm font-semibold text-neutral-800 capitalize">{fmt(activity.startDate)}</p>
                      {activity.endDate && activity.endDate !== activity.startDate && (
                        <p className="text-xs text-neutral-500 capitalize">→ {fmt(activity.endDate)}</p>
                      )}
                    </div>
                  </div>
                )}
                {activity.location && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <MapPin size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Lieu</p>
                      <p className="text-sm font-semibold text-neutral-800">{activity.location}</p>
                    </div>
                  </div>
                )}
                {activity.capacity && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <Users size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Capacité</p>
                      <p className="text-sm font-semibold text-neutral-800">{activity.capacity} places</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Clock size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Publié le</p>
                    <p className="text-sm font-semibold text-neutral-800">
                      {new Date(activity.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {activity.description && (
                <div className="rounded-[1.5rem] border border-neutral-100 bg-white p-6">
                  <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-neutral-400">Description</h2>
                  <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap"><RichText value={activity.description} /></p>
                </div>
              )}

              {/* CTA membres */}
              <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
                <h3 className="font-black tracking-[-0.02em]">Participer à cette activité</h3>
                <p className="mt-1.5 text-sm text-white/70">Les activités SALAM sont réservées aux membres. Rejoignez-nous !</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/auth/login" onClick={() => trackActivityRegistrationClick('login_cta')} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-emerald-700 transition-all hover:bg-emerald-50">
                    Se connecter
                  </Link>
                  <Link href="/adhesion" onClick={() => trackActivityRegistrationClick('adhesion_cta')} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white/80 transition-all hover:border-white/60 hover:text-white">
                    Devenir membre
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </main>
  );
}
