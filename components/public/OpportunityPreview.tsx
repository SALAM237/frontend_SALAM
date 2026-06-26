'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, CalendarClock, MapPin } from 'lucide-react';
import { OPPORTUNITY_TYPES, opportunityHref, usePublicOpportunities } from '@/lib/api/opportunities';
import { useAuthStore } from '@/store/auth.store';
import { RichText } from '@/components/ui/RichText';
import { trackEvent } from '@/lib/analytics';

const typeLabel = Object.fromEntries(OPPORTUNITY_TYPES.map(t => [t.value, t.label]));

export function OpportunityPreview() {
  const { data, isLoading } = usePublicOpportunities();
  const accessToken = useAuthStore(s => s.accessToken);
  const items = data?.data?.items ?? [];
  const responseHref = accessToken ? '/member/opportunites' : '/auth/login';

  const trackOpportunityClick = (item: (typeof items)[number], action: string) => {
    trackEvent('opportunity_click', {
      opportunity_id: item._id,
      opportunity_slug: item.slug,
      opportunity_title: item.title,
      opportunity_type: item.type,
      organization: item.organization,
      source: 'home_preview',
      action,
    });
  };

  const trackOpportunityContactClick = (item: (typeof items)[number]) => {
    trackEvent('opportunity_contact_click', {
      opportunity_id: item._id,
      opportunity_slug: item.slug,
      opportunity_title: item.title,
      opportunity_type: item.type,
      organization: item.organization,
      source: 'home_preview',
      action: accessToken ? 'member_reply_cta' : 'login_reply_cta',
    });
  };

  return (
    <section id="opportunites" className="bg-neutral-50/70">
      <div className="container-salam section-salam">
        <div className="mb-[clamp(2rem,5vw,4rem)] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="badge-pill mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Opportunites
            </span>
            <h2 className="subtitle-salam text-salam-ink">Opportunites du reseau</h2>
            <p className="text-salam mt-3 text-neutral-600">
              Offres, partenariats, projets et appels a contribution partages par la communaute SALAM.
            </p>
          </div>
          <Link href="/opportunites" className="group inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-salam-green transition-all">
            Voir toutes les opportunites
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {!isLoading && items.length === 0 && (
            <article className="min-w-full rounded-3xl border border-dashed border-emerald-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <BriefcaseBusiness size={20} />
              </div>
              <h3 className="text-lg font-black text-neutral-900">Aucune opportunite publique pour le moment</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
                Les opportunites publiees par le bureau ou validees depuis l'espace membre apparaitront ici automatiquement.
              </p>
            </article>
          )}
          {isLoading && [1, 2, 3].map(item => (
            <article key={item} className="min-w-[84%] snap-start rounded-3xl border border-white bg-white p-5 shadow-sm sm:min-w-[48%] lg:min-w-[31%]">
              <div className="mb-4 h-11 w-11 rounded-2xl bg-neutral-100" />
              <div className="h-5 w-2/3 rounded bg-neutral-100" />
              <div className="mt-3 h-16 rounded bg-neutral-50" />
            </article>
          ))}
          {items.map((item, index) => (
            <motion.article
              key={item._id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              viewport={{ once: true }}
              className="group flex min-w-[84%] snap-start flex-col rounded-3xl border border-neutral-200 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl hover:ring-2 hover:ring-amber-400/20 sm:min-w-[48%] lg:min-w-[31%]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <BriefcaseBusiness size={19} />
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
                  {typeLabel[item.type] ?? item.type}
                </span>
              </div>
              <h3 className="line-clamp-2 text-[clamp(1rem,2vw,1.2rem)] font-black leading-tight text-neutral-950 group-hover:text-emerald-700">
                {item.title}
              </h3>
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-500">
                <RichText value={item.description} />
              </p>
              <div className="mt-5 space-y-2 text-xs font-semibold text-neutral-500">
                {item.organization && <p>{item.organization}</p>}
                <p className="flex items-center gap-2"><MapPin size={13} className="text-red-500" />{item.remote ? 'Remote possible' : item.location || 'Lieu a confirmer'}</p>
                {item.deadline && <p className="flex items-center gap-2"><CalendarClock size={13} className="text-amber-500" />Avant le {new Date(item.deadline).toLocaleDateString('fr-FR')}</p>}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={opportunityHref(item)} onClick={() => trackOpportunityClick(item, 'card_cta_click')} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-[12px] font-black text-emerald-700 transition hover:bg-emerald-50">
                  Voir opportunite
                  <ArrowRight size={12} />
                </Link>
                <Link href={responseHref} onClick={() => trackOpportunityContactClick(item)} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 text-[12px] font-black text-white transition hover:bg-emerald-700">
                  Repondre a l'offre
                  <ArrowRight size={12} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
