'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Handshake, Loader2, Mail, MapPin, MessageSquare, Search, Tag, Tags, Users, X } from 'lucide-react';
import { useMemberDirectorySearch, type DirectoryMember } from '@/lib/api/members';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { AvatarLightbox } from '@/components/portal/AvatarLightbox';

type NetworkingMember = DirectoryMember;

function countValues(members: NetworkingMember[], getter: (member: NetworkingMember) => string[] | string | undefined) {
  const map = new Map<string, number>();
  members.forEach(member => {
    const value = getter(member);
    const values = Array.isArray(value) ? value : value ? [value] : [];
    values.filter(Boolean).forEach(item => map.set(item, (map.get(item) ?? 0) + 1));
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function KeywordSection({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'amber' | 'violet' }) {
  const cls = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  }[tone];

  return (
    <div>
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="rounded-full bg-neutral-50 px-2 py-1 text-[10px] font-black text-neutral-400 ring-1 ring-neutral-100">Non renseigne</span>
        ) : items.map(item => (
          <span key={item} className={`rounded-full px-2 py-1 text-[10px] font-black ring-1 ${cls}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function MemberProfileModal({ member, onClose }: { member: NetworkingMember; onClose: () => void }) {
  const name = formatFullName(member.firstName, member.lastName);
  const photo = memberPhotoUrl(member);
  const location = [member.residenceCity || member.city, member.country].filter(Boolean).join(', ') || 'Residence non renseignee';
  const whatsapp = member.phone?.replace(/\D/g, '').replace(/^0/, '237');
  const modalMessageHref = '/member/messages?to=' + encodeURIComponent(member._id) + '&name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(member.email);

  return (
    <div className="fixed inset-0 z-[9999] grid min-h-[100dvh] place-items-center bg-black/65 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={event => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-500 shadow-sm transition hover:bg-neutral-100 hover:text-neutral-900"><X size={16} /></button>
        <div className="flex flex-col gap-5 border-b border-neutral-100 bg-gradient-to-br from-emerald-50 to-white p-5 sm:flex-row sm:items-center">
          {photo ? (
            <AvatarLightbox src={photo} alt={name} className={'h-20 w-20 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(member.gender)} />
          ) : (
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-black text-white ${memberInitialsClass(member.gender)}`}>{formatInitials(member.firstName, member.lastName, 'M')}</div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-black text-neutral-950">{name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-neutral-500"><MapPin size={14} /> {location}</p>
            <p className="mt-2 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">{member.activitySector || 'Secteur non renseigne'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${member.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700"><Mail size={12} /> Email</a>
              {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-2.5 text-xs font-black text-green-700 transition hover:bg-green-100">WhatsApp</a>}
              <Link href={modalMessageHref} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 text-xs font-black text-white transition hover:bg-emerald-700"><MessageSquare size={12} /> Message</Link>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-5">
          <KeywordSection title="Secteur d'activite" items={member.activitySector ? [member.activitySector] : []} tone="green" />
          <KeywordSection title="Competences" items={member.skills ?? []} tone="amber" />
          <KeywordSection title="Domaines d'expertise" items={member.expertiseDomains ?? []} tone="violet" />
          {member.bio && <div><p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Biographie</p><p className="text-sm leading-6 text-neutral-600">{member.bio}</p></div>}
        </div>
      </div>
    </div>
  );
}

function MemberNetworkingCard({ member, onOpen }: { member: NetworkingMember; onOpen: (member: NetworkingMember) => void }) {
  const name = formatFullName(member.firstName, member.lastName);
  const photo = memberPhotoUrl(member);
  const location = [member.residenceCity || member.city, member.country].filter(Boolean).join(', ');
  const whatsapp = member.phone?.replace(/\D/g, '').replace(/^0/, '237');
  const messageHref = `/member/messages?to=${encodeURIComponent(member._id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(member.email)}`;

  return (
    <article className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md">
      <div className="flex items-start gap-3">
        {photo ? (
          <AvatarLightbox src={photo} alt={name} className={'h-12 w-12 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(member.gender)} />
        ) : (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${memberInitialsClass(member.gender)}`}>{formatInitials(member.firstName, member.lastName, 'M')}</div>
        )}
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => onOpen(member)} className="block max-w-full truncate text-left text-sm font-black text-neutral-900 transition hover:text-emerald-700">{name}</button>
          <p className="mt-0.5 truncate text-xs font-semibold text-emerald-700">{member.activitySector || 'Secteur non renseigne'}</p>
          {location && <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold text-neutral-400"><MapPin size={11} /> {location}</p>}
        </div>
      </div>

      {member.bio && <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-500">{member.bio}</p>}

      <div className="mt-3 space-y-3">
        <KeywordSection title="Secteur d'activite" items={member.activitySector ? [member.activitySector] : []} tone="green" />
        <KeywordSection title="Competences" items={(member.skills ?? []).slice(0, 6)} tone="amber" />
        <KeywordSection title="Domaines d'expertise" items={(member.expertiseDomains ?? []).slice(0, 5)} tone="violet" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        <a href={`mailto:${member.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700"><Mail size={12} /> Email</a>
        {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-2.5 text-xs font-black text-green-700 transition hover:bg-green-100">WhatsApp</a>}
        <Link href={messageHref} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 text-xs font-black text-white transition hover:bg-emerald-700"><MessageSquare size={12} /> Message</Link>
        {member.antenne && <span className="text-[11px] font-bold text-neutral-400">Antenne {member.antenne}</span>}
      </div>
    </article>
  );
}

export default function NetworkingPage() {
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<NetworkingMember | null>(null);
  const query = useMemberDirectorySearch(search, 60);
  const results = query.data?.data?.data ?? [];
  const trimmed = search.trim();

  const sectors = useMemo(() => countValues(results, member => member.activitySector).slice(0, 8), [results]);
  const skills = useMemo(() => countValues(results, member => member.skills).slice(0, 8), [results]);
  const domains = useMemo(() => countValues(results, member => member.expertiseDomains).slice(0, 8), [results]);
  const completeProfiles = results.filter(member => Boolean(member.activitySector) && Boolean(member.skills?.length) && Boolean(member.expertiseDomains?.length)).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-[clamp(1.55rem,3vw,2rem)] font-black tracking-[-0.03em] text-neutral-900">Networking</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Repertoire de competences et de secteurs d'activite SALAM.</p>
      </div>

      <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-black text-neutral-900">Repertoire de competences</p>
          <p className="mt-1 text-xs text-neutral-400">Recherche sur secteurs, competences, domaines, villes, antennes et biographies.</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un secteur, une competence, un domaine..." className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
        </div>

        {results.length > 0 && (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="flex items-center gap-2 text-emerald-700"><Users size={18} /><p className="text-sm font-black">Profils trouves</p></div><p className="mt-3 text-2xl font-black text-emerald-900">{results.length}</p><p className="mt-1 text-xs font-semibold text-emerald-900/60">{completeProfiles} profils bien renseignes</p></div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4"><div className="flex items-center gap-2 text-amber-700"><Tags size={18} /><p className="text-sm font-black">Competences</p></div><p className="mt-3 text-2xl font-black text-amber-900">{skills.length}</p><p className="mt-1 text-xs font-semibold text-amber-900/60">mots-cles dominants</p></div>
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4"><div className="flex items-center gap-2 text-neutral-700"><Handshake size={18} /><p className="text-sm font-black">Secteurs</p></div><p className="mt-3 text-2xl font-black text-neutral-900">{sectors.length}</p><p className="mt-1 text-xs font-semibold text-neutral-500">secteurs detectes</p></div>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {[{ title: 'Top secteurs', items: sectors, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100' }, { title: 'Top competences', items: skills, cls: 'bg-amber-50 text-amber-700 ring-amber-100' }, { title: 'Top domaines', items: domains, cls: 'bg-violet-50 text-violet-700 ring-violet-100' }].map(block => (
                <div key={block.title} className="rounded-2xl border border-neutral-100 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">{block.title}</p><div className="mt-3 flex flex-wrap gap-1.5">{block.items.map(([label, count]) => <span key={label} className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${block.cls}`}>{label} · {count}</span>)}</div></div>
              ))}
            </div>
          </>
        )}

        {trimmed.length < 2 && <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center"><Handshake size={34} className="mb-3 text-neutral-200" /><p className="text-sm font-black text-neutral-500">Tapez au moins 2 caracteres.</p><p className="mt-1 max-w-md text-xs leading-6 text-neutral-400">Essayez un secteur, une competence ou un domaine comme finance, React, marketing ou data.</p></div>}
        {trimmed.length >= 2 && query.isLoading && <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-neutral-100 py-10 text-sm font-bold text-neutral-400"><Loader2 size={16} className="animate-spin" /> Recherche en cours...</div>}
        {trimmed.length >= 2 && !query.isLoading && results.length === 0 && <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center"><Users size={34} className="mb-3 text-neutral-200" /><p className="text-sm font-black text-neutral-500">Aucun profil trouve.</p><p className="mt-1 max-w-md text-xs leading-6 text-neutral-400">Essayez un mot-cle plus large ou un autre secteur.</p></div>}

        {results.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-2">{results.map(member => <MemberNetworkingCard key={member._id} member={member} onOpen={setSelectedMember} />)}</div>}
      </section>

      {selectedMember && <MemberProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
}


