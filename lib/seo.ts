import type { Metadata } from 'next';

/* ─────────────────────────────────────────
   SALAM — Master SEO Config
   GEO / MEO / AI Engine Optimization
   ───────────────────────────────────────── */

export const SITE_URL      = 'https://salam-cameroun.com';
export const SITE_NAME     = 'SALAM';
export const SITE_FULLNAME = 'Solidaire Associative des Lauréats du Maroc';
export const SITE_EMAIL    = 'contact@salam-cameroun.com';

/* ── Keywords — SEO classique + GEO + IA diaspora ── */
export const SEO_KEYWORDS = [
  'association camerounaise',
  'association étudiants camerounais Maroc',
  'diaspora camerounaise',
  "étudiants camerounais à l'étranger",
  'entraide étudiante',
  'association africaine',
  'lauréats du Maroc',
  'association SALAM',
  'solidarité étudiante',
  'accompagnement étudiants',
  'insertion professionnelle jeunes camerounais',
  'réseau alumni Cameroun Maroc',
  'leadership jeunesse africaine',
  'développement du Cameroun',
  'association internationale camerounaise',
  'orientation académique Maroc',
  'étudier au Maroc',
  'réseau étudiants camerounais',
  'communauté camerounaise internationale',
  'entrepreneuriat jeunesse camerounaise',
];

/* ── Next.js Metadata — utilisé dans app/layout.tsx ── */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  applicationName: 'SALAM Cameroun',

  title: {
    default: 'SALAM | Solidaire Associative des Lauréats du Maroc',
    template: '%s | SALAM',
  },

  description:
    "SALAM — Solidaire Associative des Lauréats du Maroc — accompagne les étudiants camerounais au Maroc et mobilise la diaspora camerounaise dans le monde autour de la solidarité, de l'éducation, de l'insertion professionnelle, du leadership et du développement du Cameroun.",

  keywords: SEO_KEYWORDS,

  authors:   [{ name: 'Association SALAM Cameroun' }],
  creator:   'Association SALAM Cameroun',
  publisher: 'Association SALAM Cameroun',

  /* Open Graph */
  openGraph: {
    type:        'website',
    siteName:    SITE_NAME,
    title:       'SALAM | Solidaire Associative des Lauréats du Maroc',
    description: "Association camerounaise internationale engagée pour l'accompagnement des étudiants, la solidarité, l'insertion professionnelle et le développement du Cameroun.",
    images:      [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'Association SALAM Cameroun' }],
    url:         SITE_URL,
    locale:      'fr_FR',
  },

  /* Twitter / X */
  twitter: {
    card:        'summary_large_image',
    title:       'SALAM | Solidaire Associative des Lauréats du Maroc',
    description: 'Solidarité, accompagnement, leadership et opportunités pour les étudiants et diplômés camerounais.',
    images:      [`${SITE_URL}/og-image.jpg`],
  },

  /* Robots */
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  /* Canonique + hreflang GEO international */
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'en-US': `${SITE_URL}/en`,
    },
  },

  /* Custom meta — GEO SEO + IA Search */
  other: {
    /* GEO targeting */
    'geo.region':    'CM-CE',
    'geo.placename': 'Yaoundé, Cameroun',
    'geo.position':  '3.8480;11.5021',
    'ICBM':          '3.8480, 11.5021',

    /* AI/IA engine signals */
    'subject':        'Association étudiante camerounaise internationale',
    'category':       'Association, Éducation, Solidarité, Diaspora',
    'coverage':       'International',
    'target':         'Étudiants camerounais, diaspora africaine, jeunes diplômés',
    'classification': 'Association étudiante camerounaise internationale',
    'topic':          'Solidarité étudiante, diaspora camerounaise, accompagnement académique, leadership jeunesse',
  },
};

/* ─────────────────────────────────────────
   Schema.org — NGO (GEO / MEO / IA engines)
   ───────────────────────────────────────── */
