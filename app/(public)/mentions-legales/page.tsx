import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: "Mentions légales de l'association SALAM Cameroun.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-lg font-black text-neutral-900">{title}</h2>
    <div className="text-sm leading-[1.9] text-neutral-600">{children}</div>
    <div className="h-px bg-neutral-100" />
  </div>
);

export default function MentionsLegalesPage() {
  return (
    <main>
      <PageHero
        badge="Informations légales"
        title="légales"
        accentWord="Mentions"
        accentPosition="start"
        subtitle="Conformément aux dispositions légales en vigueur, voici les informations légales relatives au site salam-cameroun.com."
        breadcrumbs={[{ label: 'Mentions légales' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">

            <Section title="1. Éditeur du site">
              <p><strong>Dénomination :</strong> Association SALAM Cameroun</p>
              <p><strong>Forme juridique :</strong> Association loi 1901</p>
              <p><strong>Siège social :</strong> Paris, Île-de-France, France</p>
              <p><strong>Email :</strong>{' '}<a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a></p>
              <p><strong>Site web :</strong>{' '}<a href="https://www.salam-cameroun.com" className="text-emerald-700 hover:underline">www.salam-cameroun.com</a></p>
            </Section>

            <Section title="2. Directeur de la publication">
              <p>Le directeur de la publication est le Président en exercice de l'association SALAM Cameroun.</p>
            </Section>

            <Section title="3. Hébergement">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
              <p><strong>Site :</strong>{' '}<a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">vercel.com</a></p>
            </Section>

            <Section title="4. Propriété intellectuelle">
              <p>
                L'ensemble du contenu de ce site (textes, images, logos, graphiques) est la propriété exclusive de l'association SALAM Cameroun, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation de tout ou partie du contenu sans autorisation expresse est interdite.
              </p>
            </Section>

            <Section title="5. Données personnelles">
              <p>
                Le site www.salam-cameroun.com collecte des données personnelles dans le cadre de la gestion des adhésions et des contacts. Ces données sont traitées conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
              <p className="mt-2">
                Pour exercer vos droits (accès, rectification, suppression), contactez-nous à{' '}
                <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a>.
              </p>
              <p className="mt-2">
                Pour plus d'informations, consultez notre{' '}
                <Link href="/confidentialite" className="text-emerald-700 hover:underline">politique de confidentialité</Link>.
              </p>
            </Section>

            <Section title="6. Cookies">
              <p>
                Ce site utilise des cookies pour améliorer votre expérience de navigation. Consultez notre{' '}
                <Link href="/cookies" className="text-emerald-700 hover:underline">politique de cookies</Link>{' '}pour en savoir plus.
              </p>
            </Section>

            <Section title="7. Responsabilité">
              <p>
                L'association SALAM Cameroun s'efforce de maintenir les informations du site à jour. Toutefois, elle ne saurait être tenue responsable des omissions, inexactitudes ou d'un manque de mise à jour des informations disponibles sur ce site.
              </p>
            </Section>

            <Section title="8. Droit applicable">
              <p>
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </Section>

            <p className="text-xs text-neutral-400">Dernière mise à jour : {new Date().getFullYear()}</p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/confidentialite" className="text-sm font-semibold text-emerald-700 hover:underline">Politique de confidentialité</Link>
            <Link href="/cookies" className="text-sm font-semibold text-emerald-700 hover:underline">Politique cookies</Link>
            <Link href="/conditions" className="text-sm font-semibold text-emerald-700 hover:underline">Conditions d'utilisation</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
