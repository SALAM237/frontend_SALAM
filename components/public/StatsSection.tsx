'use client';
import { motion } from 'framer-motion';
import { Users, CalendarDays, Images, Heart } from 'lucide-react';
import { NumberTicker } from '@/components/magic-ui/NumberTicker';

const STATS = [
  {
    value: 128,
    suffix: '+',
    label: 'Membres actifs',
    sub: 'dans notre réseau',
    Icon: Users,
    accent: { text: 'text-salam-green', bg: 'bg-green-50', border: 'border-green-100', iconBg: 'bg-green-100' },
  },
  {
    value: 24,
    suffix: '',
    label: 'Activités 2026',
    sub: 'sport, culture, éducation',
    Icon: CalendarDays,
    accent: { text: 'text-salam-red', bg: 'bg-red-50', border: 'border-red-100', iconBg: 'bg-red-100' },
  },
  {
    value: 320,
    suffix: '+',
    label: 'Photos partagées',
    sub: 'dans la galerie',
    Icon: Images,
    accent: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-100' },
  },
  {
    value: 5,
    suffix: ' ans',
    label: "D'histoire commune",
    sub: 'et de croissance',
    Icon: Heart,
    accent: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', iconBg: 'bg-purple-100' },
  },
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const card = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
};

export function StatsSection() {
  return (
    <section className="bg-salam-light">
      <div className="container-salam section-salam-s">

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="mb-[clamp(1.5rem,3vw,2.5rem)] text-center text-[12px] font-bold uppercase tracking-[.16em] text-salam-green"
        >
          SALAM en chiffres
        </motion.p>

        {/* Cards grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-[clamp(0.75rem,1.5vw,1.25rem)] xs:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map(({ value, suffix, label, sub, Icon, accent }) => (
            <motion.div
              key={label}
              variants={card}
              className={`card-salam border ${accent.border} ${accent.bg} p-[clamp(1.25rem,2.5vw,2rem)]`}
            >
              {/* Icon */}
              <div className={`mb-[clamp(1rem,2vw,1.5rem)] inline-flex size-11 items-center justify-center rounded-2xl ${accent.iconBg}`}>
                <Icon size={20} className={accent.text} />
              </div>

              {/* Number */}
              <NumberTicker
                value={value}
                suffix={suffix}
                className={`block text-[clamp(2rem,4.5vw,3.2rem)] font-black leading-none ${accent.text}`}
                duration={2.4}
              />

              {/* Labels */}
              <p className="mt-2.5 text-[14px] font-bold text-salam-ink">{label}</p>
              <p className="mt-1 text-[12px] text-neutral-500">{sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
