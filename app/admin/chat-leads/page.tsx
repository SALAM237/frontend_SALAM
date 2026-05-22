'use client';

import { useMemo, useState } from 'react';
import { Bot, Flame, Loader2, Mail, Phone, Search, Thermometer, UserRound } from 'lucide-react';
import { useAdminChatLeads, useUpdateChatLeadStatus, type ChatLeadRequestType, type ChatLeadStatus, type ChatLeadTemperature, type SalamChatLead } from '@/lib/api/chat-leads';

const REQUEST_LABELS: Record<ChatLeadRequestType, string> = {
  adhesion: 'Adhésion',
  orientation: 'Orientation',
  don: 'Don / soutien',
  partenariat: 'Partenariat',
  benevolat: 'Bénévolat',
  evenement: 'Événement',
  espace_membre: 'Espace membre',
  contact: 'Contact',
  autre: 'Autre',
};

const STATUS_LABELS: Record<ChatLeadStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Clos',
};

const TEMP_CLASSES: Record<ChatLeadTemperature, string> = {
  froid: 'border-sky-100 bg-sky-50 text-sky-700',
  tiède: 'border-amber-100 bg-amber-50 text-amber-700',
  chaud: 'border-red-100 bg-red-50 text-red-700',
};

function scorePriority(item: SalamChatLead) {
  if (item.requestType === 'don' && item.temperature === 'chaud') return 1;
  if (item.requestType === 'partenariat' && item.temperature === 'chaud') return 2;
  if (item.requestType === 'adhesion' && (item.email || item.phone)) return 3;
  if (item.requestType === 'orientation' && (item.email || item.phone)) return 4;
  if (item.requestType === 'benevolat') return 5;
  return 6;
}

function LeadCard({ item, onStatusChange, pending }: {
  item: SalamChatLead;
  onStatusChange: (id: string, status: ChatLeadStatus) => void;
  pending: boolean;
}) {
  const createdAt = new Date(item.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-[22px] border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Bot size={19} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-black text-neutral-900">
                {item.fullName || item.email || item.phone || 'Visiteur SALAM'}
              </p>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                {REQUEST_LABELS[item.requestType] ?? item.requestType}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${TEMP_CLASSES[item.temperature]}`}>
                {item.temperature}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-neutral-400">{createdAt}</p>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">
              {item.summary || item.lastMessage || 'Aucun résumé disponible.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.email && (
                <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-bold text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
                  <Mail size={12} /> {item.email}
                </a>
              )}
              {item.phone && (
                <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-bold text-neutral-600 transition hover:border-emerald-200 hover:text-emerald-700">
                  <Phone size={12} /> {item.phone}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-bold text-neutral-500">
                <UserRound size={12} /> {item.profileType}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center lg:justify-end">
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Score</p>
            <p className="text-xl font-black tracking-[-0.04em] text-neutral-900">{item.score}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">Priorité</p>
            <p className="text-xl font-black tracking-[-0.04em] text-neutral-900">{scorePriority(item)}</p>
          </div>
          <select
            value={item.status}
            disabled={pending}
            onChange={event => onStatusChange(item._id, event.target.value as ChatLeadStatus)}
            className="col-span-2 h-10 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 outline-none transition focus:border-emerald-300 sm:w-36"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function AdminChatLeadsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ChatLeadStatus | ''>('');
  const [temperature, setTemperature] = useState<ChatLeadTemperature | ''>('');
  const [requestType, setRequestType] = useState<ChatLeadRequestType | ''>('');
  const { data, isLoading } = useAdminChatLeads({ q, status, temperature, requestType });
  const updateStatus = useUpdateChatLeadStatus();

  const items = useMemo(() => data?.data?.items ?? [], [data]);
  const hotCount = items.filter(item => item.temperature === 'chaud').length;
  const contactCount = items.filter(item => item.email || item.phone).length;

  const handleStatusChange = (id: string, nextStatus: ChatLeadStatus) => {
    updateStatus.mutate({ id, status: nextStatus });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">Leads chatbot</h1>
          <p className="mt-1 text-sm text-neutral-500">Demandes détectées par l'assistant SALAM : adhésion, orientation, dons, partenariats et bénévolat.</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2">
            <p className="flex items-center gap-1.5 text-xs font-black text-red-700"><Flame size={14} /> {hotCount} chaud{hotCount > 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2">
            <p className="flex items-center gap-1.5 text-xs font-black text-emerald-700"><Mail size={14} /> {contactCount} contact{contactCount > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-neutral-100 bg-white p-3 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1fr_150px_150px_190px]">
          <label className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
            <input
              value={q}
              onChange={event => setQ(event.target.value)}
              placeholder="Rechercher par nom, email, téléphone ou résumé..."
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm font-semibold outline-none transition focus:border-emerald-300 focus:bg-white"
            />
          </label>
          <select value={status} onChange={event => setStatus(event.target.value as ChatLeadStatus | '')} className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs font-black text-neutral-600 outline-none">
            <option value="">Tous statuts</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={temperature} onChange={event => setTemperature(event.target.value as ChatLeadTemperature | '')} className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs font-black text-neutral-600 outline-none">
            <option value="">Température</option>
            <option value="chaud">Chaud</option>
            <option value="tiède">Tiède</option>
            <option value="froid">Froid</option>
          </select>
          <select value={requestType} onChange={event => setRequestType(event.target.value as ChatLeadRequestType | '')} className="h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs font-black text-neutral-600 outline-none">
            <option value="">Toutes demandes</option>
            {Object.entries(REQUEST_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-[24px] border border-neutral-100 bg-white py-16 shadow-sm">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-neutral-100 bg-white px-6 py-16 text-center shadow-sm">
          <Thermometer size={34} className="mb-3 text-neutral-200" />
          <p className="text-sm font-black text-neutral-500">Aucun lead chatbot pour ces filtres.</p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-3">
          {items.map(item => (
            <LeadCard
              key={item._id}
              item={item}
              pending={updateStatus.isPending}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
