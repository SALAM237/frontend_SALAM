import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: "Politique de confidentialité et protection des données personnelles de SALAM Cameroun.",
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

function Table({ rows }: { rows: Array<[string, string, string]> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100">
      <div className="grid grid-cols-3 bg-neutral-900 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white">
        <span>Finalité</span>
        <span>Base légale</span>
        <span>Conservation</span>
      </div>
      {rows.map(([purpose, basis, duration]) => (
        <div key={purpose} className="grid grid-cols-1 gap-2 border-t border-neutral-100 px-4 py-3 text-sm sm:grid-cols-3">
          <span className="font-bold text-neutral-800">{purpose}</span>
          <span>{basis}</span>
          <span>{duration}</span>
        </div>
      ))}
    </div>
  );
}

export default function ConfidentialitePage() {
  return (
    <main>
      <PageHero
        badge="Données personnelles"
        title="de confidentialité"
        accentWord="Politique"
        accentPosition="start"
        subtitle="Cette politique explique comment SALAM Cameroun collecte, utilise, conserve et protège les données personnelles des visiteurs, membres et contributeurs."
        breadcrumbs={[{ label: 'Confidentialité' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <article className="flex flex-col gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
              Dernière mise à jour : {UPDATED_AT}
            </p>

            <Section title="1. Introduction">
              <p>
                La présente politique de confidentialité s'applique au site salam-cameroun.com, à l'espace membre, aux
                formulaires de contact, aux formulaires d'adhésion, aux opportunités, aux activités, aux actualités et
                aux services numériques proposés par SALAM Cameroun.
              </p>
              <p>
                SALAM Cameroun s'engage à traiter les données personnelles de manière loyale, transparente, proportionnée
                et sécurisée, conformément au droit camerounais applicable, notamment la loi n°2010/012 du 21 décembre
                2010 relative à la cybersécurité et à la cybercriminalité au Cameroun, ainsi qu'au RGPD lorsque des
                personnes situées dans l'Union européenne sont concernées.
              </p>
            </Section>

            <Section title="2. Responsable du traitement">
              <p>Le responsable du traitement est :</p>
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                <p><strong>Association :</strong> SALAM Cameroun</p>
                <p><strong>Siège :</strong> Yaoundé - Cameroun</p>
                <p><strong>Email :</strong> <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a></p>
                <p><strong>Site :</strong> <a href="https://salam-cameroun.com" className="text-emerald-700 hover:underline">https://salam-cameroun.com</a></p>
              </div>
              <p>
                Toute demande relative aux données personnelles peut être adressée à l'email ci-dessus.
              </p>
            </Section>

            <Section title="3. Données collectées">
              <p>Selon votre utilisation du site, SALAM Cameroun peut collecter les catégories de données suivantes :</p>
              <BulletList items={[
                'Données d’identité : prénom, nom, civilité, promotion, rôle associatif.',
                'Coordonnées : adresse email, téléphone, ville, pays, antenne.',
                'Données d’adhésion : statut membre, cotisations, justificatifs éventuels, historique associatif.',
                'Données de compte : identifiants, mot de passe chiffré, rôle, permissions, session.',
                'Données de contenu : actualités, activités, opportunités, messages, pièces ou images soumises.',
                'Données de contact : objet de la demande, contenu du message, date d’envoi.',
                'Données techniques : adresse IP, logs de connexion, navigateur, appareil, horodatages, erreurs applicatives.',
                'Données de mesure d’audience : pages vues, clics, événements GA4, source de trafic, interactions avec les CTA.',
              ]} />
            </Section>

            <Section title="4. Finalités et bases légales">
              <Table rows={[
                ['Gestion des adhésions', 'Exécution de mesures associatives / intérêt légitime', 'Durée de l’adhésion + 3 ans'],
                ['Espace membre et authentification', 'Exécution du service / sécurité', 'Durée du compte + logs 12 mois'],
                ['Activités, actualités et opportunités', 'Intérêt légitime associatif / consentement du contributeur', 'Durée de publication puis archivage'],
                ['Formulaires de contact', 'Intérêt légitime à répondre aux demandes', '3 ans après le dernier échange'],
                ['Cotisations, reçus et factures', 'Obligations comptables et probatoires', 'Durée légale applicable, jusqu’à 10 ans'],
                ['Sécurité et lutte contre la fraude', 'Intérêt légitime / obligation légale', '12 mois pour les logs de sécurité'],
                ['Mesure d’audience GA4', 'Consentement lorsque requis', '13 mois maximum recommandé'],
                ['Assistant IA et support admin', 'Intérêt légitime à assister l’administration', 'Durée limitée aux besoins de support et audit'],
              ]} />
            </Section>

            <Section title="5. Services tiers et destinataires">
              <p>
                Les données sont accessibles uniquement aux personnes habilitées de SALAM Cameroun et aux prestataires
                agissant pour le compte de l'association, dans la limite de leurs missions.
              </p>
              <BulletList items={[
                'Vercel : hébergement du frontend et infrastructure web.',
                'Prestataire backend et base de données : hébergement technique des API et données applicatives.',
                'Google Analytics 4 : mesure d’audience et événements statistiques.',
                'Prestataire email : envoi d’emails transactionnels et notifications.',
                'Belvedere Digital : maintenance, développement, support technique et sécurité applicative.',
                'Autorités administratives ou judiciaires : uniquement en cas d’obligation légale ou réquisition régulière.',
              ]} />
              <p>SALAM Cameroun ne vend pas les données personnelles des utilisateurs.</p>
            </Section>

            <Section title="6. Transferts hors Cameroun et hors Union européenne">
              <p>
                Certains prestataires techniques, notamment Vercel, Google ou les services d'email, peuvent impliquer
                des traitements ou transferts de données hors du Cameroun et hors de l'Union européenne.
              </p>
              <p>
                Lorsque le RGPD est applicable, ces transferts doivent être encadrés par des garanties appropriées :
                clauses contractuelles types, mesures de sécurité, limitation des finalités, minimisation des données et
                sélection de prestataires présentant un niveau de protection suffisant.
              </p>
            </Section>

            <Section title="7. Sécurité">
              <p>SALAM Cameroun met en œuvre des mesures de sécurité adaptées à la nature des données traitées :</p>
              <BulletList items={[
                'chiffrement HTTPS/TLS des échanges;',
                'hachage des mots de passe;',
                'sessions et tokens sécurisés;',
                'contrôle des rôles et permissions;',
                'journalisation des accès sensibles;',
                'limitation des droits selon le principe du moindre privilège;',
                'surveillance des erreurs et tentatives d’accès anormales;',
                'protection des espaces admin, membre et API par authentification.',
              ]} />
              <p>
                Aucun système informatique ne peut garantir une sécurité absolue. En cas d'incident présentant un risque
                pour les personnes concernées, SALAM Cameroun prendra les mesures nécessaires conformément au cadre légal
                applicable.
              </p>
            </Section>

            <Section title="8. Vos droits">
              <p>
                Vous pouvez demander l'accès, la rectification, la suppression, la limitation ou l'opposition au traitement
                de vos données. Lorsque le RGPD s'applique, vous disposez également du droit à la portabilité et du droit
                de retirer votre consentement à tout moment pour les traitements fondés sur celui-ci.
              </p>
              <p>
                Pour exercer vos droits, contactez SALAM Cameroun à{' '}
                <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a>.
                Une preuve d'identité pourra être demandée en cas de doute raisonnable afin d'éviter toute divulgation non autorisée.
              </p>
            </Section>

            <Section title="9. Réclamation">
              <p>
                Si vous êtes situé dans l'Union européenne et estimez que vos droits ne sont pas respectés, vous pouvez
                introduire une réclamation auprès de l'autorité de contrôle compétente, notamment la CNIL en France :
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="ml-1 text-emerald-700 hover:underline">www.cnil.fr</a>.
              </p>
              <p>
                Pour les traitements relevant du Cameroun, les demandes doivent d'abord être adressées à SALAM Cameroun,
                qui recherchera une solution amiable et conforme au droit applicable.
              </p>
            </Section>

            <Section title="10. Mise à jour">
              <p>
                La présente politique peut être modifiée pour tenir compte des évolutions légales, techniques ou
                fonctionnelles du site. La version applicable est celle publiée en ligne à la date de consultation.
              </p>
            </Section>
          </article>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/mentions-legales" className="text-sm font-semibold text-emerald-700 hover:underline">Mentions légales</Link>
            <Link href="/cookies" className="text-sm font-semibold text-emerald-700 hover:underline">Politique cookies</Link>
            <Link href="/conditions" className="text-sm font-semibold text-emerald-700 hover:underline">Conditions d'utilisation</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
