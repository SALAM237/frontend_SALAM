import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, Palette, Dumbbell, Megaphone, Laptop, Users, BookOpen, Heart } from 'lucide-react';

export const revalidate = 86400;
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'Commissions SALAM',
  description: "Les commissions thématiques de l'association SALAM Cameroun.",
};

const COMMISSIONS = [
  { icon: Megaphone, title: 'Commission Communication', desc: 'Gestion des réseaux sociaux, communication externe et image de l\'association.', color: 'bg-pink-100 text-pink-700', border: 'border-pink-200' },
  { icon: Laptop, title: 'Commission IT', desc: 'Développement numérique, outils digitaux et transformation numérique de SALAM.', color: 'bg-cyan-100 text-cyan-700', border: 'border-cyan-200' },
  { icon: Palette, title: 'Commission Culturelle', desc: 'Organisation des événements culturels, valorisation des cultures camerounaise et marocaine.', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
  { icon: Dumbbell, title: 'Commission Sport', desc: 'Tournois, activités sportives et promotion du sport comme vecteur de cohésion sociale.', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  { icon: Briefcase, title: 'Commission Emploi', desc: 'Réseau emploi, accompagnement professionnel et opportunités pour les membres.', color: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
  { icon: BookOpen, title: 'Commission Orientation', desc: 'Accompagnement des bacheliers, ateliers d\'orientation et préparation aux études supérieures.', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
  { icon: Users, title: 'Commission Insertion', desc: 'Réseau professionnel, forums emploi, accompagnement carrière et entrepreneuriat.', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
  { icon: Heart, title: 'Commission Solidarité', desc: 'Actions humanitaires, soutien aux personnes vulnérables et collectes de fonds.', color: 'bg-red-100 text-red-700', border: 'border-red-200' },
];

export default function CommissionsPage() {
  return (
    <main>
      <PageHero
        badge="Groupes de travail"
        title="thématiques"
        accentWord="Commissions"
        accentPosition="start"
        subtitle="Les commissions SALAM sont des groupes de travail thématiques qui portent et animent les actions de l'association."
        breadcrumbs={[{ label: 'Commissions' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Nos <span className="text-emerald-700">commissions actives</span>
            </h2>
            <p className="mt-3 max-w-xl text-[clamp(0.9rem,1.2vw,1rem)] leading-[1.85] text-neutral-600">
              Chaque commission est animée par un responsable de commission et des membres bénévoles engagés. Rejoignez celle qui correspond à vos passions et compétences.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMMISSIONS.map(({ icon: Icon, title, desc, color, border }) => (
              <div key={title} className={`group flex flex-col gap-4 rounded-[1.5rem] border ${border} bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-black text-neutral-900">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-xs text-neutral-400">
                  <Users size={11} />
                  <span>Responsable à annoncer</span>
                </div>
              </div>
            ))}

            {/* Rejoindre */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-emerald-300 bg-white p-5 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <Users size={20} className="text-emerald-700" />
              </div>
              <div>
                <h3 className="font-black text-neutral-900">Rejoindre une commission</h3>
                <p className="mt-1 text-xs text-neutral-500">Impliquez-vous dans les activités de SALAM.</p>
              </div>
              <Link href="/adhesion" className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 transition-all">
                Devenir membre
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#07140d] via-[#0b1f15] to-[#061009] px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-xl font-black text-white">Proposer une nouvelle commission</h3>
          <p className="mt-2 text-sm text-white/50">
            Vous avez une idée de groupe de travail qui manque à SALAM ?? Partagez-la avec nous.
          </p>
          <Link href="/contact" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-black text-white hover:bg-emerald-400 transition-all">
            Nous contacter →
          </Link>
        </div>
      </section>
    </main>
  );
}
