'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Users, Award, MessageSquare, Calendar, Shield, Zap, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/public/PageHero';
import { useAdhesionForm } from '@/lib/api/public';
import { trackEvent, trackFormStart, trackFormSubmit, trackGenerateLead } from '@/lib/analytics';
import { PhoneField } from '@/components/ui/PhoneField';

// export const revalidate = 3600; // désactivé : 'use client' — non supporté, cause une erreur Vercel build

const AVANTAGES = [
  { icon: Users,         title: 'Réseau solidaire',   text: 'Accès à la communauté SALAM — entraide, réseau Alumni, soutien mutuel.' },
  { icon: Calendar,      title: 'Activités exclusives', text: 'Inscription aux événements sportifs, culturels, conférences et ateliers.' },
  { icon: Award,         title: 'Carte membre',        text: "Carte membre numérique officielle de l'association SALAM." },
  { icon: MessageSquare, title: 'Messagerie privée',   text: 'Accès à la messagerie interne pour échanger avec les autres membres.' },
  { icon: Shield,        title: 'Accompagnement',      text: 'Orientation, préparation administrative et accompagnement personnalisé.' },
  { icon: Zap,           title: 'Opportunités',        text: "Accès aux offres d'emploi, stages et opportunités entrepreneuriales." },
];

const ETAPES = [
  { num: '01', title: 'Remplissez le formulaire', text: 'Complétez vos informations personnelles et votre motivation.' },
  { num: '02', title: 'Vérification de votre demande', text: "Notre équipe examine votre dossier et vous contacte sous 48h." },
  { num: '03', title: 'Validation & accès', text: "Votre compte est activé. Bienvenue dans la famille SALAM !" },
];

