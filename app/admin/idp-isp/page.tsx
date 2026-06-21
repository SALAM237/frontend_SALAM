'use client';

import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Mail,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  Users,
} from 'lucide-react';
import { useAdminChatLeads, useDeleteChatLead, useUpdateChatLeadStatus, type ChatLeadStatus, type SalamChatLead } from '@/lib/api/chat-leads';

const temperatureStyle: Record<string, { label: string; className: string }> = {
  chaud: { label: 'Chaud', className: 'border-red-200 bg-red-50 text-red-700' },
  'tiède': { label: 'Tiède', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  froid: { label: 'Froid', className: 'border-blue-200 bg-blue-50 text-blue-700' },
};

const statusLabels: Record<ChatLeadStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  in_progress: 'En suivi',
  resolved: 'Résolu',
  closed: 'Clôturé',
};

const requestLabels: Record<string, string> = {
  adhesion: 'Adhésion',
  orientation: 'Orientation',
  don: 'Donateur',
  partenariat: 'Sponsor',
  benevolat: 'Bénévolat',
  evenement: 'Événement',
  espace_membre: 'Espace membre',
  contact: 'Contact',
  autre: 'Autre',
};

function scoreColor(score: number) {
  if (score >= 70) return 'bg-red-500';
  if (score >= 35) return 'bg-amber-500';
  return 'bg-blue-500';
}

function whatsappHref(lead: SalamChatLead) {
  const phone = lead.phone?.replace(/[\s.-]/g, '').replace(/^0/, '237');
  if (phone) return `https://wa.me/${phone}`;
  const text = encodeURIComponent('Bonjour, je vous contacte suite à votre échange avec SALAM Cameroun · Maroc.');
  return `https://wa.me/23795859445?text=${text}`;
}

