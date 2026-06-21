import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'Conditions du programme caurris',
  description: 'Barème, conditions de gain et règles d’utilisation des caurris SALAM.',
};

const REWARDS = [
  ['Profil membre complet', '50 caurris', 'Attribués une seule fois lorsque les informations requises sont complètes.'],
  ['Activité publiée', '40 caurris', 'Après validation et publication par une personne autorisée.'],
  ['Actualité validée', '30 caurris', 'Pour une actualité proposée par un membre puis publiée.'],
  ['Opportunité validée', '25 caurris', 'Pour une opportunité utile acceptée par le bureau.'],
  ['Galerie validée', '20 caurris', 'Pour un album conforme accepté et publié.'],
];

export default function ConditionsCaurrisPage() {
  return (
    <main>
      <PageHero
        badge="Programme de fidélité SALAM"
        title="des caurris"
        accentWord="Règles"
        accentPosition="start"
        subtitle="Le cadre de gain, de réservation et d’utilisation des caurris au sein de la communauté SALAM."
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Conditions des caurris' }]}
      />

      <section className="bg-white px-5 py-14 md:px-8">
        <div className="mx-auto grid max-w-5xl items-center gap-9 md:grid-cols-[260px_1fr]">
          <div className="flex items-center justify-center rounded-lg bg-amber-50 p-7">
            <Image src="/images/cauris/cauri.png" width={260} height={260} alt="Caurris SALAM" className="h-auto w-full max-w-[230px] object-contain" priority />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Une reconnaissance, pas une monnaie</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-neutral-950">Chaque contribution utile peut compter.</h2>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              Les caurris sont des points numériques personnels destinés à reconnaître l’engagement des membres. Ils n’ont aucune valeur monétaire, ne peuvent pas être vendus, transférés ou convertis en espèces.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 px-5 py-14 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7 flex items-center gap-3">
            <Sparkles className="text-amber-600" size={22} />
            <div><p className="text-xs font-black uppercase text-neutral-400">Barème initial</p><h2 className="text-2xl font-black text-neutral-950">Comment gagner des caurris</h2></div>
          </div>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {REWARDS.map(([action, reward, condition]) => (
              <div key={action} className="grid gap-2 border-b border-neutral-100 px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_110px_1.5fr] sm:items-center">
                <p className="text-sm font-black text-neutral-900">{action}</p>
                <p className="text-sm font-black text-amber-700">{reward}</p>
                <p className="text-xs leading-5 text-neutral-500">{condition}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-neutral-500">SALAM peut faire évoluer ce barème. Une même contribution ne peut être récompensée qu’une seule fois, même après plusieurs validations.</p>
        </div>
      </section>

      <section className="bg-white px-5 py-14 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <QrCode size={24} className="text-emerald-700" />
            <h2 className="mt-3 text-xl font-black text-neutral-950">Échanger lors d’un événement</h2>
            <div className="mt-5 space-y-4">
              {[
                'Choisissez un événement publié et le nombre de caurris à réserver.',
                'Un QR code personnel est généré pour une durée de 30 minutes.',
                'Présentez-le à un administrateur habilité avant son expiration.',
                'Une réservation expirée ou annulée restitue automatiquement les caurris.',
              ].map((text, index) => <p key={text} className="flex gap-3 text-sm leading-6 text-neutral-600"><span className="font-black text-emerald-700">{index + 1}.</span>{text}</p>)}
            </div>
          </div>
          <div>
            <ShieldCheck size={24} className="text-red-600" />
            <h2 className="mt-3 text-xl font-black text-neutral-950">Restrictions et sanctions</h2>
            <ul className="mt-5 space-y-3">
              {[
                'Les caurris sont personnels, non cessibles et liés au compte membre.',
                'Les publications trompeuses, dupliquées ou plagiées ne donnent droit à aucun gain.',
                'La manipulation d’un QR code, d’un solde ou d’une validation est interdite.',
                'Un gain obtenu à tort peut être annulé après vérification et audit.',
                'Une fraude peut entraîner le gel des caurris, la suspension du compte ou une mesure disciplinaire.',
              ].map(text => <li key={text} className="flex gap-3 text-sm leading-6 text-neutral-600"><CheckCircle2 size={16} className="mt-1 shrink-0 text-red-500" />{text}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-emerald-950 px-5 py-12 text-white md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-black">Consultez votre solde</h2><p className="mt-1 text-sm text-white/60">Votre historique et vos QR codes sont accessibles depuis votre profil membre.</p></div>
          <Link href="/member/profil" className="inline-flex h-11 items-center justify-center rounded-lg bg-amber-400 px-5 text-sm font-black text-emerald-950 transition hover:bg-amber-300">Ouvrir mon profil</Link>
        </div>
      </section>
    </main>
  );
}