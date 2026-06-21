'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Handshake, Loader2, Mail, MapPin, MessageSquare, Search, ShieldCheck, Tags, Users } from 'lucide-react';
import { useAdminMembers, type MemberListItem } from '@/lib/api/members';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { AvatarLightbox } from '@/components/portal/AvatarLightbox';

function countValues(members: MemberListItem[], getter: (member: MemberListItem) => string[] | string | undefined) {
  const map = new Map<string, number>();
  members.forEach(member => {
    const value = getter(member);
    const values = Array.isArray(value) ? value : value ? [value] : [];
    values.filter(Boolean).forEach(item => map.set(item, (map.get(item) ?? 0) + 1));
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function AdminNetworkingCard({ member }: { member: MemberListItem }) {
  const name = formatFullName(member.firstName, member.lastName);
  const photo = memberPhotoUrl(member);
  const location = [member.residenceCity || member.city, member.country].filter(Boolean).join(', ');
  const skills = member.skills ?? [];
  const expertiseDomains = member.expertiseDomains ?? [];
  const whatsapp = member.phone?.replace(/\D/g, '').replace(/^0/, '237');
  const messageHref = `/admin/messages?to=${encodeURIComponent(member._id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(member.email)}`;

  return (
    <article className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <AvatarLightbox src={photo} alt={name} className={'h-11 w-11 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(member.gender)} />
        ) : (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${memberInitialsClass(member.gender)}`}>
            {formatInitials(member.firstName, member.lastName, 'M')}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-neutral-900">{name}</p>
          <p className="mt-0.5 truncate text-xs font-semibold text-emerald-700">{member.activitySector || 'Secteur non renseigne'}</p>
          {location && <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold text-neutral-400"><MapPin size={11} /> {location}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {skills.slice(0, 5).map(skill => (
          <span key={skill} className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">{skill}</span>
        ))}
        {expertiseDomains.slice(0, 4).map(domain => (
          <span key={domain} className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 ring-1 ring-amber-100">{domain}</span>
        ))}
        {skills.length === 0 && expertiseDomains.length === 0 && (
          <span className="rounded-full bg-neutral-50 px-2 py-1 text-[10px] font-black text-neutral-400 ring-1 ring-neutral-100">Profil a completer</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        <a href={`mailto:${member.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700"><Mail size={12} /> Email</a>
        {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center rounded-xl border border-green-200 bg-green-50 px-2.5 text-xs font-black text-green-700 hover:bg-green-100">WhatsApp</a>}
        <Link href={messageHref} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 text-xs font-black text-white hover:bg-emerald-700"><MessageSquare size={12} /> Message</Link>
        {member.memberId && <span className="font-mono text-[10px] text-neutral-400">{member.memberId}</span>}
      </div>
    </article>
  );
}

export default function AdminNetworkingPage() {
  const [search, setSearch] = useState('');
  const membersQuery = useAdminMembers({ search, limit: 60 });
  const members = membersQuery.data?.data?.data ?? [];

  const sectors = useMemo(() => countValues(members, member => member.activitySector).slice(0, 8), [members]);
  const skills = useMemo(() => countValues(members, member => member.skills).slice(0, 8), [members]);
  const domains = useMemo(() => countValues(members, member => member.expertiseDomains).slice(0, 8), [members]);

  const completeProfiles = members.filter(member =>
    Boolean(member.activitySector) && Boolean(member.skills?.length) && Boolean(member.expertiseDomains?.length)
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.55rem,3vw,2rem)] font-black tracking-[-0.03em] text-neutral-900">Networking</h1>
          <p className="mt-1 text-sm text-neutral-500">Pilotage des secteurs, competences et demandes a valider.</p>
        </div>
        <Link href="/admin/validations" className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700">
          <ShieldCheck size={14} /> Validations en attente
        </Link>
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

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 text-emerald-700"><Users size={18} /><p className="text-sm font-black">Profils trouves</p></div>
            <p className="mt-3 text-2xl font-black text-emerald-900">{membersQuery.isLoading ? '...' : members.length}</p>
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
                {block.items.length === 0 && <span className="text-xs font-semibold text-neutral-400">Aucune donnee.</span>}
                {block.items.map(([label, count]) => (
                  <span key={label} className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${block.cls}`}>{label} · {count}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-neutral-900">Repertoire de competences</p>
            <p className="mt-1 text-xs text-neutral-400">Recherche sur secteurs, competences, domaines, villes, antennes et biographies.</p>
          </div>
          {membersQuery.isLoading && <Loader2 size={16} className="animate-spin text-emerald-600" />}
        </div>

        {!membersQuery.isLoading && members.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 py-10 text-center">
            <Briefcase size={32} className="mx-auto mb-3 text-neutral-200" />
            <p className="text-sm font-black text-neutral-500">Aucun profil trouve.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {members.map(member => <AdminNetworkingCard key={member._id} member={member} />)}
          </div>
        )}
      </section>
    </div>
  );
}
