'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { usePublicActivities } from '@/lib/api/activities';
import { RichText } from '@/components/ui/RichText';
import { trackEvent } from '@/lib/analytics';

/* ── Category config ── */
const CAT: Record<string, { label: string; text: string; bg: string; border: string }> = {
  sport:     { label: 'Sport',      text: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  etude:     { label: 'Éducation',  text: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100' },
  culture:   { label: 'Culture',    text: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  benevolat: { label: 'Bénévolat',  text: 'text-salam-green', bg: 'bg-green-50',   border: 'border-green-100' },
};

const TOPS = ['bg-salam-green', 'bg-salam-red', 'bg-salam-yellow'];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.13 } } };
const card = {
  hidden:  { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
};

export function ActivityPreview() {
  const { data } = usePublicActivities();
  const today = Date.now();
  const activities = data?.data?.activities ?? [];
  const items = [...activities]
    .sort((a, b) => {
      const da = new Date(a.startDate ?? a.createdAt).getTime();
      const db = new Date(b.startDate ?? b.createdAt).getTime();
      const aFuture = da >= today;
      const bFuture = db >= today;
      if (aFuture && bFuture) return da - db;
      if (!aFuture && !bFuture) return db - da;
      return aFuture ? -1 : 1;
    })
    .slice(0, 8);

  return (
    <section>
      <div className="container-salam section-salam">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          viewport={{ once: true }}
          className="mb-[clamp(2rem,5vw,4rem)] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-xl">
            <span className="badge-pill mb-4 border-salam-green/20 bg-green-50 text-salam-green">
              Activités
            </span>
            <h2 className="subtitle-salam text-salam-ink">Prochains événements</h2>
            <p className="text-salam mt-3 text-neutral-600">
              Sport, culture, éducation et bénévolat — découvrez notre programme pour la saison.
            </p>
          </div>
          <Link
            href="/activites"
            className="group inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-salam-green transition-all"
          >
            Tout voir
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ── Cards ── */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex snap-x gap-[clamp(1rem,2vw,1.5rem)] overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((activity, i) => {
            const cat = CAT[activity.category] ?? CAT.culture;
            const formattedDate = new Date(activity.startDate ?? activity.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric',
            });

            return (
              <motion.article
                key={activity._id}
                variants={card}
                className="card-salam group flex min-w-[82%] snap-start flex-col overflow-hidden sm:min-w-[48%] lg:min-w-[31%]"
              >
                {/* Cover image or color bar */}
                {activity.imageUrl ? (
                  <div className="relative h-36 w-full shrink-0 overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activity.thumbnailUrl || activity.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                ) : (
                  <div className={`h-1.5 w-full shrink-0 ${TOPS[i % TOPS.length]}`} />
                )}

                <div className="flex flex-1 flex-col p-[clamp(1rem,2vw,1.5rem)]">
                  {/* Category badge */}
                  <span className={`badge-pill mb-4 self-start border ${cat.border} ${cat.bg} ${cat.text}`}>
                    {cat.label}
                  </span>

                  {/* Title */}
                  <h3
                    className="font-black leading-tight text-salam-ink transition-colors duration-200 group-hover:text-salam-green"
                    style={{ fontSize: 'clamp(1rem,1.8vw,1.25rem)' }}
                  >
                    {activity.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-neutral-500">
                    <RichText value={activity.description ?? 'Activite SALAM publiee par le bureau.'} />
                  </p>

                  {/* Meta */}
                  <ul className="mt-5 flex flex-col gap-1.5 text-[12px] text-neutral-500">
                    <li className="flex items-center gap-2">
                      <Calendar size={12} className="shrink-0 text-salam-green" />
                      {formattedDate}
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin size={12} className="shrink-0 text-salam-red" />
                      {activity.location ?? 'Lieu a confirmer'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Users size={12} className="shrink-0 text-amber-500" />
                      {activity.capacity ? `${activity.capacity} places` : 'Ouvert aux membres'}
                    </li>
                  </ul>

                  {/* CTA */}
                  <Link
                    href={`/activites/${activity.slug}`}
                    onClick={() => trackEvent('activity_click', {
                      activity_id: activity._id,
                      activity_slug: activity.slug,
                      activity_title: activity.title,
                      category: activity.category,
                      status: activity.status,
                      source: 'home_preview',
                      action: 'card_cta_click',
                    })}
                    className="group/link mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-salam-green"
                  >
                    Voir l'activité
                    <ArrowRight size={13} className="transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
          {items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-8 text-sm font-semibold text-neutral-400">
              Aucune activite publiee pour le moment.
            </div>
          )}
        </motion.div>

        {/* Mobile "See all" */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 text-center md:hidden"
        >
          <Link
            href="/activites"
            className="inline-flex items-center gap-2 rounded-full bg-salam-green px-7 py-3 text-sm font-bold text-white hover:bg-green-800"
          >
            Toutes les activités <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
