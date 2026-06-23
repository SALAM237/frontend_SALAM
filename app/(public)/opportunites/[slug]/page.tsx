'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, CalendarClock, ChevronRight, ExternalLink, Loader2, Mail, MapPin, Phone, Tag } from 'lucide-react';
import { OPPORTUNITY_TYPES, usePublicOpportunity } from '@/lib/api/opportunities';
import { RichText } from '@/components/ui/RichText';
import OpportunitySchema from '@/components/seo/OpportunitySchema';
import { trackEvent } from '@/lib/analytics';

const TYPE_COLORS: Record<string, string> = {
  emploi: 'bg-emerald-100 text-emerald-700',
  stage: 'bg-blue-100 text-blue-700',
  partenariat: 'bg-purple-100 text-purple-700',
  associe: 'bg-amber-100 text-amber-700',
  appel_projet: 'bg-cyan-100 text-cyan-700',
  business: 'bg-orange-100 text-orange-700',
  benevolat: 'bg-red-100 text-red-700',
  autre: 'bg-neutral-100 text-neutral-600',
};

const typeLabel = Object.fromEntries(OPPORTUNITY_TYPES.map(t => [t.value, t.label]));

export default function OpportuniteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, isError } = usePublicOpportunity(slug);
  const item = data?.data;
  const responseHref = item ? `/auth/login?redirect=${encodeURIComponent('/member/opportunites')}` : '/auth/login';

  useEffect(() => {
    if (!item) return;
    trackEvent('opportunity_view', {
      opportunity_slug: item.slug || slug,
      opportunity_id: item._id,
      opportunity_title: item.title,
      opportunity_type: item.type,
      organization: item.organization,
    });
    trackEvent('view_item', {
      item_id: item._id,
      item_name: item.title,
      item_category: 'opportunity',
      item_slug: item.slug || slug,
    });
  }, [item, slug]);

  const trackOpportunityContactClick = (action: string) => {
    if (!item) return;
    trackEvent('opportunity_contact_click', {
      opportunity_slug: item.slug || slug,
      opportunity_id: item._id,
      opportunity_title: item.title,
      opportunity_type: item.type,
      organization: item.organization,
      action,
    });
  };

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <div className="border-b border-neutral-200 bg-white px-5 py-4 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="transition-colors hover:text-neutral-700">Accueil</Link>
          <ChevronRight size={10} />
          <Link href="/opportunites" className="transition-colors hover:text-neutral-700">Opportunites</Link>
          <ChevronRight size={10} />
          <span className="max-w-[200px] truncate text-neutral-600">{item?.title ?? 'Opportunite'}</span>
        </div>
      </div>

      <div className="px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/opportunites" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-emerald-700">
            <ArrowLeft size={15} /> Toutes les opportunites
          </Link>

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-24">
              <Loader2 size={28} className="animate-spin text-emerald-600" />
              <p className="text-sm text-neutral-500">Chargement...</p>
            </div>
          )}

          {(isError || (!isLoading && !item)) && (
            <div className="mt-4 flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                <BriefcaseBusiness size={28} className="text-neutral-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-neutral-900">Opportunite introuvable</h1>
                <p className="mt-2 max-w-sm text-sm text-neutral-500">Cette opportunite n'existe pas ou n'est plus disponible publiquement.</p>
              </div>
              <Link href="/opportunites" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 transition-all hover:border-emerald-400 hover:text-emerald-700">
                Voir toutes les opportunites
              </Link>
            </div>
          )}

          {!isLoading && item && (
            <article className="space-y-6">
              <OpportunitySchema
                title={item.title}
                description={item.description}
                slug={item.slug || slug}
                publishedAt={item.publishedAt ?? item.createdAt}
                validThrough={item.deadline}
                organization={item.organization}
                location={item.location}
                remote={item.remote}
              />
              <div className="aspect-[21/9] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-emerald-500 via-teal-600 to-neutral-900" />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${TYPE_COLORS[item.type] ?? TYPE_COLORS.autre}`}>
                    <Tag size={10} /> {typeLabel[item.type] ?? item.type}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Publique</span>
                </div>
                <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900">
                  <RichText value={item.title} />
                </h1>
                {item.organization && <p className="text-sm font-semibold text-neutral-500">{item.organization}</p>}
              </div>

              <div className="grid gap-3 rounded-[1.5rem] border border-neutral-100 bg-white p-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <MapPin size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Lieu</p>
                    <p className="text-sm font-semibold text-neutral-800">{item.remote ? 'Remote possible' : item.location || 'A confirmer'}</p>
                  </div>
                </div>
                {item.deadline && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <CalendarClock size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Date limite</p>
                      <p className="text-sm font-semibold text-neutral-800">{new Date(item.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                )}
              </div>

              {item.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {item.skills.map(skill => (
                    <span key={skill} className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-bold text-neutral-600">{skill}</span>
                  ))}
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-neutral-100 bg-white p-6">
                <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-neutral-400">Description</h2>
                <RichText value={item.description} className="text-sm leading-relaxed text-neutral-700" block />
              </div>

              <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
                <h3 className="font-black tracking-[-0.02em]">Repondre a cette opportunite</h3>
                <p className="mt-1.5 text-sm text-white/75">La reponse se fait depuis l'espace membre afin de proteger les echanges et le suivi.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={responseHref} onClick={() => trackOpportunityContactClick('member_reply_cta')} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-emerald-700 transition-all hover:bg-emerald-50">
                    Repondre depuis l'espace membre
                  </Link>
                  {item.contactUrl && (
                    <a href={item.contactUrl} onClick={() => trackOpportunityContactClick('external_link')} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white/85 transition-all hover:border-white/60 hover:text-white">
                      Lien externe <ExternalLink size={13} />
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/75">
                  {item.contactEmail && <span className="inline-flex items-center gap-1"><Mail size={12} />{item.contactEmail}</span>}
                  {item.contactPhone && <span className="inline-flex items-center gap-1"><Phone size={12} />{item.contactPhone}</span>}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </main>
  );
}
