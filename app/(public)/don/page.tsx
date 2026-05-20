'use client';

import { useState } from 'react';
import { Heart, Shield, CheckCircle, Send, Star } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';

// export const revalidate = 3600; // désactivé : 'use client' — non supporté, cause une erreur Vercel build

const MONTANTS = [10, 20, 50, 100, 200];

const IMPACTS = [
  { montant: '10€', impact: "Participation aux frais d'une activité solidaire." },
  { montant: '20€', impact: "Soutien à l'organisation d'un atelier d'orientation." },
  { montant: '50€', impact: "Aide à l'accompagnement d'un étudiant nouvellement arrivé." },
  { montant: '100€', impact: "Contribution à l'organisation d'un événement communautaire." },
];

export default function DonPage() {
  const [montant, setMontant] = useState<number | ''>('');
  const [custom, setCustom] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const finalMontant = montant || Number(custom) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalMontant) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  const inputCls = "h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/12";

  return (
    <main>
      <PageHero
        badge="Soutenir SALAM"
        title="un don"
        accentWord="Faire"
        accentPosition="start"
        accentColor="yellow"
        subtitle="Votre générosité nous permet d'agir concrètement pour les étudiants et les personnes vulnérables de notre communauté."
        breadcrumbs={[{ label: 'Don' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">

            {/* Form */}
            <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
              {sent ? (
                <div className="flex flex-col items-center gap-5 py-12 text-center">
                  <div className="flex h-18 w-18 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle size={34} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-900">Merci pour votre don !</h3>
                    <p className="mt-2 max-w-xs text-sm text-neutral-500">
                      Votre générosité contribue directement au développement de notre communauté.
                    </p>
                  </div>
                  <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 transition-all">
                    Retour à l'accueil
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <h2 className="mb-2 text-xl font-black text-neutral-900">Choisissez un montant</h2>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {MONTANTS.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { setMontant(m); setCustom(''); }}
                          className={`h-11 rounded-xl border-2 text-sm font-black transition-all ${
                            montant === m
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-emerald-400'
                          }`}
                        >
                          {m}€
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-neutral-500">Autre montant :</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={1}
                          value={custom}
                          onChange={e => { setCustom(e.target.value); setMontant(''); }}
                          placeholder="Montant personnalisé"
                          className={`${inputCls} pr-8`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">€</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Prénom & nom *</label>
                      <input required value={form.name} onChange={set('name')} placeholder="Jean Dupont" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Email *</label>
                      <input required type="email" value={form.email} onChange={set('email')} placeholder="jean@example.com" className={inputCls} />
                    </div>
                  </div>

                  {finalMontant > 0 && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                      <p className="text-sm font-black text-emerald-800">Total : {finalMontant}€</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Reçu fiscal disponible après confirmation.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !finalMontant}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Heart size={14} /> Faire un don de {finalMontant || '...'}€</>}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                    <Shield size={11} /> Paiement sécurisé · Données protégées
                  </p>
                </form>
              )}
            </div>

            {/* Impact */}
            <div className="flex flex-col gap-5">
              <div className="rounded-[1.8rem] border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 font-black text-neutral-900">
                  <Star size={16} className="text-yellow-500" /> Votre impact
                </h3>
                <div className="flex flex-col gap-3">
                  {IMPACTS.map(({ montant: m, impact }) => (
                    <div key={m} className="flex gap-3">
                      <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">{m}</span>
                      <p className="text-xs leading-relaxed text-neutral-600">{impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 p-6">
                <h3 className="mb-2 font-black text-neutral-900">Devenez membre</h3>
                <p className="mb-5 text-sm text-neutral-600">
                  En plus d'un don, rejoignez notre réseau solidaire et bénéficiez de tous les avantages SALAM.
                </p>
                <Link href="/adhesion" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 transition-all">
                  Adhérer à SALAM →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
