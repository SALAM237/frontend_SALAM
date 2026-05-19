'use client';

import { useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import Link from 'next/link';
import { useContactForm } from '@/lib/api/public';

const SUBJECTS = [
  { value: 'adhesion',    label: 'Adhésion / Devenir membre' },
  { value: 'activites',   label: 'Activités & événements' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'presse',      label: 'Presse & médias' },
  { value: 'don',         label: 'Don & soutien financier' },
  { value: 'autre',       label: 'Autre' },
];

export default function ContactPage() {
  const [sent,  setSent]  = useState(false);
  const [form,  setForm]  = useState({ name: '', email: '', subject: '', message: '', phone: '' });
  const [honey, setHoney] = useState('');

  const contact = useContactForm();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contact.mutate(
      {
        name:    form.name,
        email:   form.email,
        subject: form.subject,
        message: form.message,
        phone:   form.phone || undefined,
        _honey:  honey || undefined,
      },
      { onSuccess: () => setSent(true) },
    );
  };

  const inputCls = "h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/12";

  return (
    <main>
      <PageHero
        badge="Prenons contact"
        title="Contactez-nous"
        accentWord="SALAM"
        accentPosition="end"
        subtitle="Une question, une idée ou envie de rejoindre notre réseau ? Notre équipe vous répond dans les plus brefs délais."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">

            {/* Form card */}
            <div className="rounded-[1.8rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
              {sent ? (
                <div className="flex flex-col items-center gap-5 py-14 text-center">
                  <div className="flex h-18 w-18 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle size={34} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-900">Message envoyé !</h3>
                    <p className="mt-2 max-w-xs text-sm text-neutral-500">
                      Merci pour votre message. Notre équipe vous répondra dans les 48h ouvrées.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '', phone: '' }); }}
                    className="text-sm font-bold text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="mb-6 text-xl font-black text-neutral-900">Envoyez-nous un message</h2>

                  {contact.isError && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle size={15} className="shrink-0" />
                      {contact.error instanceof Error ? contact.error.message : 'Une erreur est survenue. Veuillez réessayer.'}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* honeypot — hidden from humans, filled by bots */}
                    <input
                      type="text"
                      name="_honey"
                      value={honey}
                      onChange={e => setHoney(e.target.value)}
                      tabIndex={-1}
                      aria-hidden="true"
                      autoComplete="off"
                      className="hidden"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Prénom & nom *</label>
                        <input required value={form.name} onChange={set('name')} placeholder="Jean Dupont" className={inputCls} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Email *</label>
                        <input required type="email" value={form.email} onChange={set('email')} placeholder="jean@example.com" className={inputCls} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Sujet *</label>
                      <select required value={form.subject} onChange={set('subject')} className={`${inputCls} cursor-pointer appearance-none`}>
                        <option value="">Sélectionnez un sujet</option>
                        {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Message *</label>
                      <textarea
                        required rows={5} value={form.message} onChange={set('message')}
                        placeholder="Décrivez votre demande..."
                        className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/12"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contact.isPending}
                      className="flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-60"
                    >
                      {contact.isPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <><Send size={14} /> Envoyer le message</>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-neutral-400">
                      En envoyant ce message, vous acceptez notre{' '}
                      <Link href="/confidentialite" className="underline hover:text-neutral-600">politique de confidentialité</Link>.
                    </p>
                  </form>
                </>
              )}
            </div>

            {/* Info sidebar */}
            <div className="flex flex-col gap-5">
              <div className="rounded-[1.8rem] border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 font-black text-neutral-900">Informations de contact</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { Icon: Mail,  label: 'Email officiel',   value: 'contact@salam-cameroun.com', href: 'mailto:contact@salam-cameroun.com' },
                    { Icon: MapPin, label: 'Localisation',    value: 'Paris, Île-de-France',       href: undefined },
                    { Icon: Clock,  label: 'Délai de réponse', value: 'Sous 48h ouvrées',          href: undefined },
                  ].map(({ Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                        <Icon size={15} className="text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm font-semibold text-emerald-700 hover:underline">{value}</a>
                        ) : (
                          <p className="text-sm font-semibold text-neutral-800">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] bg-gradient-to-br from-emerald-900 to-emerald-700 p-6 text-white shadow-sm">
                <h3 className="mb-2 font-black">Devenir membre SALAM</h3>
                <p className="mb-5 text-sm leading-relaxed text-white/65">
                  Rejoignez notre réseau et bénéficiez de l'accompagnement, des activités et de la communauté SALAM.
                </p>
                <Link href="/adhesion" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-emerald-800 transition-all hover:bg-emerald-50">
                  Rejoindre SALAM →
                </Link>
              </div>

              <div className="rounded-[1.8rem] border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-xs font-bold text-neutral-500">Mode démo disponible</p>
                <p className="mt-1 text-xs text-neutral-400">Explorez toutes les fonctionnalités sans créer de compte.</p>
                <Link href="/demo" className="mt-3 inline-flex text-xs font-black text-emerald-600 hover:underline">
                  Voir la démo →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