function LeadRow({ lead, onStatusChange, onDelete, deleting }: { lead: SalamChatLead; onStatusChange: (id: string, status: ChatLeadStatus) => void; onDelete: (lead: SalamChatLead) => void; deleting: boolean }) {
  const [open, setOpen] = useState(false);
  const temp = temperatureStyle[lead.temperature] ?? temperatureStyle.froid;
  const identity = lead.fullName || lead.email || lead.phone || 'Contact anonyme';
  const isStrategic = lead.requestType === 'don' || lead.requestType === 'partenariat';
  const conversation = (lead as any).conversation as { role: string; content: string }[] | undefined;

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${isStrategic ? 'border-emerald-200' : 'border-neutral-100'}`}>
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-3 px-3 py-3 text-left sm:px-4">
        <div className="hidden w-28 shrink-0 items-center gap-2 sm:flex">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div className={`h-full rounded-full ${scoreColor(lead.score)}`} style={{ width: `${lead.score}%` }} />
          </div>
          <span className="w-9 text-right text-[11px] font-black text-neutral-500">{lead.score}/100</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${temp.className}`}>{temp.label}</span>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
              {requestLabels[lead.requestType] ?? lead.requestType}
            </span>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-black text-neutral-600">
              {statusLabels[lead.status] ?? lead.status}
            </span>
          </div>
          <h2 className="truncate text-sm font-black text-neutral-900">{identity}</h2>
          <p className="mt-0.5 truncate text-xs font-medium text-neutral-500">{lead.summary || lead.lastMessage || 'Aucun résumé disponible'}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] font-bold text-neutral-400">{new Date(lead.createdAt).toLocaleDateString('fr-FR')}</p>
          {open ? <ChevronDown size={16} className="ml-auto mt-1 text-neutral-400" /> : <ChevronRight size={16} className="ml-auto mt-1 text-neutral-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-neutral-100 px-3 pb-4 pt-3 sm:px-4">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Nom', lead.fullName || '—'],
              ['Email', lead.email || '—'],
              ['Téléphone', lead.phone || '—'],
              ['Profil', lead.profileType || '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
                <p className="mt-1 break-words text-xs font-black text-neutral-800">{value}</p>
              </div>
            ))}
          </div>

          {lead.summary && (
            <div className="mt-3 rounded-2xl border border-neutral-100 bg-white p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Résumé de l'échange</p>
              <p className="text-sm leading-relaxed text-neutral-700">{lead.summary}</p>
            </div>
          )}

          {conversation?.length ? (
            <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-neutral-100 bg-[#07140d] p-3">
              {conversation.map((message, index) => (
                <div key={index} className={`mb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-emerald-700 text-white'
                      : 'rounded-bl-md bg-white/10 text-white/80'
                  }`}>
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a href={whatsappHref(lead)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-700 px-3 text-xs font-black text-white transition hover:bg-emerald-800">
              <MessageCircle size={14} /> WhatsApp
            </a>
            {lead.email && (
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent('Suite à votre demande auprès de SALAM')}`} className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700">
                <Mail size={14} /> Email
              </a>
            )}
            <select
              value={lead.status}
              onChange={event => onStatusChange(lead._id, event.target.value as ChatLeadStatus)}
              className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 outline-none transition focus:border-emerald-300"
            >
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button type="button" onClick={() => onDelete(lead)} disabled={deleting}
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-wait disabled:opacity-50">
              <Trash2 size={14} /> {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function AdminIdpIspPage() {
  const [q, setQ] = useState('');
  const [temperature, setTemperature] = useState('');
  const [requestType, setRequestType] = useState('');
  const filters = { q, temperature: temperature as any, requestType: requestType as any };
  const leadsQuery = useAdminChatLeads(filters);
  const updateStatus = useUpdateChatLeadStatus();
  const deleteLead = useDeleteChatLead();
  const leads = leadsQuery.data?.data.items ?? [];

  const stats = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter(l => l.temperature === 'chaud').length;
    const donors = leads.filter(l => l.requestType === 'don').length;
    const sponsors = leads.filter(l => l.requestType === 'partenariat').length;
    const withContact = leads.filter(l => l.email || l.phone).length;
    return { total, hot, donors, sponsors, withContact };
  }, [leads]);

  const statCards = [
    { label: 'Leads affichés', value: stats.total, icon: Users, className: 'bg-neutral-900 text-white' },
    { label: 'Chauds', value: stats.hot, icon: ShieldCheck, className: 'bg-red-50 text-red-700' },
    { label: 'Donateurs', value: stats.donors, icon: Target, className: 'bg-emerald-50 text-emerald-700' },
    { label: 'Sponsors', value: stats.sponsors, icon: Target, className: 'bg-amber-50 text-amber-700' },
    { label: 'Avec contact', value: stats.withContact, icon: Mail, className: 'bg-blue-50 text-blue-700' },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Gestion de lead</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-950">Ideal Donor Profile / Ideal Sponsor Profile</h1>
          <p className="mt-1 text-sm font-semibold text-neutral-500">Profil du donateur idéal / Profil du sponsor idéal</p>
        </div>
        <button
          onClick={() => leadsQuery.refetch()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          <RefreshCw size={15} className={leadsQuery.isFetching ? 'animate-spin' : ''} /> Rafraîchir
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(card => (
          <div key={card.label} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.className}`}>
                <card.icon size={17} />
              </span>
              <div>
                <p className="text-xl font-black text-neutral-900">{card.value}</p>
                <p className="text-[11px] font-bold text-neutral-400">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-neutral-100 bg-white p-3 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1fr_180px_190px_auto]">
          <label className="flex h-11 items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3">
            <Search size={16} className="text-neutral-400" />
            <input
              value={q}
              onChange={event => setQ(event.target.value)}
              placeholder="Rechercher nom, email, téléphone, résumé..."
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-neutral-700 outline-none placeholder:text-neutral-400"
            />
          </label>
          <select value={temperature} onChange={event => setTemperature(event.target.value)} className="h-11 rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-700 outline-none">
            <option value="">Tous les scores</option>
            <option value="chaud">Chaud</option>
            <option value="tiède">Tiède</option>
            <option value="froid">Froid</option>
          </select>
          <select value={requestType} onChange={event => setRequestType(event.target.value)} className="h-11 rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-700 outline-none">
            <option value="">Tous les types</option>
            <option value="don">Donateur</option>
            <option value="partenariat">Sponsor</option>
            <option value="adhesion">Adhésion</option>
            <option value="orientation">Orientation</option>
            <option value="benevolat">Bénévolat</option>
          </select>
          <button onClick={() => { setQ(''); setTemperature(''); setRequestType(''); }} className="h-11 rounded-2xl border border-neutral-200 px-4 text-sm font-black text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700">
            Réinitialiser
          </button>
        </div>
      </section>

      {leadsQuery.isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-neutral-100 bg-white text-neutral-400">
          <RefreshCw size={20} className="mr-2 animate-spin" /> Chargement des leads...
        </div>
      ) : leads.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white text-center">
          <Target size={34} className="mb-3 text-neutral-300" />
          <p className="text-sm font-black text-neutral-500">Aucun lead trouvé</p>
          <p className="mt-1 text-xs font-semibold text-neutral-400">Les contacts issus du chatbot SALAM apparaîtront ici.</p>
        </div>
      ) : (
        <section className="space-y-2">
          <p className="text-xs font-bold text-neutral-400">{leads.length} lead(s) affiché(s), triés par score décroissant.</p>
          {leads.map(lead => (
            <LeadRow
              key={lead._id}
              lead={lead}
              deleting={deleteLead.isPending && deleteLead.variables === lead._id}
              onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
              onDelete={(item) => {
                const identity = item.fullName || item.email || item.phone || 'ce lead';
                if (window.confirm('Supprimer definitivement ' + identity + ' ?')) deleteLead.mutate(item._id);
              }}
            />
          ))}
        </section>
      )}
    </div>
  );
}
