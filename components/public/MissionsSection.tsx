'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, scroll } from 'motion';

/* ─────────────────────────────────────────
   Données missions
   ───────────────────────────────────────── */
const MISSIONS = [
  {
    num: '01',
    badge: 'Mission 1',
    lines: ['Préparer les', 'futurs étudiants'],
    accent: '#0B8F3A',
    resume:
      "Informer, orienter et accompagner les nouveaux bacheliers camerounais souhaitant poursuivre leurs études supérieures au Maroc.",
    actions: [
      "Réunions d'information",
      "Orientation académique",
      "Préparation administrative",
      "Vie étudiante au Maroc",
      "Mise en relation",
      "Accompagnement avant le départ",
    ],
  },
  {
    num: '02',
    badge: 'Mission 2',
    lines: ['Insertion', 'socioprofessionnelle'],
    accent: '#3B82F6',
    resume:
      "Accompagner les étudiants camerounais formés au Maroc dans leur retour au Cameroun et faciliter leur intégration socioprofessionnelle.",
    actions: [
      "Préparation au retour",
      "Orientation professionnelle",
      "Mise en relation avec les entreprises",
      "Forums & networking",
      "Accompagnement carrière",
      "Réseau Alumni",
    ],
  },
  {
    num: '03',
    badge: 'Mission 3',
    lines: ['Solidarité &', 'action sociale'],
    accent: '#C8102E',
    resume:
      "Promouvoir la solidarité, l'entraide et l'action sociale en faveur des étudiants et des populations les plus vulnérables.",
    actions: [
      "Actions solidaires",
      "Soutien aux personnes vulnérables",
      "Fundraising & collectes",
      "Aide humanitaire",
      "Mobilisation citoyenne",
      "Partenariats sociaux",
    ],
  },
  {
    num: '04',
    badge: 'Mission 4',
    lines: ['Développement', 'du Cameroun'],
    accent: '#F7C600',
    resume:
      "Valoriser les compétences acquises à l'international afin de contribuer activement au développement économique, social et entrepreneurial du Cameroun.",
    actions: [
      "Forums & conférences",
      "Entrepreneuriat & innovation",
      "Accompagnement de projets",
      "Réseau d'expertise",
      "Coopération & partenariats",
      "Contribution citoyenne",
    ],
  },
] as const;

const N = MISSIONS.length;

/* ── Hex → rgba ── */
function ha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ─────────────────────────────────────────
   Section principale
   ───────────────────────────────────────── */
