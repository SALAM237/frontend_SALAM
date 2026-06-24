'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, CalendarDays, Loader2, MapPin, Users, CheckCircle2,
  HelpCircle, XCircle, Clock, Mail, Phone, Share2, Euro, ChevronRight,
} from 'lucide-react';
import { ACTIVITY_CATEGORIES, useMemberActivity, useRespondActivityInvitation } from '@/lib/api/activities';

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

function shareActivity(title: string) {
  if (navigator.share) {
    navigator.share({ title, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Lien copié !');
    });
  }
}

export default function MemberActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = useMemberActivity(slug);
  const activity = data?.data;
  // slug passé au hook → optimistic update partagé avec la liste
  const respond = useRespondActivityInvitation(activity?._id ?? '', slug);
  const currentRsvp = activity?.myInvitation?.rsvpStatus;

  const catLabel   = activity ? (ACTIVITY_CATEGORIES.find(c => c.value === activity.category)?.label ?? activity.category) : '';
  const catColor   = activity ? (CAT_COLORS[activity.category] ?? 'bg-neutral-100 text-neutral-600') : '';
  const catGrad    = activity ? (CAT_GRADIENTS[activity.category] ?? 'from-emerald-500 to-teal-700') : '';
  const registered = activity?.registeredCount ?? activity?.invitationSummary?.present ?? 0;
  const capacity   = activity?.capacity ?? 0;
  const pct        = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const isFree     = !activity?.price || activity.price === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-0 pb-12">

      {/* Back */}
      <Link href="/member/activites" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline">
        <ArrowLeft size={14} /> Retour aux activités
      </Link>

      {isLoading && (
        <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-white py-20 shadow-sm">
          <Loader2 size={26} className="animate-spin text-emerald-600" />
          <p className="mt-3 text-sm text-neutral-400">Chargement…</p>
        </div>
      )}

      {(isError || (!isLoading && !activity)) && (
        <div className="rounded-2xl border border-neutral-100 bg-white p-10 text-center shadow-sm">
          <CalendarDays size={32} className="mx-auto mb-3 text-neutral-200" />
          <p className="text-sm font-semibold text-neutral-500">Activité introuvable ou indisponible.</p>
        </div>
      )}

      {activity && (
        <article className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-md">

          {/* Bannière */}
          <div className={`relative flex h-48 items-end bg-gradient-to-br ${catGrad} p-5 sm:h-56`}>
            {activity.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activity.mediumUrl || activity.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative flex w-full items-end justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[11px] font-black ${catColor} bg-white/90`}>{catLabel}</span>
                {activity.status === 'published' && (
                  <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-black text-white">Ouvert</span>
                )}
                {activity.status === 'finished' && (
                  <span className="rounded-full bg-neutral-500/80 px-3 py-1 text-[11px] font-black text-white">Terminé</span>
                )}
                {activity.status === 'cancelled' && (
                  <span className="rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-black text-white">Annulé</span>
                )}
              </div>
              <button
                onClick={() => shareActivity(activity.title)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
                title="Partager">
                <Share2 size={15} />
              </button>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-7">

            {/* Titre + meta */}
            <div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-neutral-900 sm:text-3xl">
                {activity.title}
              </h1>
              {activity.shortDescription && (
                <p className="mt-1.5 text-sm font-semibold leading-6 text-neutral-500">{activity.shortDescription}</p>
              )}

              {/* Infos clés */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {activity.startDate && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3.5 py-2.5">
                    <CalendarDays size={15} className="shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-800">
                        {new Date(activity.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {new Date(activity.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
                {(activity.venue || activity.location) && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3.5 py-2.5">
                    <MapPin size={15} className="shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-800">{activity.venue || activity.location}</p>
                      {activity.city && <p className="text-[11px] text-neutral-400">{activity.city}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Capacité + tarif */}
            {(capacity > 0 || !isFree) && (
              <div className="flex flex-wrap items-center gap-3">
                {capacity > 0 && (
                  <div className="flex-1 min-w-[160px]">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-neutral-500">
                      <span className="flex items-center gap-1"><Users size={11} /> {registered}/{capacity} inscrits</span>
                      <span className={`font-black ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                {!isFree && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm font-black text-neutral-800">
                    <Euro size={13} className="text-emerald-600" /> {activity.price} €
                  </div>
                )}
                {isFree && (
                  <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-black text-emerald-700">Gratuit</span>
                )}
              </div>
            )}

            {/* RSVP */}
            {activity.myInvitation && (
              <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <h2 className="text-sm font-black text-neutral-900">Votre présence</h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {activity.myInvitation.rsvpRequired ? 'Réponse obligatoire' : 'Indiquez votre disponibilité pour aider l\'organisation.'}
                  {activity.myInvitation.rsvpDeadline
                    ? ` · avant ${new Date(activity.myInvitation.rsvpDeadline).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}`
                    : ''}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button onClick={() => respond.mutate('present')} disabled={respond.isPending}
                    className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black transition disabled:opacity-50 ${currentRsvp === 'present' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white ring-1 ring-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
                    <CheckCircle2 size={14} /> Présent
                  </button>
                  <button onClick={() => respond.mutate('unsure')} disabled={respond.isPending}
                    className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black transition disabled:opacity-50 ${currentRsvp === 'unsure' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white ring-1 ring-amber-200 text-amber-700 hover:bg-amber-50'}`}>
                    <HelpCircle size={14} /> Peut-être
                  </button>
                  <button onClick={() => respond.mutate('absent')} disabled={respond.isPending}
                    className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black transition disabled:opacity-50 ${currentRsvp === 'absent' ? 'bg-red-500 text-white shadow-sm' : 'bg-white ring-1 ring-red-200 text-red-600 hover:bg-red-50'}`}>
                    <XCircle size={14} /> Absent
                  </button>
                </div>
                {activity.myInvitation.qrDataUrl && activity.myInvitation.rsvpStatus === 'present' && (
                  <div className="mt-4 flex flex-col items-center rounded-2xl bg-white p-4 text-center ring-1 ring-emerald-100">
                    <img src={activity.myInvitation.qrDataUrl} alt="QR code de présence" className="h-44 w-44 rounded-xl object-contain" />
                    <p className="mt-2 text-xs font-semibold text-neutral-500">Code manuel</p>
                    <p className="font-mono text-lg font-black tracking-[0.18em] text-emerald-700">{activity.myInvitation.shortCode}</p>
                  </div>
                )}
              </section>
            )}

            {/* À propos */}
            {activity.description && (
              <section>
                <h2 className="mb-2 text-sm font-black uppercase tracking-widest text-neutral-400">À propos</h2>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="whitespace-pre-line break-words text-sm leading-7 text-neutral-700">{activity.description}</p>
                </div>
              </section>
            )}

            {/* Programme */}
            {activity.program && activity.program.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-neutral-400">Programme prévisionnel</h2>
                <div className="relative space-y-0 pl-4">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-200" />
                  {activity.program.map((step, i) => (
                    <div key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
                      <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-200 bg-white">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
                <h2 className="mb-2 text-sm font-black uppercase tracking-widest text-neutral-400">Infos pratiques</h2>
                <ul className="space-y-1.5 rounded-2xl bg-neutral-50 p-4">
                  {activity.practicalInfo.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {line.replace(/^[•\-]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Contact */}
            {(activity.contactEmail || activity.contactPhone) && (
              <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-black text-neutral-900">Une question ?</h2>
                <p className="mb-3 text-xs text-neutral-500">L'équipe organisation reste à votre écoute pour toute information complémentaire.</p>
                <div className="space-y-2">
                  {activity.contactEmail && (
                    <a href={`mailto:${activity.contactEmail}`}
                      className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3.5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-emerald-50 hover:text-emerald-700">
                      <Mail size={14} className="text-emerald-600" /> {activity.contactEmail}
                    </a>
                  )}
                  {activity.contactPhone && (
                    <a href={`tel:${activity.contactPhone}`}
                      className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3.5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-emerald-50 hover:text-emerald-700">
                      <Phone size={14} className="text-emerald-600" /> {activity.contactPhone}
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Date + Lieu résumé bas de page */}
            {activity.startDate && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-950 px-5 py-4 text-white">
                <div className="space-y-0.5">
                  <p className="text-sm font-black capitalize">
                    {new Date(activity.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(activity.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {activity.venue && ` · ${activity.venue}`}
                    {activity.city && ` · ${activity.city}`}
                  </p>
                </div>
                <Link href="/member/activites"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/20">
                  Toutes les activités <ChevronRight size={12} />
                </Link>
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
      <span className="min-w-0 truncate text-sm">{text}</span>
    </div>
  );
}
