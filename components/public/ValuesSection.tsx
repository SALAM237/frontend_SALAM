'use client';
import { motion } from 'framer-motion';
import { Heart, Globe, Handshake, LucideIcon } from 'lucide-react';

interface Value {
  Icon: LucideIcon;
  title: string;
  description: string;
  accent: { text: string; bg: string; border: string; iconBg: string };
}

const VALUES: Value[] = [
  {
    Icon: Heart,
    title: 'Solidarité',
    description:
      "Nous nous entraidons au quotidien : logement, emploi, orientation, démarches administratives. Personne ne traverse seul les difficultés de l'intégration.",
    accent: { text: 'text-salam-red', bg: 'bg-red-50', border: 'border-red-100', iconBg: 'bg-red-100' },
  },
  {
    Icon: Globe,
    title: 'Culture & Identité',
    description:
      'Valoriser les cultures camerounaise et marocaine à travers soirées, expositions, gastronomie et échanges interculturels enrichissants.',
    accent: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-100' },
  },
  {
    Icon: Handshake,
    title: 'Réseau & Carrière',
    description:
      'Mettre en relation les membres pour créer des opportunités professionnelles, stages, emplois et projets entrepreneuriaux communs.',
    accent: { text: 'text-salam-green', bg: 'bg-green-50', border: 'border-green-100', iconBg: 'bg-green-100' },
  },
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
const item = {
  hidden:   { opacity: 0, y: 28 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export function ValuesSection() {
  return (
    <section>
      <div className="container-salam section-salam">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mb-[clamp(2.5rem,5vw,4.5rem)] max-w-2xl"
        >
          <span className="badge-pill mb-5 border-salam-green/20 bg-green-50 text-salam-green">
            Nos piliers
          </span>
          <h2 className="subtitle-salam text-salam-ink">
            Des valeurs qui<br />nous rassemblent
          </h2>
          <p className="text-salam mt-4 text-neutral-600">
            SALAM repose sur trois piliers fondateurs qui guident chacune de nos actions
            et définissent notre identité commune.
          </p>
        </motion.div>

        {/* ── Cards ── */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-[clamp(1rem,2vw,1.5rem)] md:grid-cols-3"
        >
          {VALUES.map(({ Icon, title, description, accent }) => (
            <motion.article
              key={title}
              variants={item}
              className={`group card-salam border ${accent.border} ${accent.bg} p-[clamp(1.5rem,3vw,2.5rem)]`}
            >
              {/* Icon */}
              <div
                className={`mb-6 inline-flex size-[clamp(48px,5vw,60px)] items-center justify-center rounded-2xl ${accent.iconBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={24} className={accent.text} />
              </div>

              {/* Text */}
              <h3
                className={`font-black leading-tight ${accent.text}`}
                style={{ fontSize: 'clamp(1.15rem,2vw,1.4rem)' }}
              >
                {title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-600">{description}</p>

              {/* Decorative bottom line */}
              <div className={`mt-6 h-[3px] w-12 rounded-full ${accent.iconBg} transition-all duration-300 group-hover:w-20`} />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
