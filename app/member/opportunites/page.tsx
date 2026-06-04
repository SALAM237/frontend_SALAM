'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, BriefcaseBusiness, CalendarDays, CheckCircle2, Edit3, Eye, Globe2, Lock, Mail, MapPin, Phone, Plus, Send, Tag, X } from 'lucide-react';
import { OPPORTUNITY_TYPES, useMemberOpportunities, useReplyOpportunity, useSubmitOpportunity, useUpdateOpportunity, type OpportunityDoc, type OpportunityPayload, type OpportunityType } from '@/lib/api/opportunities';
import { formatFullName } from '@/lib/format-name';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { RichText } from '@/components/ui/RichText';
import { trackEvent } from '@/lib/analytics';

const statusCls: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  rejected: 'bg-red-50 text-red-600 border-red-100',
  draft: 'bg-neutral-50 text-neutral-500 border-neutral-100',
  archived: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};

const statusLabel: Record<string, string> = {
  published: 'Publiee',
  pending: 'En validation',
  rejected: 'Refusee',
  draft: 'Brouillon',
  archived: 'Archivee',
};

const emptyForm: OpportunityPayload = {
  title: '',
  type: 'emploi',
  organization: '',
  location: '',
  remote: false,
  description: '',
  skills: [],
  deadline: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactUrl: '',
  visibility: 'members',
};

