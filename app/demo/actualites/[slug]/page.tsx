'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, FlaskConical, Share2, Bookmark } from 'lucide-react';

const NEWS = [
  {
    id: 'n1', slug: 'lancement-plateforme-salam', category: 'association', date: '15 mai 2026', author: 'Bureau SALAM',
    title: 'Lancement de la nouvelle plateforme SALAM',
    excerpt: 'Une plateforme moderne pour connecter les membres et simplifier la gestion associative.',
    content: `L'association SALAM franchit une nouvelle étape avec le lancement officiel de sa plateforme numérique. Ce projet, porté par l'ensemble du bureau et développé en étroite collaboration avec nos membres, répond à un besoin croissant de modernisation et d'efficacité.\n\nLa plateforme offre un espace membre personnalisé, une gestion des activités en temps réel, une messagerie interne sécurisée et un système de carte membre numérique. Chaque adhérent peut désormais accéder à ses informations, s'inscrire aux événements et contacter d'autres membres depuis n'importe quel appareil.\n\nCette initiative s'inscrit dans la vision stratégique de SALAM pour 2026-2028 : renforcer les liens entre les membres de la diaspora camerounaise et créer un réseau solide d'entraide et de solidarité.`,
  },
  {
    id: 'n2', slug: 'forum-emploi-2026', category: 'reseau', date: '10 mai 2026', author: 'Commission Réseau',
    title: 'Forum Emploi SALAM 2026 : 200 participants réunis',
    excerpt: 'La 5e édition du Forum Emploi a réuni employeurs et jeunes professionnels de la diaspora.',
    content: `Pour sa 5e édition, le Forum Emploi SALAM a rassemblé plus de 200 participants à Paris. Cet événement annuel est devenu un rendez-vous incontournable pour les jeunes professionnels de la diaspora camerounaise en France et au Maroc.\n\nAu programme : tables rondes thématiques, ateliers CV et entretien, rencontres avec des recruteurs de grandes entreprises partenaires, et présentations d'opportunités au Cameroun et à l'international.\n\nParmi les participants, 35 % ont décroché un entretien dans les deux semaines suivant le forum, et 12 offres d'emploi ont été proposées directement sur place. Un succès qui témoigne de la vitalité du réseau SALAM.`,
  },
  {
    id: 'n3', slug: 'partenariat-minsup', category: 'partenariat', date: '2 mai 2026', author: 'Président SALAM',
    title: 'Partenariat officiel avec le MINSUP',
    excerpt: 'SALAM renforce ses liens avec le Ministère de l\'Enseignement Supérieur.',
    content: `SALAM a signé une convention de partenariat avec le Ministère de l'Enseignement Supérieur du Cameroun (MINSUP). Cet accord officialise une collaboration déjà fructueuse et ouvre la voie à de nouvelles initiatives en faveur des étudiants camerounais.\n\nConcrètement, ce partenariat permettra à SALAM de diffuser les offres de bourses et d'échanges universitaires, d'accompagner les étudiants dans leurs démarches administratives et d'organiser des sessions d'information dans les universités camerounaises.\n\nLe président de SALAM a salué cette avancée : "Ce partenariat représente une reconnaissance institutionnelle de notre travail et renforce notre capacité à accompagner nos membres dans leurs projets académiques et professionnels."`,
  },
  {
    id: 'n4', slug: 'bourse-excellence-2026', category: 'etude', date: '25 avr 2026', author: 'Commission Études',
    title: 'Bourse d\'excellence SALAM 2026 — Candidatures ouvertes',
    excerpt: 'Les dossiers de candidature pour la bourse d\'excellence SALAM sont disponibles.',
    content: `La bourse d'excellence SALAM 2026 est ouverte aux candidatures jusqu'au 30 juin 2026. Cette bourse, dotée de 1 500 € par lauréat, récompense les étudiants membres de SALAM qui se distinguent par leur excellence académique et leur engagement associatif.\n\nCritères d'éligibilité : être membre actif de SALAM depuis au moins 6 mois, être inscrit dans un établissement d'enseignement supérieur en France ou au Maroc, et justifier d'une moyenne générale supérieure à 14/20 ou équivalent.\n\nLes dossiers de candidature sont à télécharger depuis l'espace membre. Trois lauréats seront sélectionnés par la commission et annoncés lors de la cérémonie de fin d'année.`,
  },
  {
    id: 'n5', slug: 'tournoi-sport-printemps', category: 'sport', date: '18 avr 2026', author: 'Commission Sport',
    title: 'Tournoi sportif du printemps : résultats',
    excerpt: 'Le tournoi inter-antennes de football a rassemblé 8 équipes et plus de 120 joueurs.',
    content: `Le tournoi sportif de printemps s'est tenu le 13 avril 2026 au stade municipal de Saint-Denis. Huit équipes représentant les antennes de Paris, Lyon, Bordeaux, Casablanca, Rabat et Yaoundé ont participé à cette journée de compétition conviviale.\n\nAprès des matchs intenses et sportifs, c'est l'équipe de l'antenne de Paris qui a remporté le trophée, suivie de Casablanca en deuxième position. Le prix du fair-play a été attribué à l'équipe de Bordeaux.\n\nAu-delà de la compétition, cette journée a été l'occasion de renforcer les liens entre membres de différentes antennes et de préparer la rentrée sportive 2026-2027. Le prochain tournoi est d'ores et déjà prévu pour l'automne.`,
  },
  {
    id: 'n6', slug: 'journee-integration', category: 'association', date: '12 avr 2026', author: 'Bureau SALAM',
    title: 'Journée d\'intégration des nouveaux membres',
    excerpt: 'Accueil chaleureux pour les 24 nouveaux membres ayant rejoint l\'association en avril 2026.',
    content: `L'association SALAM a accueilli 24 nouveaux membres lors de la journée d'intégration du 10 avril 2026. Cet événement trimestriel est une tradition fondatrice de SALAM : chaque nouveau membre est introduit aux valeurs, aux activités et aux instances de l'association avant de rejoindre pleinement la communauté.\n\nAu programme de cette journée : présentation des commissions thématiques (sport, études, réseau, solidarité), visite de l'espace de travail collaboratif mis à disposition par un partenaire, et repas convivial préparé par les membres bénévoles.\n\nParmi les nouveaux arrivants, on compte des étudiants en master, des jeunes professionnels et plusieurs membres de la famille SALAM installés récemment en France et au Maroc.`,
  },
];

