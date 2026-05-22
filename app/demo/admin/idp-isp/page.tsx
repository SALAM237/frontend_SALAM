import { Building2, HandHeart, Target } from 'lucide-react';
import { DemoPortalShell } from '../../_components/DemoShell';

export default function DemoIdpIspPage() {
  const profiles = [
    { title: 'Ideal Donor Profile', subtitle: 'Donateur diaspora engage', icon: HandHeart, score: '80+', bullets: ['Interet orientation et solidarite', 'Coordonnees completes', 'Souhaite soutenir une action precise'] },
    { title: 'Ideal Sponsor Profile', subtitle: 'Entreprise ou institution partenaire', icon: Building2, score: '75+', bullets: ['Besoin RSE ou recrutement', 'Capacite sponsoring evenement', 'Interet Cameroun-Maroc'] },
  ];
  return (
    <DemoPortalShell type="admin" title="IDP / ISP">
      <div className="mx-auto max-w-6xl space-y-6">
        <div><h1 className="text-2xl font-black text-neutral-900">Ideal Donor Profile / Ideal Sponsor Profile</h1><p className="text-sm text-neutral-500">Profil du donateur ideal / Profil du sponsor ideal</p></div>
        <div className="grid gap-5 md:grid-cols-2">
          {profiles.map(profile => (
            <section key={profile.title} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><profile.icon size={20} /></div><div><h2 className="font-black text-neutral-900">{profile.title}</h2><p className="text-sm text-neutral-500">{profile.subtitle}</p></div></div>
              <div className="mt-5 rounded-2xl bg-neutral-50 p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">Score cible</p><p className="text-3xl font-black text-emerald-700">{profile.score}</p></div>
              <ul className="mt-5 space-y-2">{profile.bullets.map(b => <li key={b} className="flex gap-2 text-sm text-neutral-600"><Target size={14} className="mt-0.5 text-emerald-600" />{b}</li>)}</ul>
            </section>
          ))}
        </div>
      </div>
    </DemoPortalShell>
  );
}