export default function OpportunitesPage() {
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'published' | 'mine'>('published');
  const [editTarget, setEditTarget] = useState<OpportunityDoc | null>(null);
  const [form, setForm] = useState<OpportunityPayload>(emptyForm);
  const [skillsText, setSkillsText] = useState('');
  const [formError, setFormError] = useState('');
  const [replyFor, setReplyFor] = useState<OpportunityDoc | null>(null);
  const [viewOpportunity, setViewOpportunity] = useState<OpportunityDoc | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const published = useMemberOpportunities('published');
  const mine = useMemberOpportunities('mine');
  const submit = useSubmitOpportunity();
  const update = useUpdateOpportunity();
  const reply = useReplyOpportunity();
  const items = tab === 'mine' ? mine.data?.data?.items ?? [] : published.data?.data?.items ?? [];
  const loading = tab === 'mine' ? mine.isLoading : published.isLoading;

  const typeLabel = useMemo(() => new Map(OPPORTUNITY_TYPES.map(t => [t.value, t.label])), []);

  const set = (key: keyof OpportunityPayload) => (value: string | boolean) => {
    setFormError('');
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setForm(emptyForm);
    setSkillsText('');
    setFormError('');
  };

  const openCreateForm = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setSkillsText('');
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (item: OpportunityDoc) => {
    if (item.status === 'published') return;
    setEditTarget(item);
    setForm({
      title: item.title ?? '',
      type: item.type,
      organization: item.organization ?? '',
      location: item.location ?? '',
      remote: !!item.remote,
      description: item.description ?? '',
      skills: item.skills ?? [],
      deadline: item.deadline ? item.deadline.slice(0, 10) : '',
      contactName: item.contactName ?? '',
      contactEmail: item.contactEmail ?? '',
      contactPhone: item.contactPhone ?? '',
      contactUrl: item.contactUrl ?? '',
      visibility: item.visibility ?? 'members',
    });
    setSkillsText((item.skills ?? []).join(', '));
    setFormError('');
    setShowForm(true);
    setTab('mine');
  };

  const handleSubmit = () => {
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title || !description) {
      setFormError('Le titre et la description sont obligatoires.');
      return;
    }
    if (!form.contactEmail?.trim() && !form.contactPhone?.trim() && !form.contactUrl?.trim()) {
      setFormError('Ajoutez au moins un moyen de contact : email, téléphone ou lien utile.');
      return;
    }
    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { ...form, title, description, skills };
    const onSuccess = () => {
      closeForm();
      setTab('mine');
    };

    if (editTarget) {
      update.mutate({ id: editTarget._id, payload }, { onSuccess });
      return;
    }

    submit.mutate(payload, { onSuccess });
  };

  const handleReply = () => {
    if (!replyFor) return;
    reply.mutate({ id: replyFor._id, payload: { message: replyMessage } }, {
      onSuccess: () => {
        trackEvent('opportunity_contact_submit', {
          opportunity_id: replyFor._id,
          opportunity_slug: replyFor.slug,
          opportunity_title: replyFor.title,
          opportunity_type: replyFor.type,
          organization: replyFor.organization,
        });
        setReplyFor(null);
        setReplyMessage('');
      },
    });
  };

  const openReplyModal = (item: OpportunityDoc, action: string) => {
    trackEvent('opportunity_contact_click', {
      opportunity_id: item._id,
      opportunity_slug: item.slug,
      opportunity_title: item.title,
      opportunity_type: item.type,
      organization: item.organization,
      action,
    });
    setReplyFor(item);
  };

  const openOpportunityDetail = (item: OpportunityDoc, action: string) => {
    trackEvent('opportunity_click', {
      opportunity_id: item._id,
      opportunity_slug: item.slug,
      opportunity_title: item.title,
      opportunity_type: item.type,
      organization: item.organization,
      source: 'member_list',
      action,
    });
    setViewOpportunity(item);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Opportunites</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Offres, partenariats, appels a projets et besoins d'associes partages par le reseau SALAM.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
        >
          <Plus size={16} /> Proposer une opportunite
        </button>
      </div>

      <AnimatedTabBar
        className="w-full sm:w-fit"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'published', label: 'Publiees' },
          { value: 'mine', label: 'Mes soumissions' },
        ]}
      />

      {showForm && (
        <div className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-neutral-900">{editTarget ? 'Modifier l’opportunite' : 'Nouvelle opportunite'}</p>
              <p className="text-xs text-neutral-500">
                {editTarget
                  ? 'La modification renvoie l’opportunite en validation avant publication.'
                  : 'Elle sera envoyee a validation avant publication. Choisissez si elle doit rester reservee aux membres ou etre visible sur le site public.'}
              </p>
            </div>
            <button onClick={closeForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-50"><X size={16} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Titre *</span>
              <input
                value={form.title}
                onChange={e => set('title')(e.target.value)}
                placeholder="Ex. Stage communication digitale"
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Type</span>
              <select value={form.type} onChange={e => set('type')(e.target.value as OpportunityType)} className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10">
                {OPPORTUNITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <Field label="Organisation / Porteur" value={form.organization} onChange={set('organization')} />
            <Field label="Lieu" value={form.location} onChange={set('location')} />
            <Field label="Nom du contact" value={form.contactName} onChange={set('contactName')} />
            <Field label="Email contact" value={form.contactEmail} onChange={set('contactEmail')} type="email" />
            <Field label="Telephone contact" value={form.contactPhone} onChange={set('contactPhone')} />
            <Field label="Date limite" value={form.deadline} onChange={set('deadline')} type="date" />
            <Field label="Lien utile" value={form.contactUrl} onChange={set('contactUrl')} />
            <Field label="Competences recherchees" value={skillsText} onChange={setSkillsText} placeholder="finance, React, gestion projet..." />
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-600">
              <input type="checkbox" checked={!!form.remote} onChange={e => set('remote')(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-emerald-600" />
              Possible a distance
            </label>
            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Visibilite *</span>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => set('visibility')('members')}
                  className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    form.visibility === 'members'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200'
                  }`}
                >
                  <Lock size={16} className="shrink-0" />
                  <span>
                    <span className="block text-sm font-black">Membres uniquement</span>
                    <span className="block text-xs font-semibold opacity-70">Visible dans l'espace membre apres validation.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => set('visibility')('public')}
                  className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    form.visibility === 'public'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200'
                  }`}
                >
                  <Globe2 size={16} className="shrink-0" />
                  <span>
                    <span className="block text-sm font-black">Public</span>
                    <span className="block text-xs font-semibold opacity-70">Visible sur /opportunites apres validation admin.</span>
                  </span>
                </button>
              </div>
            </div>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">Description *</span>
              <textarea
                value={form.description}
                onChange={e => set('description')(e.target.value)}
                rows={6}
                placeholder="Decrivez l'opportunite, le profil recherche, les missions et les modalites de reponse."
                className="min-h-[140px] w-full resize-y rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
              />
            </label>
          </div>
          {formError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {formError}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button onClick={handleSubmit} disabled={submit.isPending || update.isPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50">
              <Send size={15} /> {editTarget ? 'Mettre a jour' : 'Soumettre'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {loading && <p className="rounded-2xl border border-neutral-100 bg-white p-6 text-sm text-neutral-400">Chargement...</p>}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-100 bg-white px-5 py-14 text-center shadow-sm">
            <BriefcaseBusiness size={36} className="mb-3 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucune opportunite pour le moment.</p>
          </div>
        )}
        {items.map(item => (
          <article key={item._id} className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:border-emerald-100 hover:shadow-md sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">{typeLabel.get(item.type)}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${statusCls[item.status] ?? statusCls.draft}`}>{statusLabel[item.status] ?? item.status}</span>
                  {item.remote && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">Distanciel</span>}
                </div>
                <h2 className="mt-2 text-lg font-black leading-tight text-neutral-900"><RichText value={item.title} /></h2>
                <p className="mt-1 text-sm leading-6 text-neutral-600"><RichText value={item.description} /></p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button onClick={() => openOpportunityDetail(item, 'view_button_click')} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" title="Visualiser">
                  <Eye size={14} />
                </button>
                {tab === 'mine' && item.status !== 'published' && (
                  <button onClick={() => openEditForm(item)} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-black text-amber-700 transition hover:border-amber-300 hover:bg-amber-100" title="Modifier">
                    <Edit3 size={14} /> Modifier
                  </button>
                )}
                {tab === 'published' && (
                  <button onClick={() => openReplyModal(item, 'member_list_reply_button')} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 text-xs font-black text-emerald-700 transition hover:bg-emerald-50">
                    <Send size={13} /> Repondre
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-neutral-500">
              {item.organization && <Meta icon={BriefcaseBusiness}>{item.organization}</Meta>}
              {item.location && <Meta icon={MapPin}>{item.location}</Meta>}
              {item.deadline && <Meta icon={CalendarDays}>Avant {new Date(item.deadline).toLocaleDateString('fr-FR')}</Meta>}
              {item.contactEmail && <Meta icon={Mail}>{item.contactEmail}</Meta>}
              {item.contactPhone && <Meta icon={Phone}>{item.contactPhone}</Meta>}
              {item.submittedBy && <Meta icon={CheckCircle2}>{formatFullName(item.submittedBy.firstName, item.submittedBy.lastName)}</Meta>}
              {tab === 'mine' && item.status !== 'published' && <Meta icon={Edit3}>Modifiable avant publication</Meta>}
            </div>
            {!!item.skills?.length && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.skills.map(skill => <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-2 py-1 text-[10px] font-bold text-neutral-500"><Tag size={10} />{skill}</span>)}
              </div>
            )}
          </article>
        ))}
      </div>

      {replyFor && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-3 sm:items-center sm:justify-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-neutral-900">Repondre a l'opportunite</p>
                <p className="mt-1 text-xs text-neutral-500">{replyFor.title}</p>
              </div>
              <button onClick={() => setReplyFor(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-50"><X size={16} /></button>
            </div>
            <textarea value={replyMessage} onChange={e => setReplyMessage(e.target.value)} rows={5} placeholder="Expliquez votre interet, disponibilites ou profil..." className="mt-4 w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setReplyFor(null)} className="h-9 rounded-xl border border-neutral-200 px-4 text-xs font-black text-neutral-500">Annuler</button>
              <button onClick={handleReply} disabled={reply.isPending} className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white disabled:opacity-50">Envoyer</button>
            </div>
          </div>
        </div>
      )}
      {viewOpportunity && (
        <OpportunityDetailModal
          item={viewOpportunity}
          typeLabel={typeLabel}
          onClose={() => setViewOpportunity(null)}
          onReply={tab === 'published' ? () => {
            openReplyModal(viewOpportunity, 'member_detail_reply_button');
            setViewOpportunity(null);
          } : undefined}
        />
      )}
    </div>
  );
}

function OpportunityDetailModal({ item, typeLabel, onClose, onReply }: {
  item: OpportunityDoc;
  typeLabel: Map<OpportunityType, string>;
  onClose: () => void;
  onReply?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative border-b border-neutral-100 bg-gradient-to-br from-emerald-800 to-emerald-950 px-6 py-5 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white"><X size={16} /></button>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">{typeLabel.get(item.type)}</p>
          <h2 className="mt-2 pr-10 text-xl font-black leading-tight">{item.title}</h2>
          <p className="mt-1 text-xs font-semibold text-white/55">{statusLabel[item.status] ?? item.status}</p>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-line text-sm leading-7 text-neutral-600">{item.description}</p>
          <div className="grid gap-2 text-xs font-semibold text-neutral-500 sm:grid-cols-2">
            {item.organization && <Meta icon={BriefcaseBusiness}>{item.organization}</Meta>}
            {item.location && <Meta icon={MapPin}>{item.location}</Meta>}
            {item.deadline && <Meta icon={CalendarDays}>Avant {new Date(item.deadline).toLocaleDateString('fr-FR')}</Meta>}
            {item.contactEmail && <Meta icon={Mail}>{item.contactEmail}</Meta>}
            {item.contactPhone && <Meta icon={Phone}>{item.contactPhone}</Meta>}
            {item.submittedBy && <Meta icon={CheckCircle2}>{formatFullName(item.submittedBy.firstName, item.submittedBy.lastName)}</Meta>}
          </div>
          {!!item.skills?.length && (
            <div className="flex flex-wrap gap-1.5">
              {item.skills.map(skill => <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-2 py-1 text-[10px] font-bold text-neutral-500"><Tag size={10} />{skill}</span>)}
            </div>
          )}
          {onReply && (
            <button onClick={onReply} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700">
              <Send size={14} /> Repondre
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, required }: { label: string; value?: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">{label}{required && <span className="text-red-500"> *</span>}</span>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
    </label>
  );
}

function Meta({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1"><Icon size={12} />{children}</span>;
}
