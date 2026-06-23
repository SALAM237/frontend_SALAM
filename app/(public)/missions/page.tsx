'use client';

import { useState, useRef, useEffect, type ElementType } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// export const revalidate = 86400; // désactivé : 'use client' — non supporté, cause une erreur Vercel build
import {
  GraduationCap, Briefcase, HandHeart, TrendingUp,
  AlertCircle, CheckCircle2, ArrowRight, Building2,
  ChevronLeft, ChevronRight, ListChecks,
} from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';

// ── Types ──────────────────────────────────────────────────────────────────
type AccentKey = 'emerald' | 'blue' | 'orange' | 'yellow';

interface MissionData {
  id: string;
  num: string;
  title: string;
  shortTitle: string;
  icon: ElementType;
  bg: string;
  accentKey: AccentKey;
  objective: string;
  problematiques: string[];
  actions: { title: string; desc: string }[];
  workflow: string[];
  impacts: string[];
  partners: string[];
}

// ── Accent map ─────────────────────────────────────────────────────────────
const ACCENT: Record<AccentKey, {
  badge: string; badgeBg: string; badgeBgFaded: string; badgeText: string;
  iconBg: string; iconText: string;
  numText: string; numBg: string;
  bar: string; dot: string;
  arrowStroke: string;
}> = {
  emerald: {
    badge: 'ring-emerald-500/30 bg-emerald-500/10', badgeBg: 'bg-emerald-600', badgeBgFaded: 'bg-emerald-600/70', badgeText: 'text-emerald-400',
    iconBg: 'bg-emerald-100', iconText: 'text-emerald-700',
    numText: 'text-emerald-700', numBg: 'bg-emerald-600',
    bar: 'bg-emerald-500', dot: 'bg-emerald-500',
    arrowStroke: 'border-emerald-600 text-emerald-700',
  },
  blue: {
    badge: 'ring-blue-500/30 bg-blue-500/10', badgeBg: 'bg-blue-600', badgeBgFaded: 'bg-blue-600/70', badgeText: 'text-blue-400',
    iconBg: 'bg-blue-100', iconText: 'text-blue-700',
    numText: 'text-blue-700', numBg: 'bg-blue-600',
    bar: 'bg-blue-500', dot: 'bg-blue-500',
    arrowStroke: 'border-blue-600 text-blue-700',
  },
  orange: {
    badge: 'ring-orange-500/30 bg-orange-500/10', badgeBg: 'bg-orange-600', badgeBgFaded: 'bg-orange-600/70', badgeText: 'text-orange-400',
    iconBg: 'bg-orange-100', iconText: 'text-orange-700',
    numText: 'text-orange-700', numBg: 'bg-orange-600',
    bar: 'bg-orange-500', dot: 'bg-orange-500',
    arrowStroke: 'border-orange-600 text-orange-700',
  },
  yellow: {
    badge: 'ring-yellow-500/30 bg-yellow-500/10', badgeBg: 'bg-yellow-500', badgeBgFaded: 'bg-yellow-500/70', badgeText: 'text-yellow-600',
    iconBg: 'bg-yellow-100', iconText: 'text-yellow-700',
    numText: 'text-yellow-700', numBg: 'bg-yellow-500',
    bar: 'bg-yellow-400', dot: 'bg-yellow-400',
    arrowStroke: 'border-yellow-500 text-yellow-600',
  },
};

