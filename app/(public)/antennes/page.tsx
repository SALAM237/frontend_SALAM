import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Users, Phone } from 'lucide-react';

export const revalidate = 86400;
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'Antennes SALAM',
  description: "Les antennes locales de l'association SALAM Cameroun au Cameroun et au Maroc.",
};

const ANTENNES_PREVUES = [
  { ville: 'Yaoundé', region: 'Cameroun', statut: 'Siège social', color: 'border-emerald-500 bg-emerald-50', badge: 'bg-emerald-600 text-white' },
  { ville: 'Casablanca', region: 'Maroc', statut: 'Antenne principale', color: 'border-red-400 bg-red-50', badge: 'bg-red-500 text-white' },
  { ville: 'Rabat', region: 'Maroc', statut: 'Antenne', color: 'border-neutral-300 bg-neutral-50', badge: 'bg-neutral-600 text-white' },
  { ville: 'Lyon', region: 'Auvergne-Rhône-Alpes', statut: 'Antenne', color: 'border-neutral-300 bg-neutral-50', badge: 'bg-neutral-600 text-white' },
  { ville: 'Bordeaux', region: 'Nouvelle-Aquitaine', statut: 'Antenne', color: 'border-neutral-300 bg-neutral-50', badge: 'bg-neutral-600 text-white' },
];

export default function AntennesPage() {
  return (
    <main>
      <PageHero
        badge="Présence locale"
        title="locales SALAM"
        accentWord="Antennes"
        accentPosition="start"
        subtitle="SALAM est présente dans plusieurs villes au Cameroun et au Maroc pour accompagner les étudiants camerounais au plus près."
        breadcrumbs={[{ label: 'Antennes' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Notre <span className="text-emerald-700">réseau d'antennes</span>
            </h2>
            <p className="mt-3 max-w-xl text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.85] text-neutral-600">
              Chaque antenne SALAM est dirigée par un responsable local qui coordonne les activités et accompagne les membres dans sa région.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ANTENNES_PREVUES.map(({ ville, region, statut, color, badge }) => (
              <div key={ville} className={`flex flex-col gap-4 rounded-[1.5rem] border-2 ${color} p-6 transition-all hover:-translate-y-1 hover:shadow-md`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                    <MapPin size={20} className="text-emerald-700" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${badge}`}>{statut}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">{ville}</h3>
                  <p className="text-sm text-neutral-500">{region}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-xs text-neutral-400">
                  <Users size={12} />
                  <span>Responsable à annoncer</span>
                </div>
              </div>
            ))}

            {/* Créer une antenne */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-emerald-300 bg-white p-6 text-center transition-all hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <MapPin size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-neutral-900">Votre ville ?</h3>
                <p className="mt-1 text-xs text-neutral-500">Vous souhaitez ouvrir une antenne SALAM dans votre ville ?</p>
              </div>
              <Link href="/contact" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 transition-all">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-emerald-900 to-emerald-700 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black">Devenez responsable d'antenne</h3>
              <p className="mt-2 max-w-md text-sm text-white/65">
                Engagez-vous pour SALAM dans votre ville. Organisez des événements, accompagnez les membres locaux et représentez l'association.
              </p>
            </div>
            <Link href="/contact" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-emerald-800 hover:bg-emerald-50 transition-all">
              Candidater →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
