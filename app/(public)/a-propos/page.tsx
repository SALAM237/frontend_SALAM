import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Heart, Users, Target, Lightbulb, Zap, BookOpen, Briefcase, HandHeart, Megaphone } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'À propos de SALAM',
  description:
    "SALAM — Solidaire Associative des Lauréats du Maroc — est une association camerounaise fondée le 20 février 2010 à Yaoundé, engagée pour les étudiants camerounais au Maroc et la diaspora africaine.",
};

const VALEURS = [
  {
    letter: 'S', title: 'Solidarité',
    color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', glow: 'text-red-400/10',
    text: "Créer une communauté solidaire au service des étudiants et des personnes les plus vulnérables.",
  },
  {
    letter: 'A', title: 'Accompagnement',
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', glow: 'text-emerald-400/10',
    text: "Accompagner chaque étudiant vers la réussite grâce à l'orientation, l'intégration et le suivi personnalisé.",
  },
  {
    letter: 'L', title: 'Leadership',
    color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', glow: 'text-yellow-400/10',
    text: "Transformer les compétences en opportunités académiques, professionnelles et entrepreneuriales pour les jeunes.",
  },
  {
    letter: 'A', title: 'Action',
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', glow: 'text-blue-400/10',
    text: "Faire des étudiants des acteurs engagés du développement du Cameroun par l'innovation et la mobilisation citoyenne.",
  },
  {
    letter: 'M', title: 'Mobilisation',
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', glow: 'text-emerald-400/10',
    text: "Mobiliser les talents et les énergies de la diaspora autour d'un impact collectif et durable pour le Cameroun.",
  },
];

const CHIFFRES = [
  { val: '2010', label: 'Année de fondation',    icon: Heart },
  { val: '200+', label: 'Membres actifs',          icon: Users },
  { val: '50+',  label: 'Activités organisées',    icon: Target },
  { val: '15+',  label: "Années d'engagement",     icon: Globe },
];

const DOMAINES = [
  {
    icon: BookOpen,
    title: 'Orientation académique',
    text: "Accompagnement des bacheliers camerounais dans toutes les étapes pour étudier au Maroc : choix d'université, constitution de dossier, préparation au départ.",
  },
  {
    icon: HandHeart,
    title: 'Intégration & entraide',
    text: "Accueil des nouveaux arrivants, mise en relation avec la communauté SALAM, soutien social et accompagnement des personnes en difficulté.",
  },
  {
    icon: Briefcase,
    title: 'Insertion professionnelle',
    text: "Préparation au marché du travail, ateliers CV et entretien, networking, mise en relation avec des employeurs et soutien à l'entrepreneuriat.",
  },
  {
    icon: Megaphone,
    title: 'Mobilisation citoyenne',
    text: "Encourager l'engagement citoyen, la transmission d'expertise et les actions solidaires pour contribuer au développement du Cameroun.",
  },
  {
    icon: Lightbulb,
    title: 'Entrepreneuriat',
    text: "Soutien aux projets entrepreneuriaux des membres, partage d'expertise, mise en réseau avec des mentors et des opportunités de financement.",
  },
  {
    icon: Zap,
    title: 'Réseau Alumni',
    text: "Un réseau actif de diplômés camerounais formés au Maroc, partout dans le monde, pour des opportunités professionnelles et un impact durable.",
  },
];