// ── Data ───────────────────────────────────────────────────────────────────
const MISSIONS: MissionData[] = [
  {
    id: 'preparer',
    num: '01',
    title: 'Préparer les futurs étudiants',
    shortTitle: 'Orientation',
    icon: GraduationCap,
    bg: 'bg-[#f5fbf7]',
    accentKey: 'emerald',
    objective: "Préparer les nouveaux bacheliers camerounais avant leur départ au Maroc afin de leur permettre de réussir leur projet académique et leur intégration.",
    problematiques: [
      "Départ sans connaissance des procédures ni du système universitaire marocain",
      "Absence de réseau et d'informations fiables sur place",
      "Risque d'isolement, de mauvais choix d'orientation et d'échec académique",
      "Difficultés administratives et d'intégration à l'arrivée au Maroc",
    ],
    actions: [
      { title: "Réunions d'information", desc: "Sessions organisées pour rencontrer les étudiants souhaitant poursuivre leurs études au Maroc." },
      { title: "Orientation académique", desc: "Conseils dans le choix des filières, sélection des établissements et préparation du projet d'études." },
      { title: "Préparation administrative", desc: "Aide pour dossiers d'inscription, candidatures, bourses, visas et démarches administratives." },
      { title: "Vie étudiante au Maroc", desc: "Sensibilisation sur logement, coût de la vie, culture marocaine, transports, sécurité et intégration." },
      { title: "Mise en réseau", desc: "Connexion avec la CASAM, les réseaux étudiants et anciens camerounais au Maroc." },
    ],
    workflow: ["Bachelier au Cameroun", "Réunion SALAM", "Orientation", "Préparation admin.", "Départ Maroc", "Accueil & intégration"],
    impacts: [
      "Meilleure préparation au départ",
      "Réduction de l'isolement",
      "Meilleur choix d'orientation",
      "Moins d'échecs académiques",
      "Intégration facilitée",
      "Réseau dès l'arrivée",
    ],
    partners: ["MINSUP", "AMCI", "CASAM", "Ambassade du Maroc au Cameroun", "Ambassade du Cameroun au Maroc"],
  },
  {
    id: 'insertion',
    num: '02',
    title: "Accompagner le retour et l'insertion professionnelle",
    shortTitle: 'Insertion',
    icon: Briefcase,
    bg: 'bg-white',
    accentKey: 'blue',
    objective: "Préparer les étudiants en fin de formation à leur retour au Cameroun et faciliter leur insertion socioprofessionnelle.",
    problematiques: [
      "Difficultés d'insertion professionnelle au retour au Cameroun",
      "Manque de réseau professionnel et déconnexion du marché local",
      "Compétences acquises à l'étranger mal valorisées",
      "Déconnexion entre la formation reçue et les réalités du marché de l'emploi",
      "Absence d'accompagnement structuré au moment du retour",
    ],
    actions: [
      { title: "Recensement des diplômés", desc: "Identification des étudiants en fin de formation sur le point de rentrer au Cameroun." },
      { title: "Préparation au retour", desc: "Réunions, séances de coaching et ateliers d'orientation professionnelle avant le départ." },
      { title: "Forums de recrutement", desc: "Mise en relation avec entreprises, recruteurs, partenaires économiques et institutions." },
      { title: "Networking Alumni", desc: "Réseau professionnel pour faciliter recrutements, synergies et opportunités durables." },
      { title: "Suivi post-insertion", desc: "Accompagnement après retour : emploi, stages, entrepreneuriat, intégration professionnelle." },
    ],
    workflow: ["Fin de formation", "Recensement SALAM", "Préparation au retour", "Coaching pro", "Mise en relation", "Insertion / Emploi", "Contribution Cameroun"],
    impacts: [
      "Réduction du chômage des diplômés",
      "Valorisation des compétences acquises",
      "Renforcement du tissu économique",
      "Recrutement de talents facilité",
      "Retour structuré des compétences",
      "Réseau professionnel national",
    ],
    partners: ["MINSUP", "MINEFOP", "GICAM", "Réseau Alumni SALAM", "Entreprises partenaires"],
  },
  {
    id: 'solidarite',
    num: '03',
    title: "Solidarité & action sociale",
    shortTitle: 'Solidarité',
    icon: HandHeart,
    bg: 'bg-[#fffdf8]',
    accentKey: 'orange',
    objective: "Agir concrètement pour soutenir les étudiants, les personnes vulnérables et les communautés dans le besoin.",
    problematiques: [
      "Difficultés financières et précarité des étudiants",
      "Isolement social et vulnérabilité des nouveaux arrivants",
      "Urgences humanitaires et accès limité aux ressources essentielles",
      "Populations vulnérables sans soutien institutionnel suffisant",
    ],
    actions: [
      { title: "Soutien aux étudiants", desc: "Aides matérielles et financières, accompagnement moral et soutien social aux étudiants en difficulté." },
      { title: "Actions humanitaires", desc: "Distributions alimentaires, dons, campagnes solidaires, collectes et interventions d'urgence." },
      { title: "Soutien aux communautés", desc: "Aide aux orphelinats, soutien aux structures sociales, accompagnement des populations vulnérables." },
      { title: "Bien-être & inclusion", desc: "Actions sur la santé mentale, l'écoute active, l'inclusion et la solidarité communautaire." },
    ],
    workflow: ["Identification du besoin", "Mobilisation SALAM", "Action solidaire", "Suivi", "Impact communautaire"],
    impacts: [
      "Renforcement du lien social",
      "Réduction de l'isolement étudiant",
      "Soutien aux plus vulnérables",
      "Culture de solidarité ancrée",
      "Mobilisation citoyenne",
      "Actions humanitaires durables",
    ],
    partners: ["CASAM", "Associations étudiantes", "ONG locales", "Mécènes & Donateurs"],
  },
  {
    id: 'developpement',
    num: '04',
    title: "Participer au développement du Cameroun",
    shortTitle: 'Développement',
    icon: TrendingUp,
    bg: 'bg-white',
    accentKey: 'yellow',
    objective: "Valoriser les compétences acquises au Maroc pour contribuer activement au développement économique, social et technologique du Cameroun.",
    problematiques: [
      "Fuite des cerveaux et manque de valorisation des compétences locales",
      "Chômage des jeunes diplômés qualifiés",
      "Faible connexion entre la diaspora intellectuelle et le développement national",
      "Manque de structures d'innovation et d'entrepreneuriat pour les jeunes",
    ],
    actions: [
      { title: "Entrepreneuriat & startups", desc: "Accompagnement des jeunes entrepreneurs, projets innovants et startups portés par des diplômés." },
      { title: "Réseau d'experts Alumni", desc: "Mobilisation des anciens étudiants, cadres, ingénieurs, chercheurs et entrepreneurs." },
      { title: "Forums & conférences", desc: "Conférences économiques, rencontres professionnelles et forums de développement national." },
      { title: "Partenariats stratégiques", desc: "Collaboration avec institutions, entreprises, organisations et acteurs économiques clés." },
    ],
    workflow: ["Compétences au Maroc", "Retour au Cameroun", "Réseau Alumni SALAM", "Entrepreneuriat", "Forums & Partenariats", "Développement national"],
    impacts: [
      "Création d'entreprises et startups",
      "Innovation locale et technologique",
      "Création d'emplois durables",
      "Renforcement des compétences",
      "Participation au développement",
      "Réduction de la fuite des cerveaux",
    ],
    partners: ["MINPMEESA", "GICAM", "Réseau Alumni SALAM", "Incubateurs & Startups", "Institutions financières"],
  },
];