export function MissionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ulRef     = useRef<HTMLUListElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const ul      = ulRef.current;
    if (!section || !ul) return;

    /* ── Animation de translation horizontale liée au scroll ── */
    const controls = animate(
      ul,
      { transform: ['none', `translateX(-${N - 1}00vw)`] } as any,
      {}
    );
    const stopScroll = scroll(controls, { target: section });

    /* ── Suivi de la slide active (pour les capsules) ── */
    const trackActive = () => {
      const rect  = section.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const total    = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(1, scrolled / total);
      setActiveIdx(Math.min(N - 1, Math.round(progress * (N - 1))));
    };
    window.addEventListener('scroll', trackActive, { passive: true });
    trackActive();

    return () => {
      stopScroll();
      window.removeEventListener('scroll', trackActive);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${N * 100}vh` }}
      className="relative"
    >
      {/* ────────────────────────────────────────
          Fenêtre sticky (100 vh, fixée en haut)
          ──────────────────────────────────────── */}
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ background: '#070f09' }}
      >
        {/* ── Barre de progression top ── */}
        <div
          className="absolute top-0 left-0 right-0 z-40"
          style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(activeIdx / (N - 1)) * 100}%`,
              background: 'linear-gradient(90deg,#0B8F3A 0%,#C8102E 50%,#F7C600 100%)',
            }}
          />
        </div>

        {/* ── En-tête flottant ── */}
        <div
          className="absolute z-30 flex items-center justify-between left-0 right-0"
          style={{ top: 0, padding: '1.4rem clamp(2rem,5vw,6rem) 0' }}
        >
          <div>
            <span
              className="block font-black uppercase text-emerald-500"
              style={{ fontSize: '0.57rem', letterSpacing: '0.36em', opacity: 0.7, marginBottom: '0.3rem' }}
            >
              Association SALAM
            </span>
            <h2
              className="font-black text-white"
              style={{ fontSize: 'clamp(0.92rem,1.4vw,1.25rem)', letterSpacing: '-0.03em' }}
            >
              Nos Missions
            </h2>
          </div>

          {/* Capsules indicatrices */}
          <div className="flex items-center gap-2">
            {MISSIONS.map((m, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500 ease-out"
                style={{
                  height: '0.34rem',
                  width: i === activeIdx ? '1.75rem' : '0.34rem',
                  background: i === activeIdx ? m.accent : 'rgba(255,255,255,0.11)',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Strip horizontal ── */}
        <ul
          ref={ulRef}
          className="flex h-full m-0 p-0"
          style={{ listStyle: 'none', willChange: 'transform' }}
        >
          {MISSIONS.map((mission, i) => (
            <MissionSlide key={mission.num} mission={mission} index={i} />
          ))}
        </ul>

        {/* ── Invite scroll ── */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3"
          style={{ color: 'rgba(255,255,255,0.14)' }}
        >
          <div className="h-px w-5 bg-current" />
          <span
            className="uppercase font-semibold"
            style={{ fontSize: '0.5rem', letterSpacing: '0.32em' }}
          >
            Défiler pour explorer
          </span>
          <div className="h-px w-5 bg-current" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Slide individuelle
   ───────────────────────────────────────── */
function MissionSlide({
  mission,
  index,
}: {
  mission: (typeof MISSIONS)[number];
  index: number;
}) {
  const acc = mission.accent;

  return (
    <li
      className="relative flex-shrink-0 flex items-center"
      style={{ width: '100vw', height: '100%' }}
    >
      {/* Lueur d'ambiance */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 68% 62% at 64% 54%, ${ha(acc, 0.08)} 0%, transparent 62%)`,
        }}
      />

      {/* Numéro décoratif fond */}
      <div
        className="pointer-events-none absolute select-none font-black"
        style={{
          right: 'clamp(1rem,3vw,4rem)',
          bottom: 0,
          fontSize: 'clamp(8rem,19vw,17rem)',
          lineHeight: 0.8,
          letterSpacing: '-0.05em',
          color: acc,
          opacity: 0.04,
        }}
      >
        {mission.num}
      </div>

      {/* Bande latérale gauche */}
      <div
        className="absolute left-0 rounded-r-full"
        style={{
          top: '22%',
          bottom: '22%',
          width: '2.5px',
          background: acc,
          opacity: 0.42,
        }}
      />

      {/* ── Contenu ── */}
      <div
        className="relative z-10 w-full mx-auto"
        style={{
          maxWidth: '72rem',
          padding: '0 clamp(3rem,6vw,7rem)',
        }}
      >
        <div
          className="grid items-center gap-10 md:gap-0"
          style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
        >

          {/* ───── Colonne gauche ───── */}
          <div
            className="flex flex-col justify-center"
            style={{ paddingRight: 'clamp(0px,4.5vw,4.5rem)' }}
          >
            {/* Badge mission */}
            <div style={{ marginBottom: '1.6rem' }}>
              <span
                className="inline-flex items-center gap-2 rounded-full font-black uppercase"
                style={{
                  fontSize: '0.57rem',
                  letterSpacing: '0.2em',
                  padding: '0.26rem 0.85rem',
                  border: `1px solid ${ha(acc, 0.36)}`,
                  background: ha(acc, 0.09),
                  color: acc,
                }}
              >
                <span
                  className="rounded-full flex-shrink-0"
                  style={{ width: '0.35rem', height: '0.35rem', background: acc }}
                />
                {mission.badge}
              </span>
            </div>

            {/* Titre grande police */}
            <h3
              className="font-black text-white"
              style={{
                fontSize: 'clamp(2.9rem,5.5vw,5.6rem)',
                lineHeight: 0.87,
                letterSpacing: '-0.045em',
                marginBottom: '1.5rem',
              }}
            >
              {mission.lines[0]}
              <br />
              <span style={{ color: acc }}>{mission.lines[1]}</span>
            </h3>

            {/* Séparateur ornemental */}
            <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '2.4rem', height: '2px', borderRadius: '999px', background: acc }} />
              <div style={{ width: '0.7rem', height: '2px', borderRadius: '999px', background: ha(acc, 0.38) }} />
            </div>

            {/* Résumé officiel */}
            <p
              style={{
                fontSize: 'clamp(0.82rem,0.98vw,0.95rem)',
                lineHeight: 1.9,
                color: 'rgba(255,255,255,0.46)',
                maxWidth: '36ch',
              }}
            >
              {mission.resume}
            </p>
          </div>

          {/* ───── Divider vertical (md+) ───── */}
          <div
            className="hidden md:block absolute top-[10%] bottom-[10%]"
            style={{ left: '50%', width: '1px', background: ha(acc, 0.1) }}
          />

          {/* ───── Colonne droite ───── */}
          <div
            className="flex flex-col justify-center"
            style={{ paddingLeft: 'clamp(0px,4.5vw,4.5rem)' }}
          >
            {/* Question de concrétisation */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p
                className="font-semibold leading-snug"
                style={{ fontSize: 'clamp(0.88rem,1.15vw,1.04rem)', color: 'rgba(255,255,255,0.68)' }}
              >
                Comment cette mission
                <br />
                <span className="text-white font-black">se concrétise&nbsp;?</span>
              </p>
            </div>

            {/* Ligne décorative */}
            <div
              style={{
                width: '1.8rem',
                height: '1px',
                marginBottom: '1.5rem',
                background: ha(acc, 0.42),
                borderRadius: '999px',
              }}
            />

            {/* Liste des actions */}
            <ul className="m-0 p-0" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {mission.actions.map((action, ai) => (
                <li key={ai} className="flex items-center" style={{ gap: '0.85rem' }}>
                  <span
                    className="flex-shrink-0 rounded-full"
                    style={{ width: '0.28rem', height: '0.28rem', background: acc, opacity: 0.78 }}
                  />
                  <span
                    className="font-medium"
                    style={{
                      fontSize: 'clamp(0.77rem,0.88vw,0.87rem)',
                      color: 'rgba(255,255,255,0.5)',
                      letterSpacing: '0.005em',
                    }}
                  >
                    {action}
                  </span>
                </li>
              ))}
            </ul>

            {/* Compteur */}
            <div
              className="font-black uppercase"
              style={{
                marginTop: '2.2rem',
                fontSize: '0.5rem',
                letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.11)',
              }}
            >
              {mission.num}&ensp;/&ensp;{String(N).padStart(2, '0')}
            </div>
          </div>

        </div>
      </div>
    </li>
  );
}