export default function AdhesionPage() {
  const [sent,  setSent]  = useState(false);
  const [form,  setForm]  = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', motivation: '', type: 'etudiant' });
  const [honey, setHoney] = useState('');
  const [formErrors, setFormErrors] = useState<{ motivation?: string }>({});
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);
  const submittedRef = useRef(false);
  const abandonSentRef = useRef(false);
  const formRef = useRef(form);

  const adhesion = useAdhesionForm();

  formRef.current = form;

  useEffect(() => {
    const sendAbandonEvent = () => {
      if (!startedRef.current || submittedRef.current || abandonSentRef.current) return;
      abandonSentRef.current = true;
      const currentForm = formRef.current;
      trackEvent('adhesion_abandon', {
        member_type: currentForm.type,
        city: currentForm.city,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') sendAbandonEvent();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', sendAbandonEvent);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', sendAbandonEvent);
      sendAbandonEvent();
    };
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { motivation?: string } = {};
    if (form.motivation.trim().length < 10) {
      errs.motivation = 'Votre motivation doit comporter au moins 10 caractères.';
    }
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    adhesion.mutate(
      {
        firstName:  form.firstName,
        lastName:   form.lastName,
        email:      form.email,
        city:       form.city,
        type:       form.type,
        motivation: form.motivation,
        phone:      form.phone || undefined,
        _honey:     honey || undefined,
      },
      {
        onSuccess: () => {
          submittedRef.current = true;
          trackFormSubmit('adhesion', { member_type: form.type, city: form.city });
          trackEvent('adhesion_submit', { member_type: form.type, city: form.city });
          trackGenerateLead('adhesion_form', { member_type: form.type });
          setSent(true);
        },
      },
    );
  };

  const handleFormStart = () => {
    if (started) return;
    setStarted(true);
    startedRef.current = true;
    trackFormStart('adhesion');
    trackEvent('adhesion_start');
  };

  const inputCls = "h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/12";

  return (
    <main>
      <PageHero
        badge="Rejoindre SALAM"
        title="membre SALAM"
        accentWord="Devenir"
        accentPosition="start"
        subtitle="Rejoignez notre réseau solidaire et bénéficiez de l'accompagnement, des activités et de la communauté SALAM."
        breadcrumbs={[{ label: 'Adhésion' }]}
      >
        <div className="flex flex-wrap gap-3">
          <a href="#formulaire" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-black text-white transition-all hover:bg-emerald-400">
            Commencer l'adhésion
          </a>
          <Link href="/demo/member" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-white/70 transition-all hover:border-white/40 hover:text-white">
            Voir la démo membre
          </Link>
        </div>
      </PageHero>

      {/* Avantages */}
      <section className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Pourquoi rejoindre SALAM</span>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Les avantages <span className="text-emerald-700">de l'adhésion</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AVANTAGES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-[1.5rem] border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Icon size={20} className="text-emerald-700" />
                </div>
                <div>
                  <h3 className="mb-1 font-black text-neutral-900">{title}</h3>
                  <p className="text-xs leading-relaxed text-neutral-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section className="bg-white px-5 py-[clamp(3rem,6vw,5rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Comment <span className="text-emerald-700">ça marche</span>
            </h2>
          </div>
          <div className="relative flex flex-col gap-6 md:flex-row">
            <div className="absolute left-[1.35rem] top-0 hidden h-full w-px bg-emerald-200 md:left-0 md:top-6 md:h-px md:w-full md:block" />
            {ETAPES.map(({ num, title, text }) => (
              <div key={num} className="relative flex gap-4 md:flex-col md:gap-3 md:flex-1">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-sm font-black text-emerald-700 shadow-sm z-10">
                  {num}
                </div>
                <div>
                  <h3 className="font-black text-neutral-900">{title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section id="formulaire" className="bg-[#fffdf8] px-5 py-[clamp(4rem,8vw,7rem)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-[0.92] tracking-[-0.04em] text-neutral-900">
              Formulaire <span className="text-emerald-700">d'adhésion</span>
            </h2>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-10">
            {sent ? (
              <div className="flex flex-col items-center gap-5 py-12 text-center">
                <div className="flex h-18 w-18 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle size={34} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900">Demande envoyée !</h3>
                  <p className="mt-2 max-w-xs text-sm text-neutral-500">
                    Votre demande d'adhésion a été reçue. Notre équipe vous contactera sous 48h.
                  </p>
                </div>
                <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 transition-all">
                  Retour à l'accueil
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} onFocusCapture={handleFormStart} className="flex flex-col gap-5">
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

                {adhesion.isError && (
                  <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={15} className="shrink-0" />
                    {adhesion.error instanceof Error ? adhesion.error.message : 'Une erreur est survenue. Veuillez réessayer.'}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Prénom *</label>
                    <input required value={form.firstName} onChange={set('firstName')} placeholder="Jean" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Nom *</label>
                    <input required value={form.lastName} onChange={set('lastName')} placeholder="Dupont" className={inputCls} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Email *</label>
                    <input required type="email" value={form.email} onChange={set('email')} placeholder="jean@example.com" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Téléphone</label>
                    <PhoneField
                      value={form.phone}
                      onChange={val => setForm(f => ({ ...f, phone: val }))}
                      size="lg"
                      defaultCountry="CM"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Ville de résidence *</label>
                    <input required value={form.city} onChange={set('city')} placeholder="Yaoundé" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Profil *</label>
                    <select required value={form.type} onChange={set('type')} className={`${inputCls} cursor-pointer appearance-none`}>
                      <option value="etudiant">Étudiant(e)</option>
                      <option value="diplome">Diplômé(e)</option>
                      <option value="professionnel">Professionnel(le)</option>
                      <option value="sympathisant">Sympathisant(e)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Motivation *</label>
                  <textarea
                    required rows={4} value={form.motivation} onChange={e => { set('motivation')(e); if (formErrors.motivation) setFormErrors({}); }}
                    placeholder="Pourquoi souhaitez-vous rejoindre SALAM ? (min. 10 caractères)"
                    className={`w-full resize-none rounded-xl border bg-neutral-50 p-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:bg-white focus:ring-2 ${formErrors.motivation ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500/12'}`}
                  />
                  {formErrors.motivation && (
                    <p role="alert" className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} className="shrink-0" /> {formErrors.motivation}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={adhesion.isPending}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-60"
                >
                  {adhesion.isPending
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <><Send size={14} /> Envoyer ma demande</>
                  }
                </button>

                <p className="text-center text-[11px] text-neutral-400">
                  En soumettant ce formulaire, vous acceptez notre{' '}
                  <Link href="/confidentialite" className="underline hover:text-neutral-600">politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
