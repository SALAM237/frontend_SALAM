import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'Politique cookies',
  description: "Politique d'utilisation des cookies — SALAM Cameroun.",
};

const COOKIES = [
  { type: 'Essentiels', desc: 'Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.', exemples: ['Session utilisateur', 'Authentification', 'Sécurité CSRF'], obligatoire: true },
  { type: 'Analytiques', desc: 'Nous aident à comprendre comment les visiteurs utilisent le site.', exemples: ['Pages visitées', 'Durée de session', 'Source de trafic'], obligatoire: false },
  { type: 'Fonctionnels', desc: 'Améliorent votre expérience en mémorisant vos préférences.', exemples: ['Langue préférée', 'Préférences d\'affichage'], obligatoire: false },
];

export default function CookiesPage() {
  return (
    <main>
      <PageHero
        badge="Cookies & Traceurs"
        title="des cookies"
        accentWord="Politique"
        accentPosition="start"
        subtitle="Informations sur l'utilisation des cookies sur le site www.salam-cameroun.com."
        breadcrumbs={[{ label: 'Cookies' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">

            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-neutral-900">Qu'est-ce qu'un cookie ?</h2>
              <p className="text-sm leading-[1.9] text-neutral-600">
                Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site web. Il permet au site de mémoriser des informations sur votre visite pour améliorer votre expérience.
              </p>
              <div className="h-px bg-neutral-100" />
            </div>

            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-black text-neutral-900">Types de cookies utilisés</h2>
              <div className="flex flex-col gap-4">
                {COOKIES.map(({ type, desc, exemples, obligatoire }) => (
                  <div key={type} className="rounded-[1.2rem] border border-neutral-100 bg-neutral-50 p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="font-black text-neutral-900">{type}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${obligatoire ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-600'}`}>
                        {obligatoire ? 'Obligatoire' : 'Optionnel'}
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-neutral-500">{desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {exemples.map(e => (
                        <span key={e} className="rounded-md bg-white border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500">{e}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-px bg-neutral-100" />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-neutral-900">Durée de conservation</h2>
              <p className="text-sm leading-[1.9] text-neutral-600">
                Les cookies de session expirent à la fermeture du navigateur. Les cookies persistants ont une durée maximale de 13 mois conformément aux recommandations de la CNIL.
              </p>
              <div className="h-px bg-neutral-100" />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-neutral-900">Gérer vos préférences</h2>
              <p className="text-sm leading-[1.9] text-neutral-600">
                Vous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres de votre navigateur ou en nous contactant à{' '}
                <a href="mailto:contact@salam-cameroun.com" className="text-emerald-700 hover:underline">contact@salam-cameroun.com</a>.
              </p>
              <p className="text-sm text-neutral-600">
                La désactivation de certains cookies peut affecter le fonctionnement du site.
              </p>
              <div className="h-px bg-neutral-100" />
            </div>

            <p className="text-xs text-neutral-400">Dernière mise à jour : {new Date().getFullYear()}</p>
          </div>

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
