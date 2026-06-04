import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Politique des cookies',
  description: "Politique d'utilisation des cookies et traceurs du site SALAM Cameroun.",
};

const UPDATED_AT = '4 juin 2026';

const cookieGroups = [
  {
    title: 'Cookies strictement nécessaires',
    status: 'Exemptés de consentement',
    description: "Ils permettent le fonctionnement du site, l'authentification, la sécurité des sessions et l'accès aux espaces protégés.",
    examples: ['salam_refresh', 'session applicative', 'prévention CSRF', 'sécurité des accès'],
  },
  {
    title: 'Cookies de sécurité',
    status: 'Exemptés de consentement',
    description: "Ils servent à détecter les connexions suspectes, limiter les abus, journaliser les accès et protéger les espaces admin et membre.",
    examples: ['logs de connexion', 'horodatage', 'adresse IP', 'détection brute-force'],
  },
  {
    title: 'Cookies analytiques',
    status: 'Soumis au consentement lorsque requis',
    description: "Ils mesurent l'audience, les pages vues, les clics et les conversions associatives afin d'améliorer le site.",
    examples: ['_ga', '_ga_*', 'page_view', 'don_click', 'adhesion_submit'],
  },
  {
    title: 'Stockage local fonctionnel',
    status: 'Selon finalité',
    description: "Il peut mémoriser certaines préférences d'affichage ou états d'interface pour améliorer l'expérience utilisateur.",
    examples: ['préférences UI', 'bannière cookies', 'état local non sensible'],
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-black text-neutral-900">{title}</h2>
      <div className="space-y-3 text-sm leading-[1.9] text-neutral-600">{children}</div>
      <div className="h-px bg-neutral-100" />
    </section>
  );
}

export default function CookiesPage() {
  return (
    <main>
      <PageHero
        badge="Cookies & traceurs"
        title="des cookies"
        accentWord="Politique"
        accentPosition="start"
        subtitle="Informations sur les cookies, traceurs, mesures d'audience et préférences utilisés sur salam-cameroun.com."
        breadcrumbs={[{ label: 'Cookies' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <article className="flex flex-col gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
              Dernière mise à jour : {UPDATED_AT}
            </p>

            <Section title="1. Introduction">
              <p>
                La présente politique explique comment SALAM Cameroun utilise les cookies et autres traceurs sur le site
                salam-cameroun.com. Elle est rédigée en tenant compte des règles applicables au Cameroun, du RGPD, de la
                directive ePrivacy et des recommandations de la CNIL lorsque des utilisateurs européens sont concernés.
              </p>
            </Section>

            <Section title="2. Qu'est-ce qu'un cookie ?">
              <p>
                Un cookie est un petit fichier ou identifiant stocké sur votre terminal lors de la consultation d'un site.
                Il peut permettre de maintenir une session, sécuriser un accès, mesurer l'audience ou mémoriser une préférence.
              </p>
              <p>
                Les cookies peuvent être temporaires, persistants, déposés directement par SALAM Cameroun ou par des
                services tiers intégrés au site.
              </p>
            </Section>

            <Section title="3. Cookies et traceurs utilisés">
              <div className="grid gap-4">
                {cookieGroups.map(group => (
                  <div key={group.title} className="rounded-[1.2rem] border border-neutral-100 bg-neutral-50 p-5">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-black text-neutral-900">{group.title}</h3>
                      <span className="w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                        {group.status}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-neutral-600">{group.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.examples.map(example => (
                        <span key={example} className="rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[11px] text-neutral-500">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="4. Google Analytics 4">
              <p>
                SALAM Cameroun utilise Google Analytics 4 pour comprendre l'utilisation du site et améliorer les contenus,
                la navigation et les campagnes associatives. Les événements suivis peuvent inclure les pages vues, clics,
                demandes de contact, intentions de don, soumissions d'adhésion, vues d'actualités, d'activités et
                d'opportunités.
              </p>
              <p>
                Les données collectées par Google Analytics sont pseudonymisées et traitées par Google selon ses propres
                conditions. Lorsque le RGPD s'applique, le dépôt des cookies analytiques non essentiels doit être fondé
                sur le consentement de l'utilisateur, sauf exemption légale applicable.
              </p>
            </Section>

            <Section title="5. Durées de conservation">
              <ul className="flex flex-col gap-1 pl-4">
                <li className="list-disc list-outside">Cookies de session : jusqu'à la fermeture du navigateur ou expiration de session.</li>
                <li className="list-disc list-outside">Cookies d'authentification persistants : durée limitée au maintien sécurisé de la connexion.</li>
                <li className="list-disc list-outside">Logs de sécurité : jusqu'à 12 mois, sauf obligation ou incident nécessitant une conservation plus longue.</li>
                <li className="list-disc list-outside">Cookies analytiques GA4 : 13 mois maximum recommandé pour les utilisateurs européens.</li>
                <li className="list-disc list-outside">Choix de consentement : durée limitée, généralement 6 à 13 mois selon la configuration retenue.</li>
              </ul>
            </Section>

            <Section title="6. Consentement et gestion des préférences">
              <p>
                Lorsqu'un consentement est requis, l'utilisateur doit pouvoir accepter, refuser ou modifier ses choix pour
                les cookies non essentiels. Le refus des cookies analytiques n'empêche pas l'accès au site, mais limite la
                mesure statistique.
              </p>
              <p>
                Vous pouvez également gérer les cookies depuis les paramètres de votre navigateur : Chrome, Firefox, Safari,
                Edge ou tout autre navigateur compatible.
              </p>
            </Section>

            <Section title="7. Vos droits">
              <p>
                Lorsque les cookies ou traceurs impliquent des données personnelles, vous disposez des droits décrits dans
                notre <Link href="/confidentialite" className="text-emerald-700 hover:underline">politique de confidentialité</Link>.
                Vous pouvez contacter SALAM Cameroun à{' '}
                <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a>.
              </p>
            </Section>

            <Section title="8. Mise à jour">
              <p>
                Cette politique peut être mise à jour en cas de changement réglementaire, technique ou d'ajout d'un nouveau
                service tiers. La version applicable est celle publiée en ligne au moment de votre consultation.
              </p>
            </Section>
          </article>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/mentions-legales" className="text-sm font-semibold text-emerald-700 hover:underline">Mentions légales</Link>
            <Link href="/confidentialite" className="text-sm font-semibold text-emerald-700 hover:underline">Confidentialité</Link>
            <Link href="/conditions" className="text-sm font-semibold text-emerald-700 hover:underline">Conditions d'utilisation</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
