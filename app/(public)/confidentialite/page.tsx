import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: "Politique de confidentialité de l'association SALAM Cameroun — RGPD.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-lg font-black text-neutral-900">{title}</h2>
    <div className="text-sm leading-[1.9] text-neutral-600">{children}</div>
    <div className="h-px bg-neutral-100" />
  </div>
);

export default function ConfidentialitePage() {
  return (
    <main>
      <PageHero
        badge="RGPD & Vie privée"
        title="de confidentialité"
        accentWord="Politique"
        accentPosition="start"
        subtitle="L'association SALAM Cameroun s'engage à protéger vos données personnelles conformément au RGPD."
        breadcrumbs={[{ label: 'Confidentialité' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">

            <Section title="1. Responsable du traitement">
              <p>Association SALAM Cameroun — <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a></p>
            </Section>

            <Section title="2. Données collectées">
              <p>Nous collectons les données suivantes :</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                {['Données d\'identité : prénom, nom', 'Coordonnées : email, téléphone', 'Données de localisation : ville', 'Données de connexion : logs de sécurité', 'Données de paiement : gérées par notre prestataire sécurisé'].map(d => (
                  <li key={d} className="list-disc list-outside">{d}</li>
                ))}
              </ul>
            </Section>

            <Section title="3. Finalités du traitement">
              <ul className="flex flex-col gap-1 pl-4">
                {['Gestion des adhésions et des comptes membres', 'Communication sur les activités et événements SALAM', 'Traitement des demandes de contact', 'Sécurité et prévention des fraudes', 'Conformité légale et comptable'].map(f => (
                  <li key={f} className="list-disc list-outside">{f}</li>
                ))}
              </ul>
            </Section>

            <Section title="4. Base légale du traitement">
              <p>Nos traitements reposent sur : le contrat (exécution de l'adhésion), le consentement (communications marketing), l'obligation légale et notre intérêt légitime (sécurité du site).</p>
            </Section>

            <Section title="5. Durée de conservation">
              <p>Vos données sont conservées :</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                <li className="list-disc list-outside">Données membres actifs : pendant la durée de l'adhésion + 3 ans</li>
                <li className="list-disc list-outside">Données de contact : 3 ans après le dernier échange</li>
                <li className="list-disc list-outside">Logs de sécurité : 12 mois</li>
              </ul>
            </Section>

            <Section title="6. Vos droits">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                {['Droit d\'accès à vos données', 'Droit de rectification', 'Droit à l\'effacement', 'Droit à la portabilité', 'Droit d\'opposition', 'Droit à la limitation du traitement'].map(d => (
                  <li key={d} className="list-disc list-outside">{d}</li>
                ))}
              </ul>
              <p className="mt-2">Pour exercer ces droits, contactez-nous à <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a>.</p>
            </Section>

            <Section title="7. Partage des données">
              <p>Vos données ne sont pas vendues. Elles peuvent être partagées avec nos prestataires techniques (hébergement, paiement) dans le strict cadre de leurs missions, sous accord de confidentialité.</p>
            </Section>

            <Section title="8. Sécurité">
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement, accès restreint, authentification sécurisée (2FA disponible).</p>
            </Section>

            <Section title="9. Réclamation">
              <p>
                En cas de réclamation, vous pouvez saisir la CNIL :{' '}
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">www.cnil.fr</a>
              </p>
            </Section>

            <p className="text-xs text-neutral-400">Dernière mise à jour : {new Date().getFullYear()}</p>
          </div>

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