export default function AProposPage() {
  return (
    <main>
      <PageHero
        badge="Association SALAM"
        title="de SALAM"
        accentWord="À propos"
        accentPosition="start"
        subtitle="Solidaire Associative des Lauréats du Maroc — une association camerounaise fondée en 2010 à Yaoundé, au service des étudiants, des diplômés et de la diaspora."
        breadcrumbs={[{ label: 'À propos' }]}
      />

      {/* ── Histoire ── */}
      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>
              <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Notre histoire</span>
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
                Née de la <span className="text-emerald-700">solidarité</span>,<br />
                portée par la jeunesse
              </h2>
              <p className="mt-5 text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.85] text-neutral-600">
                SALAM — <em>Solidaire Associative des Lauréats du Maroc</em> — est une association camerounaise créée le <strong>20 février 2010 à Yaoundé</strong>, avec pour mission d&apos;accompagner les étudiants camerounais au Maroc, de renforcer la solidarité entre les membres de la diaspora et de contribuer au développement du Cameroun.
              </p>
              <p className="mt-4 text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.85] text-neutral-600">
                Née d&apos;une volonté commune des anciens étudiants et diplômés formés au Maroc, SALAM agit comme un réseau d&apos;entraide, d&apos;accompagnement et d&apos;opportunités pour les jeunes camerounais — de l&apos;orientation avant le départ jusqu&apos;à l&apos;insertion professionnelle au retour.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/adhesion" className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20">
                  Rejoindre SALAM
                </Link>
                <Link href="/contact" className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-700 transition-all hover:border-emerald-400 hover:text-emerald-700">
                  Nous contacter
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[clamp(1rem,2vw,2rem)] bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600 shadow-2xl shadow-emerald-900/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(247,198,0,0.15),transparent_50%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <Globe size={48} className="text-white/20" />
                <p className="text-base font-black text-white/80">Cameroun · Maroc · Monde</p>
                <p className="text-xs leading-relaxed text-white/45">
                  Un réseau de diplômés camerounais<br />partout dans le monde
                </p>
              </div>
              <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-black text-white">Fondée le 20 février 2010</p>
                <p className="mt-0.5 text-xs text-white/60">Yaoundé, Cameroun · Plus de 15 ans d&apos;engagement</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="bg-white px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-[clamp(2rem,5vw,4rem)]">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Notre mission</span>
            <p className="text-[clamp(1.1rem,2.2vw,1.5rem)] font-black leading-[1.35] tracking-[-0.02em] text-neutral-900">
              Rassembler étudiants, diplômés et membres de la diaspora camerounaise autour de valeurs de{' '}
              <span className="text-emerald-700">solidarité</span>,{' '}
              <span className="text-yellow-600">leadership</span>,{' '}
              <span className="text-red-600">transmission</span>{' '}
              et d&apos;engagement social — pour former une communauté forte capable d&apos;impacter durablement le Cameroun et de soutenir les générations futures.
            </p>
          </div>
        </div>
      </section>

      {/* ── Chiffres ── */}
      <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {CHIFFRES.map(({ val, label, icon: Icon }) => (
              <div key={label} className="group text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 transition-all group-hover:bg-white/15">
                  <Icon size={20} className="text-emerald-300" />
                </div>
                <p className="text-[clamp(2rem,5vw,2.8rem)] font-black leading-none tracking-[-0.06em] text-white">{val}</p>
                <p className="mt-2 text-sm text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Valeurs SALAM ── */}
      <section id="valeurs" className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Nos valeurs</span>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Ce que signifie <span className="text-emerald-700">SALAM</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {VALEURS.map(({ letter, title, color, bg, border, glow, text }) => (
              <div key={title} className={`relative overflow-hidden rounded-[1.5rem] border ${border} ${bg} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}>
                <span className={`absolute right-3 top-1 text-[5.5rem] font-black leading-none ${glow}`}>{letter}</span>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <span className={`text-xl font-black ${color}`}>{letter}</span>
                </div>
                <h3 className={`mb-2 text-sm font-black ${color}`}>{title}</h3>
                <p className="text-xs leading-[1.65] text-neutral-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Domaines d'action ── */}
      <section className="bg-white px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Nos domaines d&apos;action</span>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Comment SALAM <span className="text-emerald-700">agit concrètement</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">
              De l&apos;orientation académique à l&apos;insertion professionnelle, SALAM intervient à chaque étape du parcours des étudiants et diplômés camerounais.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DOMAINES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-[1.5rem] border border-neutral-100 bg-neutral-50 p-6 transition-all hover:border-emerald-200 hover:shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Icon size={20} className="text-emerald-700" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-sm font-black text-neutral-900">{title}</h3>
                  <p className="text-xs leading-relaxed text-neutral-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Équipe ── */}
      <section id="equipe" className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">L&apos;équipe</span>
            <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Ceux qui font vivre <span className="text-emerald-700">SALAM</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: '/mot-du-president',  label: 'Mot du président',  desc: "Le message et la vision du président de l'association", color: 'bg-red-600'     },
              { href: '/bureau-executif',   label: 'Bureau exécutif',   desc: "Les membres élus qui dirigent et coordonnent l'association", color: 'bg-emerald-600' },
              { href: '/conseil-des-sages', label: 'Conseil des sages', desc: "Les personnalités expérimentées qui guident et conseillent SALAM", color: 'bg-neutral-800' },
            ].map(({ href, label, desc, color }) => (
              <Link key={href} href={href} className="group flex flex-col gap-3 rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className={`h-1.5 w-10 rounded-full ${color}`} />
                <h3 className="font-black text-neutral-900 transition-colors group-hover:text-emerald-700">{label}</h3>
                <p className="text-sm text-neutral-500">{desc}</p>
                <span className="mt-auto text-xs font-bold text-emerald-600">Découvrir →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#061009] px-5 py-[clamp(4rem,8vw,6rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-400">Rejoindre la communauté</span>
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-black leading-[0.92] tracking-[-0.04em] text-white">
            Ensemble, construisons<br />
            <span className="text-emerald-400">notre avenir</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[clamp(0.9rem,1.2vw,1rem)] leading-relaxed text-white/50">
            Rejoignez le réseau SALAM et faites partie d&apos;une communauté engagée pour la réussite des étudiants camerounais et le développement du Cameroun.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/adhesion" className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-500 px-8 text-sm font-black text-white transition-all hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20">
              Devenir membre
            </Link>
            <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-8 text-sm font-semibold text-white/65 transition-all hover:border-white/35 hover:text-white">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
