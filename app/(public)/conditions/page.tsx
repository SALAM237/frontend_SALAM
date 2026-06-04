import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions générales d'utilisation du site et des services numériques SALAM Cameroun.",
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1 pl-4">
      {items.map(item => <li key={item} className="list-disc list-outside">{item}</li>)}
    </ul>
  );
}

export default function ConditionsPage() {
  return (
    <main>
      <PageHero
        badge="CGU"
        title="d'utilisation"
        accentWord="Conditions"
        accentPosition="start"
        subtitle="Conditions applicables à l'utilisation du site, de l'espace membre et des services numériques de SALAM Cameroun."
        breadcrumbs={[{ label: "Conditions d'utilisation" }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <article className="flex flex-col gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
              Dernière mise à jour : {UPDATED_AT}
            </p>

            <Section title="1. Objet">
              <p>
                Les présentes conditions d'utilisation définissent les règles d'accès et d'utilisation du site
                salam-cameroun.com, de l'espace membre, des pages publiques, des formulaires, des opportunités, des
                activités, des actualités et des services numériques proposés par SALAM Cameroun.
              </p>
            </Section>

            <Section title="2. Acceptation">
              <p>
                L'accès au site implique l'acceptation des présentes conditions. Si vous n'acceptez pas ces conditions,
                vous devez cesser d'utiliser le site et ses services. L'utilisation continue du site après modification
                des conditions vaut acceptation de la version mise à jour.
              </p>
            </Section>

            <Section title="3. Services proposés">
              <p>Le site permet notamment :</p>
              <BulletList items={[
                "la consultation des informations institutionnelles de SALAM Cameroun;",
                "la consultation des missions, actualités, activités, opportunités et pages publiques;",
                "la soumission d'une demande d'adhésion;",
                "l'accès à un espace membre authentifié;",
                "la consultation de documents, cotisations, factures ou informations associatives;",
                "la soumission d'actualités, activités, opportunités ou contenus soumis à validation;",
                "la prise de contact avec l'association ou le bureau exécutif;",
                "l'accès à une démonstration fonctionnelle sans données réelles.",
              ]} />
            </Section>

            <Section title="4. Compte utilisateur et sécurité">
              <p>
                Certaines fonctionnalités sont réservées aux membres, administrateurs ou membres du bureau. L'utilisateur
                s'engage à fournir des informations exactes, à maintenir la confidentialité de ses identifiants et à
                signaler immédiatement toute utilisation non autorisée de son compte.
              </p>
              <p>
                SALAM Cameroun peut suspendre ou limiter un accès en cas de suspicion de fraude, d'usurpation, d'abus,
                de comportement contraire aux présentes conditions ou de risque pour la sécurité du site.
              </p>
            </Section>

            <Section title="5. Contributions et publications">
              <p>
                Les contenus soumis par les membres, notamment actualités, activités, opportunités, images ou messages,
                peuvent être soumis à validation par le bureau ou l'administration avant publication.
              </p>
              <p>L'utilisateur garantit que les contenus qu'il soumet :</p>
              <BulletList items={[
                "sont exacts, loyaux et non trompeurs;",
                "ne portent pas atteinte aux droits de tiers;",
                "ne contiennent pas de propos diffamatoires, discriminatoires, haineux ou illicites;",
                "ne contiennent pas de données personnelles de tiers sans autorisation;",
                "respectent l'objet associatif et l'image de SALAM Cameroun.",
              ]} />
              <p>
                SALAM Cameroun se réserve le droit de refuser, modifier, dépublier ou supprimer tout contenu contraire
                aux présentes conditions, à la loi ou aux valeurs de l'association.
              </p>
            </Section>

            <Section title="6. Opportunités et mises en relation">
              <p>
                Les opportunités publiées sur le site sont fournies à titre informatif par SALAM Cameroun, ses membres,
                partenaires ou contributeurs. SALAM Cameroun ne garantit pas l'embauche, l'obtention d'un stage, la
                conclusion d'un partenariat ou la qualité finale d'une relation entre utilisateurs.
              </p>
              <p>
                Chaque utilisateur reste responsable des informations qu'il transmet dans le cadre d'une réponse à une
                opportunité. Les échanges ultérieurs entre annonceur et répondant relèvent de leur responsabilité propre.
              </p>
            </Section>

            <Section title="7. Dons, cotisations et paiements">
              <p>
                Les dons, cotisations, paiements ou intentions de paiement affichés sur le site doivent correspondre aux
                moyens officiellement validés par SALAM Cameroun. Toute information bancaire ou de paiement doit être
                vérifiée auprès de l'association en cas de doute.
              </p>
              <p>
                Les reçus, factures ou documents financiers générés par l'espace membre ou admin ont une valeur informative
                et probatoire dans les limites des règles internes de l'association et du droit applicable.
              </p>
            </Section>

            <Section title="8. Comportements interdits">
              <p>Il est strictement interdit de :</p>
              <BulletList items={[
                "utiliser le site à des fins frauduleuses, illégales ou contraires à l'objet associatif;",
                "tenter d'accéder sans autorisation aux espaces admin, membre, API ou données privées;",
                "perturber le fonctionnement du site, des serveurs ou des services tiers;",
                "collecter ou réutiliser les données personnelles d'autres utilisateurs sans base légale;",
                "publier des contenus diffamatoires, discriminatoires, haineux, violents, obscènes ou trompeurs;",
                "usurper l'identité d'un membre, d'un responsable ou de SALAM Cameroun;",
                "utiliser les opportunités ou contacts à des fins de spam, prospection abusive ou escroquerie.",
              ]} />
            </Section>

            <Section title="9. Propriété intellectuelle">
              <p>
                Les contenus du site, son identité visuelle, ses textes, images, logos, interfaces, bases de données,
                documents, codes et fonctionnalités sont protégés. Toute reproduction ou réutilisation non autorisée est
                interdite, sauf usage personnel, citation courte ou autorisation préalable de SALAM Cameroun.
              </p>
            </Section>

            <Section title="10. Disponibilité et maintenance">
              <p>
                SALAM Cameroun s'efforce d'assurer l'accès au site, mais ne garantit pas une disponibilité permanente.
                Le site peut être suspendu pour maintenance, sécurité, évolution technique, incident ou cas de force majeure.
              </p>
            </Section>

            <Section title="11. Limitation de responsabilité">
              <p>
                SALAM Cameroun ne peut être tenue responsable des dommages indirects, pertes de chance, pertes de données,
                erreurs d'informations fournies par des tiers, indisponibilités de services externes ou usages non conformes
                du site par les utilisateurs.
              </p>
              <p>
                Les informations publiées sur le site sont fournies à titre associatif et informatif. Elles ne remplacent
                pas les conseils d'un professionnel qualifié lorsque la situation l'exige.
              </p>
            </Section>

            <Section title="12. Données personnelles">
              <p>
                Les données personnelles sont traitées conformément à la{' '}
                <Link href="/confidentialite" className="text-emerald-700 hover:underline">politique de confidentialité</Link>
                {' '}et à la <Link href="/cookies" className="text-emerald-700 hover:underline">politique de cookies</Link>.
              </p>
            </Section>

            <Section title="13. Droit applicable et litiges">
              <p>
                Les présentes conditions sont principalement régies par le droit camerounais. Lorsque la situation implique
                des utilisateurs, prestataires ou traitements situés dans l'Union européenne ou en France, les règles
                européennes et françaises applicables peuvent également s'appliquer.
              </p>
              <p>
                En cas de litige, les parties privilégient une résolution amiable. À défaut, la juridiction compétente
                sera déterminée selon les règles de compétence applicables, notamment au Cameroun.
              </p>
            </Section>

            <Section title="14. Contact">
              <p>
                Pour toute question relative aux présentes conditions, contactez SALAM Cameroun à{' '}
                <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a>.
              </p>
            </Section>
          </article>

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