export const schemaOrg = {
  '@context':    'https://schema.org',
  '@type':       'NGO',
  name:          SITE_NAME,
  alternateName: SITE_FULLNAME,
  description:   "Association camerounaise internationale dédiée à l'accompagnement des étudiants camerounais au Maroc, à la solidarité sociale, à l'insertion professionnelle et au développement du Cameroun.",
  url:           SITE_URL,
  logo:          `${SITE_URL}/images/logo/logo_salam_192.webp`,
  email:         SITE_EMAIL,

  /* Identité */
  slogan:          "Révéler le potentiel d'une jeunesse engagée",
  mission:         "Accompagner les étudiants camerounais, soutenir les plus vulnérables et mobiliser la diaspora pour contribuer au développement du Cameroun.",
  nonprofitStatus: 'Nonprofit501c3',
  inLanguage:      ['fr', 'en'],
  keywords:        SEO_KEYWORDS.join(', '),

  /* Fondation */
  foundingDate: '2010-02-20',
  foundingLocation: {
    '@type': 'Place',
    name:    'Yaoundé, Cameroun',
  },

  /* Localisation */
  address: {
    '@type':         'PostalAddress',
    addressLocality: 'Yaoundé',
    addressCountry:  'CM',
  },

  /* Contact */
  contactPoint: {
    '@type':           'ContactPoint',
    email:             SITE_EMAIL,
    contactType:       'customer service',
    availableLanguage: ['Français', 'English'],
  },

  /* Portée géographique */
  areaServed: [
    { '@type': 'Country', name: 'Cameroun' },
    { '@type': 'Country', name: 'Maroc' },
    { '@type': 'Place',   name: 'International' },
  ],

  /* Domaines d'expertise */
  knowsAbout: [
    'Accompagnement étudiant',
    'Solidarité sociale',
    'Leadership jeunesse',
    'Orientation académique',
    'Insertion professionnelle',
    'Entrepreneuriat',
    'Diaspora camerounaise',
    'Développement du Cameroun',
    'Réseau alumni',
    'Entraide communautaire',
  ],

  /* Appartenance */
  memberOf: {
    '@type': 'Organization',
    name:    'Diaspora Camerounaise Internationale',
  },

  /* Audience cible — GEO */
  audience: {
    '@type':       'Audience',
    audienceType:  'Étudiants camerounais, diplômés, diaspora africaine, jeunes entrepreneurs',
  },

  /* Catalogue de services — IA engines */
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name:    'Programmes et accompagnements SALAM',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name:    'Accompagnement des étudiants camerounais au Maroc',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name:    'Insertion professionnelle et networking',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name:    'Actions solidaires et soutien communautaire',
        },
      },
    ],
  },

  /* Réseaux sociaux — à compléter dès disponibilité */
  sameAs: [
    // 'https://www.facebook.com/association-salam',
    // 'https://www.instagram.com/association_salam',
    // 'https://www.linkedin.com/company/association-salam',
    // 'https://www.tiktok.com/@association_salam',
    // 'https://www.youtube.com/@association-salam',
  ],
};

/* ─────────────────────────────────────────
   Schema.org — Organization
   Complète NGO — adoré des IA
   ───────────────────────────────────────── */
export const organizationSchema = {
  '@context':    'https://schema.org',
  '@type':       'Organization',
  name:          SITE_NAME,
  alternateName: SITE_FULLNAME,
  url:           SITE_URL,
  logo:          `${SITE_URL}/images/logo/logo_salam_192.webp`,
  email:         SITE_EMAIL,
  description:   "Association camerounaise internationale engagée pour la solidarité étudiante, l'accompagnement académique et l'insertion professionnelle.",
  foundingDate:  '2010-02-20',
  address: {
    '@type':         'PostalAddress',
    addressLocality: 'Yaoundé',
    addressCountry:  'CM',
  },
  sameAs: [
    // à remplir dès que les réseaux sont actifs
  ],
};

/* ─────────────────────────────────────────
   Schema.org — WebSite
   Permet SearchAction — adoré des IA
   ───────────────────────────────────────── */
