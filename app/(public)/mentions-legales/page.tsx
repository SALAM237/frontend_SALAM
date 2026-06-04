import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: "Mentions légales du site officiel de l'association SALAM Cameroun.",
};

const UPDATED_AT = '4 juin 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-black text-neutral-900">{title}</h2>
      <div className="space-y-3 text-sm leading-[1.9] text-neutral-600">{children}</div>
      <div className="h-px bg-neutral-100" />
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-neutral-100 py-2 last:border-0 sm:grid-cols-[190px_1fr]">
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">{label}</dt>
      <dd className="text-sm font-semibold text-neutral-700">{value}</dd>
    </div>
  );
}

export default function MentionsLegalesPage() {
  return (
    <main>
      <PageHero
        badge="Informations légales"
        title="légales"
        accentWord="Mentions"
        accentPosition="start"
        subtitle="Informations relatives à l'éditeur, à l'hébergement, à la propriété intellectuelle et au cadre juridique du site salam-cameroun.com."
        breadcrumbs={[{ label: 'Mentions légales' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <article className="flex flex-col gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
              Dernière mise à jour : {UPDATED_AT}
            </p>

            <Section title="1. Éditeur du site">
              <p>
                Le site <strong>salam-cameroun.com</strong> est édité par l'association SALAM Cameroun, association
                à but non lucratif œuvrant pour l'entraide, l'accompagnement des étudiants, la solidarité et le réseau
                des lauréats camerounais du Maroc.
              </p>
              <dl className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <Row label="Nom" value="Association SALAM Cameroun" />
                <Row label="Nom complet" value="Solidaire Associative des Lauréats du Maroc" />
                <Row label="Nature" value="Association à but non lucratif" />
                <Row label="Siège" value="Yaoundé - Cameroun" />
                <Row label="Email" value={<a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a>} />
                <Row label="Site web" value={<a href="https://salam-cameroun.com" className="text-emerald-700 hover:underline">https://salam-cameroun.com</a>} />
              </dl>
              <p>
                Les informations administratives complémentaires de l'association, notamment numéro de déclaration,
                récépissé ou représentant légal nominatif, devront être ajoutées sur cette page dès qu'elles sont
                disponibles ou mises à jour par le bureau exécutif.
              </p>
            </Section>

            <Section title="2. Directeur de la publication">
              <p>
                Le directeur ou la directrice de la publication est la personne assurant la présidence en exercice de
                l'association SALAM Cameroun, ou toute personne dûment mandatée par le bureau exécutif.
              </p>
            </Section>

            <Section title="3. Hébergement">
              <p>Le site est hébergé par :</p>
              <dl className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <Row label="Hébergeur" value="Vercel Inc." />
                <Row label="Adresse" value="340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis" />
                <Row label="Site web" value={<a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">vercel.com</a>} />
              </dl>
              <p>
                Certaines données techniques peuvent être traitées hors du Cameroun et hors de l'Union européenne par
                les prestataires d'infrastructure. Ces traitements sont encadrés contractuellement et limités aux besoins
                d'hébergement, de sécurité, de disponibilité et de maintenance du site.
              </p>
            </Section>

            <Section title="4. Conception et maintenance">
              <p>
                La conception, le développement et la maintenance technique du site sont assurés par{' '}
                <a href="https://www.belvedere-digital.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 hover:underline">
                  Belvedere Digital
                </a>
                , prestataire technique indépendant. Belvedere Digital n'est pas l'éditeur du site et n'agit que dans
                le cadre des missions techniques qui lui sont confiées par SALAM Cameroun.
              </p>
            </Section>

            <Section title="5. Propriété intellectuelle">
              <p>
                L'ensemble des éléments présents sur ce site, notamment les textes, logos, marques, visuels, photographies,
                vidéos, interfaces, bases de données, documents téléchargeables et développements spécifiques, est protégé
                par les règles applicables en matière de propriété intellectuelle.
              </p>
              <p>
                Sauf mention contraire, ces éléments appartiennent à SALAM Cameroun ou sont utilisés avec autorisation.
                Toute reproduction, représentation, adaptation, modification, extraction ou réutilisation non autorisée,
                totale ou partielle, est interdite.
              </p>
              <p>
                Les utilisateurs qui soumettent des contenus à l'association garantissent disposer des droits nécessaires
                et autorisent SALAM Cameroun à les publier sur le site, dans le respect de la finalité associative et des
                droits de retrait prévus par la loi.
              </p>
            </Section>

            <Section title="6. Données personnelles">
              <p>
                SALAM Cameroun traite des données personnelles pour gérer les adhésions, l'espace membre, les demandes
                de contact, les opportunités, les activités, les communications associatives et la sécurité du service.
              </p>
              <p>
                Ces traitements sont réalisés conformément aux principes de licéité, loyauté, transparence, minimisation,
                sécurité et limitation de conservation. Lorsque des utilisateurs situés dans l'Union européenne sont
                concernés, SALAM Cameroun applique également le Règlement (UE) 2016/679, dit RGPD.
              </p>
              <p>
                Pour plus d'informations, consultez la{' '}
                <Link href="/confidentialite" className="text-emerald-700 hover:underline">politique de confidentialité</Link>.
              </p>
            </Section>

            <Section title="7. Cookies et mesure d'audience">
              <p>
                Le site peut utiliser des cookies nécessaires au fonctionnement, des traceurs de sécurité, ainsi que
                Google Analytics 4 pour la mesure d'audience lorsque cette mesure est activée. Les cookies non essentiels
                doivent faire l'objet d'une information claire et d'un consentement lorsque la réglementation l'exige.
              </p>
              <p>
                Pour connaître les catégories de cookies, leurs finalités et vos choix, consultez la{' '}
                <Link href="/cookies" className="text-emerald-700 hover:underline">politique de cookies</Link>.
              </p>
            </Section>

            <Section title="8. Liens hypertextes">
              <p>
                Le site peut contenir des liens vers des sites tiers. SALAM Cameroun n'exerce aucun contrôle sur ces sites
                et ne peut être tenue responsable de leur contenu, disponibilité, sécurité ou politique de confidentialité.
              </p>
              <p>
                La création d'un lien vers salam-cameroun.com est autorisée lorsqu'elle ne porte pas atteinte à l'image,
                aux intérêts ou à la mission de l'association. SALAM Cameroun se réserve le droit de demander la suppression
                de tout lien qu'elle estime préjudiciable.
              </p>
            </Section>

            <Section title="9. Responsabilité">
              <p>
                SALAM Cameroun s'efforce de publier des informations exactes et à jour. Toutefois, les informations
                diffusées sur le site sont fournies à titre informatif et associatif. Elles ne constituent pas un conseil
                juridique, financier, médical, professionnel ou administratif personnalisé.
              </p>
              <p>
                SALAM Cameroun ne saurait être tenue responsable des erreurs, interruptions, indisponibilités temporaires,
                pertes de données, atteintes causées par un tiers ou dommages indirects liés à l'utilisation du site,
                dans les limites autorisées par la loi applicable.
              </p>
            </Section>

            <Section title="10. Droit applicable">
              <p>
                Les présentes mentions légales sont principalement régies par le droit camerounais. Lorsque des utilisateurs,
                prestataires ou traitements relèvent de l'Union européenne ou de la France, les règles européennes et
                françaises applicables, notamment le RGPD, la directive ePrivacy, la loi Informatique et Libertés et la
                LCEN, peuvent également s'appliquer.
              </p>
              <p>
                En cas de litige, les parties rechercheront d'abord une solution amiable. À défaut, les juridictions
                compétentes seront déterminées selon les règles de compétence applicables, notamment au Cameroun.
              </p>
            </Section>
          </article>

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
