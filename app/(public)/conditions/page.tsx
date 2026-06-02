import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions générales d'utilisation du site SALAM Cameroun.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-lg font-black text-neutral-900">{title}</h2>
    <div className="text-sm leading-[1.9] text-neutral-600">{children}</div>
    <div className="h-px bg-neutral-100" />
  </div>
);

export default function ConditionsPage() {
  return (
    <main>
      <PageHero
        badge="CGU"
        title="d'utilisation"
        accentWord="Conditions"
        accentPosition="start"
        subtitle="Conditions générales d'utilisation du site et des services de l'association SALAM Cameroun."
        breadcrumbs={[{ label: "Conditions d'utilisation" }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">

            <Section title="1. Acceptation des conditions">
              <p>En accédant et en utilisant le site salam-cameroun.com, vous acceptez sans réserve les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.</p>
            </Section>

            <Section title="2. Accès au site">
              <p>Le site est accessible gratuitement à tout utilisateur disposant d'un accès internet. L'association SALAM Cameroun se réserve le droit de modifier, suspendre ou interrompre l'accès au site à tout moment sans préavis.</p>
            </Section>

            <Section title="3. Compte utilisateur">
              <p>La création d'un compte est réservée aux personnes majeures (18 ans et plus) ou aux mineurs avec autorisation parentale. Vous êtes responsable de la confidentialité de vos identifiants. Toute utilisation frauduleuse devra être signalée immédiatement.</p>
            </Section>

            <Section title="4. Utilisation acceptable">
              <p>Il est interdit d'utiliser le site pour :</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                {[
                  'Diffuser des contenus illicites, offensants ou discriminatoires',
                  'Tenter d\'accéder sans autorisation aux systèmes informatiques',
                  'Perturber le fonctionnement du site ou des serveurs',
                  'Collecter des données personnelles d\'autres utilisateurs sans consentement',
                  'Toute activité commerciale non autorisée',
                ].map(i => <li key={i} className="list-disc list-outside">{i}</li>)}
              </ul>
            </Section>

            <Section title="5. Propriété intellectuelle">
              <p>Tous les contenus du site (textes, images, logos, graphiques, code) sont protégés par le droit de la propriété intellectuelle. Toute reproduction sans autorisation écrite préalable est interdite.</p>
            </Section>

            <Section title="6. Limitation de responsabilité">
              <p>L'association SALAM Cameroun ne peut être tenue responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder. Les liens vers des sites tiers sont fournis à titre informatif uniquement.</p>
            </Section>

            <Section title="7. Modification des CGU">
              <p>L'association SALAM Cameroun se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur le site. L'utilisation continue du site vaut acceptation des nouvelles conditions.</p>
            </Section>

            <Section title="8. Droit applicable et juridiction">
              <p>Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux de Paris seront seuls compétents.</p>
            </Section>

            <Section title="9. Contact">
              <p>
                Pour toute question relative aux présentes CGU, contactez-nous à{' '}
                <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a>.
              </p>
            </Section>

            <p className="text-xs text-neutral-400">Dernière mise à jour : {new Date().getFullYear()}</p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/mentions-legales" className="text-sm font-semibold text-emerald-700 hover:underline">Mentions légales</Link>
            <Link href="/confidentialite" className="text-sm font-semibold text-emerald-700 hover:underline">Confidentialité</Link>
            <Link href="/cookies" className="text-sm font-semibold text-emerald-700 hover:underline">Cookies</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