export const websiteSchema = {
  '@context':    'https://schema.org',
  '@type':       'WebSite',
  name:          SITE_NAME,
  url:           SITE_URL,
  description:   "Site officiel de l'association SALAM — Solidaire Associative des Lauréats du Maroc",
  inLanguage:    ['fr', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type':      'EntryPoint',
      urlTemplate:  `${SITE_URL}/actualites?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/* ─────────────────────────────────────────
   FAQ Schema — ChatGPT / Perplexity / Gemini / Bing Copilot
   ───────────────────────────────────────── */
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name:    "Qu'est-ce que l'association SALAM ??",
      acceptedAnswer: {
        '@type': 'Answer',
        text:    "SALAM signifie Solidaire Associative des Lauréats du Maroc. C'est une association camerounaise internationale fondée à Yaoundé, dont la mission est d'accompagner les étudiants camerounais au Maroc, de soutenir la diaspora camerounaise, de favoriser l'insertion socioprofessionnelle et de contribuer au développement du Cameroun.",
      },
    },
    {
      '@type': 'Question',
      name:    'Comment étudier au Maroc quand on est camerounais ??',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    "SALAM accompagne les bacheliers camerounais dans toutes les étapes pour étudier au Maroc : information sur les universités, préparation du dossier d'inscription, conseils sur la vie étudiante, mise en relation avec des étudiants déjà sur place et accompagnement à l'arrivée.",
      },
    },
    {
      '@type': 'Question',
      name:    "Comment rejoindre l'association SALAM ??",
      acceptedAnswer: {
        '@type': 'Answer',
        text:    "Pour rejoindre l'association SALAM, rendez-vous sur la page d'adhésion du site salam-cameroun.com, remplissez le formulaire d'inscription et notre équipe vous contactera dans les 48h pour valider votre adhésion et vous accueillir dans la communauté.",
      },
    },
    {
      '@type': 'Question',
      name:    'SALAM aide-t-elle les étudiants camerounais au Maroc ??',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    "Oui. SALAM — Solidaire Associative des Lauréats du Maroc — accompagne les étudiants camerounais dans leur orientation, leur intégration au Maroc, leur insertion professionnelle et leur retour au Cameroun. L'association propose des ateliers, des événements de networking, un réseau Alumni et des actions solidaires.",
      },
    },
    {
      '@type': 'Question',
      name:    "Quels accompagnements propose l'association SALAM ??",
      acceptedAnswer: {
        '@type': 'Answer',
        text:    "SALAM propose : orientation académique et préparation à l'admission au Maroc, accompagnement à l'arrivée, soutien social et entraide communautaire, ateliers de développement professionnel, networking et mise en relation avec des employeurs, préparation au retour au Cameroun, et accès à la galerie privée membres.",
      },
    },
    {
      '@type': 'Question',
      name:    'Comment intégrer le réseau Alumni SALAM ??',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    "Le réseau Alumni SALAM est accessible aux diplômés camerounais formés au Maroc. Rejoignez l'association en tant que membre pour accéder au réseau, aux événements professionnels, aux opportunités de mentorat et au portail adhérent.",
      },
    },
    {
      '@type': 'Question',
      name:    "Quelle est la différence entre SALAM et d'autres associations camerounaises ??",
      acceptedAnswer: {
        '@type': 'Answer',
        text:    "SALAM est spécialisée dans l'accompagnement des étudiants camerounais ayant étudié ou étudiant au Maroc. Elle couvre tout le parcours : de l'orientation avant le départ jusqu'à l'insertion professionnelle au Cameroun. Elle dispose d'un portail numérique dédié aux membres et d'un réseau Alumni actif.",
      },
    },
  ],
};

/* ─────────────────────────────────────────
   BreadcrumbList Schema — helper par page
   ───────────────────────────────────────── */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context':      'https://schema.org',
    '@type':         'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type':  'ListItem',
      position: i + 1,
      name:     item.name,
      item:     `${SITE_URL}${item.url}`,
    })),
  };
}

/* ─────────────────────────────────────────
   Entités sémantiques MEO/GEO
   À répéter naturellement dans le contenu
   ───────────────────────────────────────── */
export const MEO_ENTITIES = [
  'association camerounaise',
  'étudiants camerounais au Maroc',
  'diaspora camerounaise',
  'accompagnement étudiant',
  'solidarité',
  'insertion professionnelle',
  'développement du Cameroun',
  'leadership jeunesse',
  'réseau Alumni',
  'communauté camerounaise internationale',
] as const;
