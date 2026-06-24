'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, MapPin, Users, Clock, ChevronRight,
  Loader2, Euro, Share2, Mail, Phone,
} from 'lucide-react';
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

const CAT_GRADIENTS: Record<string, string> = {
  sport: 'from-blue-500 to-blue-700', culture: 'from-purple-500 to-purple-700',
  etude: 'from-yellow-500 to-amber-600', benevolat: 'from-red-500 to-red-700',
  reseau: 'from-emerald-500 to-teal-700', conference: 'from-orange-500 to-orange-700',
  atelier: 'from-pink-500 to-rose-700', entraide: 'from-teal-500 to-cyan-700',
  orientation: 'from-indigo-500 to-indigo-700', insertion: 'from-cyan-500 to-sky-700',
  assemblee_generale: 'from-violet-500 to-violet-700', divers: 'from-neutral-400 to-neutral-600',
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  published: { label: 'Ouvert',    cls: 'bg-emerald-500 text-white'   },
  finished:  { label: 'Terminé',   cls: 'bg-neutral-400 text-white'   },
  cancelled: { label: 'Annulé',    cls: 'bg-red-500 text-white'       },
  draft:     { label: 'Brouillon', cls: 'bg-yellow-500 text-white'    },
};

function fmt(d: string, time = false) {
  const date = new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  if (!time) return date;
  const t = new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${t}`;
}

function tryShare(title: string) {
  if (navigator.share) {
    navigator.share({ title, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('Lien copié !'));
  }
}

export default function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = usePublicActivity(slug);
  const activity = data?.data;

  useEffect(() => {
    if (!activity) return;
    trackEvent('activity_view', { activity_slug: activity.slug || slug, activity_id: activity._id, activity_title: activity.title, category: activity.category, status: activity.status });
    trackEvent('view_item', { item_id: activity._id, item_name: activity.title, item_category: 'activity', item_slug: activity.slug || slug });
  }, [activity, slug]);

  const trackRegistrationClick = (action: string) => {
    if (!activity) return;
    trackEvent('activity_registration_click', { activity_slug: activity.slug || slug, activity_id: activity._id, activity_title: activity.title, category: activity.category, status: activity.status, action });
  };

  const catGrad    = activity ? (CAT_GRADIENTS[activity.category] ?? 'from-emerald-500 to-teal-700') : '';
  const catColor   = activity ? (CAT_COLORS[activity.category] ?? 'bg-neutral-100 text-neutral-600') : '';
  const catLabel   = activity ? (ACTIVITY_CATEGORIES.find(c => c.value === activity.category)?.label ?? activity.category) : '';
  const registered = activity?.registeredCount ?? activity?.invitationSummary?.present ?? 0;
  const capacity   = activity?.capacity ?? 0;
  const pct        = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const isFree     = !activity?.price || activity.price === 0;

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white px-5 py-4 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="transition-colors hover:text-neutral-700">Accueil</Link>
          <ChevronRight size={10} />
          <Link href="/activites" className="transition-colors hover:text-neutral-700">Activités</Link>
          <ChevronRight size={10} />
          <span className="max-w-[200px] truncate capitalize text-neutral-600">{activity?.title ?? slug.replace(/-/g, ' ')}</span>
        </div>
      </div>

      <div className="px-5 py-[clamp(2.5rem,5vw,4rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/activites" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-emerald-700">
            <ArrowLeft size={15} /> Toutes les activités
          </Link>

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-24">
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
                <p className="mt-2 max-w-sm text-sm text-neutral-500">Cette activité n'existe pas ou n'est plus disponible.</p>
              </div>
              <Link href="/activites" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 transition-all hover:border-emerald-400 hover:text-emerald-700">
                Voir toutes les activités
              </Link>
            </div>
          )}

          {!isLoading && activity && (
            <article className="overflow-hidden rounded-[2rem] border border-neutral-100 bg-white shadow-lg">

              {activity.startDate && (
                <EventSchema
                  title={activity.title}
                  description={activity.description}
                  slug={activity.slug}
                  startDate={activity.startDate}
                  endDate={activity.endDate}
                  locationName={activity.venue || activity.location}
                />
              )}

              {/* Bannière */}
              <div className={`relative flex h-52 items-end bg-gradient-to-br ${catGrad} p-5 sm:h-64`}>
                {activity.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activity.mediumUrl || activity.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative flex w-full items-end justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full bg-white/90 px-3 py-1 text-[11px] font-black ${catColor}`}>{catLabel}</span>
                    {activity.status && STATUS_LABELS[activity.status] && (
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black ${STATUS_LABELS[activity.status].cls}`}>
                        {STATUS_LABELS[activity.status].label}
                      </span>
                    )}
                  </div>
                  <button onClick={() => tryShare(activity.title)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
                    title="Partager">
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-7">

                {/* Titre */}
                <div>
                  <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900">
                    <RichText value={activity.title} />
                  </h1>
                  {activity.shortDescription && (
                    <p className="mt-2 text-base font-semibold leading-6 text-neutral-500">{activity.shortDescription}</p>
                  )}
                </div>

                {/* Méta-infos clés */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {activity.startDate && (
                    <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                        <Calendar size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Date</p>
                        <p className="text-sm font-semibold capitalize text-neutral-800">{fmt(activity.startDate, true)}</p>
                        {activity.endDate && activity.endDate !== activity.startDate && (
                          <p className="text-xs capitalize text-neutral-400">→ {fmt(activity.endDate, true)}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {(activity.venue || activity.location) && (
                    <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                        <MapPin size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Lieu</p>
                        <p className="text-sm font-semibold text-neutral-800">{activity.venue || activity.location}</p>
                        {activity.city && <p className="text-xs text-neutral-400">{activity.city}</p>}
                      </div>
                    </div>
                  )}
                  {capacity > 0 && (
                    <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-3.5 sm:col-span-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                        <Users size={14} className="text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Places</p>
                          <span className={`text-xs font-black ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}% occupé</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-200">
                          <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">{registered}/{capacity} inscrits</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tarif */}
                <div className="flex items-center gap-3">
                  {isFree ? (
                    <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">Gratuit</span>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-black text-neutral-800">
                      <Euro size={13} className="text-emerald-600" /> {activity.price} €
                    </div>
                  )}
                  <p className="text-xs text-neutral-400">
                    Publié le {new Date(activity.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* À propos */}
                {activity.description && (
                  <section>
                    <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-neutral-400">À propos</h2>
                    <div className="rounded-2xl bg-neutral-50 p-5">
                      <RichText value={activity.description} className="text-sm leading-7 text-neutral-700" block />
                    </div>
                  </section>
                )}

                {/* Programme */}
                {activity.program && activity.program.length > 0 && (
                  <section>
                    <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-neutral-400">Programme prévisionnel</h2>
                    <div className="relative space-y-0 pl-5">
                      <div className="absolute left-[13px] top-2 bottom-2 w-px bg-neutral-200" />
                      {activity.program.map((step, i) => (
                        <div key={i} className="relative flex items-start gap-4 pb-5 last:pb-0">
                          <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-neutral-200 bg-white shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          </div>
                          <div className="-mt-0.5 flex-1">
                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">{step.time}</span>
                            <p className="mt-0.5 text-sm font-semibold text-neutral-800">{step.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Infos pratiques */}
                {activity.practicalInfo && (
                  <section>
                    <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-neutral-400">Infos pratiques</h2>
                    <ul className="space-y-2 rounded-2xl bg-neutral-50 p-5">
                      {activity.practicalInfo.split('\n').filter(Boolean).map((line, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          {line.replace(/^[•\-]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Contact */}
                {(activity.contactEmail || activity.contactPhone) && (
                  <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-sm font-black text-neutral-900">Une question ?</h2>
                    <p className="mb-4 text-xs text-neutral-400">L'équipe organisation est disponible pour toute information complémentaire.</p>
                    <div className="space-y-2">
                      {activity.contactEmail && (
                        <a href={`mailto:${activity.contactEmail}`}
                          className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-emerald-50 hover:text-emerald-700">
                          <Mail size={14} className="text-emerald-600" /> {activity.contactEmail}
                        </a>
                      )}
                      {activity.contactPhone && (
                        <a href={`tel:${activity.contactPhone}`}
                          className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-emerald-50 hover:text-emerald-700">
                          <Phone size={14} className="text-emerald-600" /> {activity.contactPhone}
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {/* CTA membres */}
                <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
                  <h3 className="font-black tracking-[-0.02em]">Participer à cette activité</h3>
                  <p className="mt-1.5 text-sm text-white/70">Les activités SALAM sont réservées aux membres. Rejoignez-nous !</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/auth/login" onClick={() => trackRegistrationClick('login_cta')}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-emerald-700 transition-all hover:bg-emerald-50">
                      Se connecter
                    </Link>
                    <Link href="/adhesion" onClick={() => trackRegistrationClick('adhesion_cta')}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white/80 transition-all hover:border-white/60 hover:text-white">
                      Devenir membre
                    </Link>
                  </div>
                </div>

              </div>
            </article>
          )}
        </div>
      </div>
    </main>
  );
}