const CAT_COLORS: Record<string, string> = {
  association: 'bg-emerald-100 text-emerald-700',
  reseau:      'bg-blue-100 text-blue-700',
  etude:       'bg-yellow-100 text-yellow-700',
  sport:       'bg-red-100 text-red-700',
  partenariat: 'bg-purple-100 text-purple-700',
};

const CAT_GRADIENTS: Record<string, string> = {
  association: 'from-emerald-500 to-emerald-700',
  reseau:      'from-blue-500 to-blue-700',
  etude:       'from-yellow-400 to-orange-500',
  sport:       'from-red-500 to-red-700',
  partenariat: 'from-purple-500 to-purple-700',
};

export default function DemoActualiteDetailPage({ params }: { params: { slug: string } }) {
  const article = NEWS.find(n => n.slug === params.slug);

  if (!article) {
    return (
      <main className="min-h-screen bg-[#fffdf8] px-5 py-16 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-black text-neutral-900">Article introuvable</h1>
          <Link href="/demo/actualites" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600">
            <ArrowLeft size={14} /> Toutes les actualités
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = article.content.split('\n\n');

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Demo banner */}
      <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-yellow-200 bg-yellow-50 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-800">
          <FlaskConical size={13} />
          Mode démo — données fictives
        </div>
        <Link href="/actualites" className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 transition-colors">
          ← Version production
        </Link>
      </div>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${CAT_GRADIENTS[article.category] ?? 'from-emerald-600 to-emerald-800'} px-5 py-16 md:px-8 lg:px-12`}>
        <div className="mx-auto max-w-4xl">
          <Link href="/demo/actualites" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Toutes les actualités
          </Link>
          <span className={`mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white`}>
            {article.category}
          </span>
          <h1 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.92] tracking-[-0.04em] text-white">
            {article.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{article.date}</span>
            <span className="flex items-center gap-1.5"><User size={14} />{article.author}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-10 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_240px]">

          {/* Main */}
          <div className="flex flex-col gap-6">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
              <p className="mb-6 text-base font-semibold leading-relaxed text-neutral-600 italic">{article.excerpt}</p>
              <div className="h-px bg-neutral-100 mb-6" />
              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="leading-[1.85] text-neutral-700">{p}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-neutral-400">Informations</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-neutral-600"><Calendar size={13} className="text-neutral-400" />{article.date}</li>
                <li className="flex items-center gap-2 text-neutral-600"><User size={13} className="text-neutral-400" />{article.author}</li>
                <li className="flex items-center gap-2 text-neutral-600">
                  <Tag size={13} className="text-neutral-400" />
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${CAT_COLORS[article.category] ?? 'bg-neutral-100 text-neutral-600'}`}>
                    {article.category}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-neutral-400">Actions</h3>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-all">
                  <Share2 size={13} /> Partager
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-all">
                  <Bookmark size={13} /> Sauvegarder
                </button>
              </div>
            </div>

            <Link
              href="/adhesion"
              className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-center transition-all hover:bg-emerald-100"
            >
              <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-700">Rejoindre SALAM</p>
              <p className="mt-1 text-xs text-emerald-600">Accédez à l'intégralité des actualités en devenant membre.</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
