'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const PERKS = ['Accès au portail adhérent', 'Messagerie interne', 'Tarifs préférentiels', 'Réseau exclusif'];

export function CTABanner() {
  return (
    <section className="py-[clamp(2rem,4vw,4rem)]">
      <div className="container-salam">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0B8F3A 0%, #0a7a32 45%, #064d20 100%)',
            borderRadius: 'clamp(1.5rem,3vw,2.5rem)',
            padding: 'clamp(2.5rem,6vw,5rem)',
          }}
        >
          {/* ── Background decorations ── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div
              className="absolute -right-24 -top-24 rounded-full opacity-[0.06]"
              style={{ width: 380, height: 380, background: '#F7C600', filter: 'blur(60px)' }}
            />
            <div
              className="absolute -bottom-16 -left-16 rounded-full opacity-[0.07]"
              style={{ width: 280, height: 280, background: '#C8102E', filter: 'blur(50px)' }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
          </div>

          {/* Flag stripe top */}
          <div
            className="absolute left-0 right-0 top-0 h-[4px]"
            style={{ background: 'linear-gradient(90deg, #0B8F3A 33%, #C8102E 33%, #C8102E 66%, #F7C600 66%)' }}
          />

          {/* ── Content ── */}
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            {/* Left */}
            <div className="max-w-lg">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5">
                <Sparkles size={12} className="text-salam-yellow" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                  Rejoignez la communauté
                </span>
              </div>

              <h2
                className="font-black leading-tight text-white"
                style={{ fontSize: 'clamp(1.8rem,4vw,3.2rem)', letterSpacing: '-0.04em' }}
              >
                Faites partie de<br />l'aventure SALAM
              </h2>

              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                Rejoignez plus de 128 membres actifs et bénéficiez du réseau,
                des activités et de l'entraide de l'association.
              </p>

              {/* Perks */}
              <ul className="mt-5 grid grid-cols-1 gap-y-2 xs:grid-cols-2">
                {PERKS.map(p => (
                  <li key={p} className="flex items-center gap-2 text-[13px] text-white/80">
                    <CheckCircle2 size={14} className="shrink-0 text-salam-yellow" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right – CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch xl:flex-row">
              <Link
                href="/adhesion"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black text-salam-green shadow-xl shadow-black/15 transition-all duration-200 hover:bg-salam-yellow hover:shadow-salam-yellow/30"
              >
                Devenir membre <ArrowRight size={15} />
              </Link>
              <Link
                href="/a-propos"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 px-7 py-4 text-sm font-bold text-white transition-all duration-200 hover:border-white/50 hover:bg-white/10"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
