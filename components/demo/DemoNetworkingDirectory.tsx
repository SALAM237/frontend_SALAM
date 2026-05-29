'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Handshake, Mail, MapPin, Search, ShieldCheck, Tag, Tags, Users } from 'lucide-react';
import { demoMembers } from '@/data/demo/demo-members';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';

type DemoDirectoryMember = typeof demoMembers[number];

function listValues(member: DemoDirectoryMember, key: 'skills' | 'expertiseDomains') {
  return Array.isArray(member[key]) ? member[key] : [];
}

function countValues(members: DemoDirectoryMember[], getter: (member: DemoDirectoryMember) => string[] | string | undefined) {
  const map = new Map<string, number>();
  members.forEach(member => {
    const value = getter(member);
    const values = Array.isArray(value) ? value : value ? [value] : [];
    values.filter(Boolean).forEach(item => map.set(item, (map.get(item) ?? 0) + 1));
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function matches(member: DemoDirectoryMember, search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    member.firstName,
    member.lastName,
    member.email,
    member.city,
    member.country,
    member.residenceCity,
    member.antenne,
    member.activitySector,
    member.bio,
    ...(member.skills ?? []),
    ...(member.expertiseDomains ?? []),
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
}

function NetworkingCard({ member, admin = false }: { member: DemoDirectoryMember; admin?: boolean }) {
  const name = formatFullName(member.firstName, member.lastName);
  const photo = memberPhotoUrl(member);
  const location = [member.residenceCity || member.city, member.country].filter(Boolean).join(', ');
  const skills = listValues(member, 'skills');
  const expertiseDomains = listValues(member, 'expertiseDomains');

  return (
    <article className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md">
      <div className="flex items-start gap-3">
        {photo ? (
          <img src={photo} alt={name} className={`h-12 w-12 shrink-0 rounded-full border-2 object-cover ${memberAvatarBorderClass((member as any).gender)}`} />
        ) : (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${memberInitialsClass((member as any).gender)}`}>
            {formatInitials(member.firstName, member.lastName, 'M')}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-neutral-900">{name}</p>
          <p className="mt-0.5 truncate text-xs font-semibold text-emerald-700">{member.activitySector || 'Secteur non renseigne'}</p>
          {location && <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold text-neutral-400"><MapPin size={11} /> {location}</p>}
        </div>
      </div>

      {member.bio && <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-500">{member.bio}</p>}

      <div className="mt-3 space-y-2">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, admin ? 5 : 6).map(skill => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">
                <Tag size={10} /> {skill}
              </span>
            ))}
          </div>
        )}
        {expertiseDomains.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {expertiseDomains.slice(0, admin ? 4 : 5).map(domain => (
              <span key={domain} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 ring-1 ring-amber-100">
                <Briefcase size={10} /> {domain}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        <a href={`mailto:${member.email}`} className="inline-flex h-8 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700">
          <Mail size={12} /> {admin ? 'Email' : 'Contacter'}
        </a>
        {admin && member.memberId && <span className="font-mono text-[10px] text-neutral-400">{member.memberId}</span>}
        {!admin && member.antenne && <span className="text-[11px] font-bold text-neutral-400">Antenne {member.antenne}</span>}
      </div>
    </article>
  );
}

export function DemoNetworkingDirectory({ mode }: { mode: 'admin' | 'member' }) {
  const [search, setSearch] = useState('');
  const trimmed = search.trim();
  const members = useMemo(() => demoMembers.filter(member => matches(member, search)), [search]);
  const visibleMembers = mode === 'member' && trimmed.length < 2 ? [] : members;
  const sectors = useMemo(() => countValues(visibleMembers.length ? visibleMembers : demoMembers, member => member.activitySector).slice(0, 8), [visibleMembers]);
  const skills = useMemo(() => countValues(visibleMembers.length ? visibleMembers : demoMembers, member => member.skills).slice(0, 8), [visibleMembers]);
  const domains = useMemo(() => countValues(visibleMembers.length ? visibleMembers : demoMembers, member => member.expertiseDomains).slice(0, 8), [visibleMembers]);
  const completeProfiles = demoMembers.filter(member => Boolean(member.activitySector) && Boolean(member.skills?.length) && Boolean(member.expertiseDomains?.length)).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.55rem,3vw,2rem)] font-black tracking-[-0.03em] text-neutral-900">Networking</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {mode === 'admin'
              ? 'Pilotage demo des secteurs, competences et demandes a valider.'
              : "Repertoire demo de competences et de secteurs d'activite SALAM."}
          </p>
        </div>
        {mode === 'admin' && (
          <Link href="/demo/admin/validations" className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700">
            <ShieldCheck size={14} /> Validations en attente
          </Link>
        )}
      </div>

      <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Rechercher un secteur, une competence, un domaine..."
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        {mode === 'admin' && (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-2 text-emerald-700"><Users size={18} /><p className="text-sm font-black">Profils trouves</p></div>
                <p className="mt-3 text-2xl font-black text-emerald-900">{members.length}</p>
                <p className="mt-1 text-xs font-semibold text-emerald-900/60">{completeProfiles} profils bien renseignes</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-amber-700"><Tags size={18} /><p className="text-sm font-black">Competences</p></div>
                <p className="mt-3 text-2xl font-black text-amber-900">{skills.length}</p>
                <p className="mt-1 text-xs font-semibold text-amber-900/60">mots-cles dominants</p>
              </div>
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
                <div className="flex items-center gap-2 text-neutral-700"><Handshake size={18} /><p className="text-sm font-black">Secteurs</p></div>
                <p className="mt-3 text-2xl font-black text-neutral-900">{sectors.length}</p>
                <p className="mt-1 text-xs font-semibold text-neutral-500">secteurs detectes</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {[
                { title: 'Top secteurs', items: sectors, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
                { title: 'Top competences', items: skills, cls: 'bg-amber-50 text-amber-700 ring-amber-100' },
                { title: 'Top domaines', items: domains, cls: 'bg-violet-50 text-violet-700 ring-violet-100' },
              ].map(block => (
                <div key={block.title} className="rounded-2xl border border-neutral-100 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">{block.title}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {block.items.map(([label, count]) => (
                      <span key={label} className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${block.cls}`}>{label} - {count}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {mode === 'member' && trimmed.length < 2 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center">
            <Handshake size={34} className="mb-3 text-neutral-200" />
            <p className="text-sm font-black text-neutral-500">Tapez au moins 2 caracteres.</p>
            <p className="mt-1 max-w-md text-xs leading-6 text-neutral-400">Essayez finance, React, marketing, RH, data ou mentorat.</p>
          </div>
        )}

        {mode === 'member' && trimmed.length >= 2 && visibleMembers.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">{visibleMembers.length} profil(s)</span>
            {[...skills, ...domains].slice(0, 8).map(([tag, count]) => (
              <span key={tag} className="rounded-full bg-neutral-50 px-2.5 py-1 text-[10px] font-black text-neutral-500 ring-1 ring-neutral-100">{tag} - {count}</span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-black text-neutral-900">{mode === 'admin' ? 'Repertoire de competences' : 'Resultats demo'}</p>
          <p className="mt-1 text-xs text-neutral-400">Recherche sur secteurs, competences, domaines, villes, antennes et biographies.</p>
        </div>

        {visibleMembers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 py-10 text-center">
            <Briefcase size={32} className="mx-auto mb-3 text-neutral-200" />
            <p className="text-sm font-black text-neutral-500">{mode === 'member' && trimmed.length < 2 ? 'Lancez une recherche.' : 'Aucun profil trouve.'}</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {visibleMembers.map(member => <NetworkingCard key={member._id} member={member} admin={mode === 'admin'} />)}
          </div>
        )}
      </section>
    </div>
  );
}