// ── Recap table ────────────────────────────────────────────────────────────
const RECAP_AXES = [
  { label: "Orientation & préparation au départ",       scores: [100, 20,  0,   0  ] },
  { label: "Accompagnement académique",                  scores: [90,  30,  0,   0  ] },
  { label: "Soutien social & entraide",                  scores: [40,  60,  100, 30 ] },
  { label: "Insertion professionnelle",                  scores: [10,  100, 0,   60 ] },
  { label: "Entrepreneuriat & innovation",               scores: [0,   40,  0,   100] },
  { label: "Développement économique national",          scores: [0,   70,  20,  100] },
  { label: "Action humanitaire & solidarité",            scores: [0,   0,   100, 10 ] },
  { label: "Réseau & partenariats stratégiques",         scores: [70,  90,  40,  100] },
];

const KEYWORDS = [
  { word: 'Orientation',     desc: 'Préparer les futurs étudiants.',                            id: 'preparer',      dot: 'bg-emerald-500', cls: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
  { word: 'Accompagnement',  desc: 'Soutenir les étudiants avant, pendant et après leur parcours.', id: 'insertion',  dot: 'bg-blue-500',    cls: 'border-blue-100 bg-blue-50 text-blue-700'           },
  { word: 'Insertion',       desc: "Faciliter l'intégration professionnelle des diplômés.",     id: 'solidarite',    dot: 'bg-orange-500',  cls: 'border-orange-100 bg-orange-50 text-orange-700'     },
  { word: 'Développement',   desc: 'Mettre les compétences au service du Cameroun.',            id: 'developpement', dot: 'bg-yellow-500',  cls: 'border-yellow-100 bg-yellow-50 text-yellow-700'     },
];

// ── Composant principal ────────────────────────────────────────────────────
const VALID_IDS = ['preparer', 'insertion', 'solidarite', 'developpement'];

export default function MissionsPage() {
  const [activeId, setActiveId] = useState<string>('preparer');
  const [lastDirection, setLastDirection] = useState<'prev' | 'next' | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const tabsRef      = useRef<HTMLDivElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number | null>(null);
  const sentinelRef  = useRef<HTMLDivElement>(null);

  // Lit le paramètre ?m= côté client uniquement
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get('m');
    if (m && VALID_IDS.includes(m)) setActiveId(m);
  }, []);

  // Écoute la visibilité du Header pour ajuster le top du sticky nav
  useEffect(() => {
    const handler = (e: Event) => {
      setHeaderVisible((e as CustomEvent<{ visible: boolean }>).detail.visible);
    };
    window.addEventListener('salam:header', handler);
    return () => window.removeEventListener('salam:header', handler);
  }, []);

  // Easing cubic ease-in-out
  const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // Anime scrollLeft du nav via RAF
  const smoothScrollNav = (nav: HTMLDivElement, targetLeft: number, duration = 380) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = nav.scrollLeft;
    const dist  = targetLeft - start;
    if (Math.abs(dist) < 1) return;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      nav.scrollLeft = start + dist * ease(p);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  // Scroll directionnel de la nav selon l'index cliqué vs précédent
  const slideNav = (clickedIndex: number, prevIndex: number) => {
    const nav = navScrollRef.current;
    if (!nav) return;
    const items       = nav.querySelectorAll<HTMLElement>('.mission-nav-item');
    const clickedItem = items[clickedIndex];
    if (!clickedItem) return;
    const maxScroll = nav.scrollWidth - nav.clientWidth;
    let target: number;

    if (clickedIndex > prevIndex) {
      // Clic à droite → item cliqué colle au bord GAUCHE
      target = Math.min(clickedItem.offsetLeft - 8, maxScroll);
    } else if (clickedIndex < prevIndex) {
      // Clic à gauche → item cliqué colle au bord DROIT
      target = Math.max(clickedItem.offsetLeft + clickedItem.offsetWidth - nav.clientWidth + 8, 0);
    } else {
      // Même item → recentre
      target = Math.min(Math.max(clickedItem.offsetLeft - nav.clientWidth / 2 + clickedItem.offsetWidth / 2, 0), maxScroll);
    }

    smoothScrollNav(nav, target);
  };

  const selectMission = (id: string) => {
    const prevIndex    = MISSIONS.findIndex(m => m.id === activeId);
    const clickedIndex = MISSIONS.findIndex(m => m.id === id);
    if (clickedIndex > prevIndex) setLastDirection('next');
    else if (clickedIndex < prevIndex) setLastDirection('prev');
    setActiveId(id);
    slideNav(clickedIndex, prevIndex);
    // Sentinel is in normal flow (never sticky) → getBoundingClientRect gives true document position
    const sentinel = sentinelRef.current;
    if (sentinel) {
      const target = sentinel.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    }
  };

  return (
    <main>

      {/* ── Hero ── */}
      <PageHero
        badge="Nos missions"
        title="stratégiques de la SALAM"
        accentWord="Les missions"
        accentPosition="start"
        subtitle="Un pont entre les étudiants, la diaspora et le développement du Cameroun — la SALAM agit comme une structure stratégique d'orientation, d'accompagnement, d'intégration et de valorisation des compétences camerounaises acquises à l'international."
        breadcrumbs={[{ label: 'Missions' }]}
      />

      {/* ── Mission globale ── */}
      {/*<section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-0">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-[clamp(1.5rem,4vw,3rem)]">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Mission globale</span>
            <p className="text-[clamp(1.05rem,2vw,1.35rem)] font-black leading-[1.38] tracking-[-0.02em] text-neutral-900">
              Accompagner, orienter et valoriser les étudiants camerounais formés au Maroc afin de faciliter leur{' '}
              <span className="text-emerald-700">intégration académique</span>,{' '}
              <span className="text-blue-700">professionnelle</span>{' '}
              et leur{' '}
              <span className="text-yellow-600">contribution au développement du Cameroun</span>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Cameroun', 'Maroc', 'Étudiants', 'Diplômés', 'Entreprises', 'Diaspora intellectuelle', 'Développement national'].map(tag => (
                <span key={tag} className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-bold text-emerald-700">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>*/}

      {/* Sentinel: normal-flow anchor used to compute scroll target for the sticky nav */}
      <div ref={sentinelRef} />

      {/* ── Sticky Tab Nav ── */}
      <div
        ref={tabsRef}
        className="sticky z-30 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur-sm"
        style={{ top: headerVisible ? '68px' : '0px', transition: 'top 300ms ease-out' }}
      >
        <div ref={navScrollRef} className="mx-auto max-w-6xl overflow-x-auto px-4 md:px-8 lg:px-0" style={{ scrollbarWidth: 'none' }}>
          <div className="flex min-w-max gap-1 py-2">
            {MISSIONS.map(m => {
              const a = ACCENT[m.accentKey];
              const active = activeId === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => selectMission(m.id)}
                  className={`mission-nav-item relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-xs font-black transition-colors duration-200 ${
                    active ? 'text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="mission-tab-bg"
                      className={`absolute inset-0 ${a.badgeBgFaded} rounded-xl`}
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.42 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={13} />
                    <span className="hidden sm:inline">{m.num} —</span>
                    {m.shortTitle}
                  </span>
                </button>
              );
            })}
            {/*<button
              onClick={() => {
                document.getElementById('recap')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              Récap
            </button>*/}
          </div>
        </div>
      </div>

      {/* ── Mission active — AnimatePresence slide ── */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {MISSIONS.map((m, mi) => {
            if (m.id !== activeId) return null;
            const a = ACCENT[m.accentKey];
            const Icon = m.icon;
            const isEven = mi % 2 === 1;
            return (
              <motion.section
                key={m.id}
                initial={{ opacity: 0, x: 72 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, x: -72, transition: { duration: 0.22, ease: [0.55, 0, 1, 0.45] } }}
                className={`relative ${m.bg} px-5 pt-[clamp(1.5rem,3vw,2.5rem)] pb-[clamp(4rem,8vw,6rem)] md:px-8 lg:px-0`}
              >
                {/* Motif ndop — overlay subtil sur le bg clair */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.02]"
                  style={{
                    backgroundImage: "url('/images/placeholders/ndop motif WBG.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'sepia(1) saturate(3) hue-rotate(80deg)',
                  }}
                />
            <div className="mx-auto max-w-6xl space-y-10">

              {/* Mission header */}
              <div className={`flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <div className="flex w-full items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${a.iconBg}`}>
                      <Icon size={22} className={a.iconText} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.28em] ${a.numText}`}>Mission {m.num}</span>

                    {/* Flèches navigation */}
                    {(() => {
                      const isFirst = mi === 0;
                      const isLast  = mi === MISSIONS.length - 1;
                      // Fill la flèche de la direction encore disponible quand on est au bout,
                      // sinon fill la dernière direction cliquée
                      const leftFilled  = isLast  || (!isFirst && lastDirection === 'prev');
                      const rightFilled = isFirst || (!isLast  && lastDirection === 'next');
                      return (
                        <div className="ml-auto flex items-center gap-1.5">
                          <button
                            onClick={() => { selectMission(MISSIONS[mi - 1].id); setLastDirection('prev'); }}
                            disabled={isFirst}
                            aria-label="Mission précédente"
                            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed ${
                              leftFilled
                                ? `${a.numBg} border-transparent text-white`
                                : `bg-transparent ${a.arrowStroke}`
                            }`}
                          >
                            <ChevronLeft size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => { selectMission(MISSIONS[mi + 1].id); setLastDirection('next'); }}
                            disabled={isLast}
                            aria-label="Mission suivante"
                            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed ${
                              rightFilled
                                ? `${a.numBg} border-transparent text-white`
                                : `bg-transparent ${a.arrowStroke}`
                            }`}
                          >
                            <ChevronRight size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                  <h2 className="mt-4 text-[clamp(1.6rem,3.5vw,2.6rem)] font-black leading-[0.95] tracking-[-0.04em] text-neutral-900">
                    {m.title}
                  </h2>
                  <p className="mt-4 text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.8] text-neutral-600">
                    {m.objective}
                  </p>
                </div>
              </div>

              {/* Problèmes + Actions + Impacts */}
              <div className="grid gap-5 lg:grid-cols-3">

              {/* Problématiques — rouge bouton hero */}
              <div className="rounded-2xl bg-red-400 p-5 sm:p-6">
                <div className="mb-6 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <AlertCircle size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Problématiques traitées</span>
                </div>
                <ul className="space-y-3">
                  {m.problematiques.map((p, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                      <span className="text-sm leading-relaxed text-white">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Impacts — vert bouton hero */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 sm:p-6">
                <div className="mb-6 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Impacts recherchés</span>
                </div>
                <div className="grid gap-2.5">
                  {m.impacts.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-white/70" />
                      <span className="text-sm leading-snug text-white">{imp}</span>
                    </div>
                  ))}
                </div>
              </div>

              

                {/* Actions */}
                <div className="rounded-2xl bg-yellow-200 p-5 sm:p-6">
                  <div className="mb-6 flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10">
                      <ListChecks size={14} className="text-neutral-800" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Actions mises en place</span>
                  </div>
                  <ul className="space-y-4">
                    {m.actions.map((act, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-black text-white">{i + 1}</span>
                        <div>
                          <p className="text-sm font-black text-black">{act.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-black/60">{act.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Workflow */}
               {/*<div className="rounded-2xl border border-neutral-100 bg-white px-5 py-6 shadow-sm">
                <span className="mb-5 block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Parcours type</span>
                <div className="overflow-x-auto pb-1">
                  <div className="flex min-w-max items-start gap-0">
                    {m.workflow.map((step, i) => (
                      <div key={i} className="flex items-start">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white shadow-sm ${a.badgeBg}`}>{i + 1}</div>
                          <span className="w-[90px] text-center text-[11px] leading-snug text-neutral-600">{step}</span>
                        </div>
                        {i < m.workflow.length - 1 && (
                          <ArrowRight size={15} className="mx-1 mt-2 shrink-0 text-neutral-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>*/}

               {/* Partenaires — pleine largeur, pills en row */}
                <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Building2 size={13} className="text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Partenaires</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.partners.map(p => (
                      <span
                        key={p}
                        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700"
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.dot}`} />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

            </div>
              </motion.section>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Récapitulatif des missions ── */}
      {/*<section id="recap" className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,6rem)] md:px-8 lg:px-0">
        <div className="mx-auto max-w-5xl">

          <div className="mb-10 text-center">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Vue synthétique</span>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Récapitulatif des <span className="text-emerald-700">missions</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-500">
              Tableau comparatif des 4 missions selon leurs axes d&apos;intervention.
            </p>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px]">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/60">
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">Axe d&apos;intervention</th>
                    {MISSIONS.map((m, mi) => {
                      const a = ACCENT[m.accentKey];
                      const Icon = m.icon;
                      return (
                        <th key={m.id} className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${a.iconBg}`}>
                              <Icon size={14} className={a.iconText} />
                            </div>
                            <span className="text-[11px] font-black text-neutral-700">{m.shortTitle}</span>
                            <span className={`text-[9px] font-black tracking-widest ${a.numText}`}>{m.num}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {RECAP_AXES.map((row, ri) => (
                    <tr key={ri} className="transition-colors hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5 text-sm text-neutral-700">{row.label}</td>
                      {row.scores.map((score, si) => {
                        const a = ACCENT[MISSIONS[si].accentKey];
                        return (
                          <td key={si} className="px-3 py-3.5">
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="h-2 w-full max-w-[72px] overflow-hidden rounded-full bg-neutral-100">
                                <div
                                  className={`h-full rounded-full ${a.bar} transition-all duration-700`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-black ${score === 0 ? 'text-neutral-300' : score >= 80 ? a.numText : 'text-neutral-400'}`}>
                                {score === 0 ? '—' : `${score}%`}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>*/}

            {/* Legend */}
            {/*<div className="flex flex-wrap items-center gap-4 border-t border-neutral-100 px-5 py-3.5">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-300">Légende</span>
              {MISSIONS.map(m => {
                const a = ACCENT[m.accentKey];
                const Icon = m.icon;
                return (
                  <div key={m.id} className="flex items-center gap-1.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${a.dot}`} />
                    <span className="text-[11px] text-neutral-500">{m.shortTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>*/}


      {/* ── 4 Mots-clés ── */}
      <section className="bg-white px-5 py-[clamp(4rem,8vw,6rem)] md:px-8 lg:px-0">
        <div className="mx-auto max-w-5xl">

          <div className="mb-10 text-center">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">En 4 mots</span>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              L&apos;ADN stratégique de <span className="text-emerald-700">SALAM</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KEYWORDS.map(({ word, desc, id, dot, cls }) => (
              <button
                key={word}
                onClick={() => selectMission(id)}
                className={`group flex flex-col items-start rounded-[1.5rem] border p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cls}`}
              >
                <div className={`mb-4 h-2.5 w-10 rounded-full ${dot}`} />
                <h3 className="mb-2 text-lg font-black leading-tight">{word}</h3>
                <p className="text-xs leading-relaxed opacity-70">{desc}</p>
                <span className="mt-auto pt-4 text-[11px] font-bold opacity-60 group-hover:opacity-100">
                  Voir la mission →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision + Chaîne de transmission ── */}
      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-0">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 lg:grid-cols-2">

            {/* Vision */}
            <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-[clamp(1.5rem,4vw,2.5rem)]">
              <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Notre vision</span>
              <p className="text-[clamp(1rem,1.8vw,1.2rem)] font-black leading-[1.45] tracking-[-0.02em] text-neutral-900">
                Former une génération capable de réussir à l&apos;international et de revenir construire le Cameroun.
              </p>
            </div>

            {/* Chaîne */}
            <div className="rounded-[2rem] border border-neutral-100 bg-white p-[clamp(1.5rem,4vw,2.5rem)] shadow-sm">
              <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-neutral-400">Chaîne de transmission</span>
              <div className="flex flex-wrap gap-2">
                {["Anciens étudiants", "Nouveaux bacheliers", "Étudiants au Maroc", "Jeunes diplômés", "Entreprises", "Institutions"].map((item, i, arr) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">{item}</span>
                    {i < arr.length - 1 && <ChevronRight size={12} className="text-emerald-400" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#061009] px-5 py-[clamp(4rem,8vw,6rem)] md:px-8 lg:px-0">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-400">Rejoindre la mission</span>
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-black leading-[0.92] tracking-[-0.04em] text-white">
            Participez à la construction<br />
            <span className="text-emerald-400">du Cameroun de demain</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[clamp(0.9rem,1.2vw,1rem)] leading-relaxed text-white/50">
            Rejoignez le réseau SALAM et contribuez à l&apos;une de nos missions — orientation, insertion, solidarité ou développement national.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/adhesion"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-500 px-8 text-sm font-black text-white transition-all hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20"
            >
              Devenir membre
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-8 text-sm font-semibold text-white/65 transition-all hover:border-white/35 hover:text-white"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
