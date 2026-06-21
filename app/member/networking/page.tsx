'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Handshake, Loader2, Mail, MapPin, MessageSquare, Search, Tag, Users } from 'lucide-react';
import { useMemberDirectorySearch, type DirectoryMember } from '@/lib/api/members';
import { formatFullName, formatInitials } from '@/lib/format-name';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { AvatarLightbox } from '@/components/portal/AvatarLightbox';

function MemberNetworkingCard({ member }: { member: DirectoryMember }) {
  const name = formatFullName(member.firstName, member.lastName);
  const photo = memberPhotoUrl(member);
  const location = [member.residenceCity || member.city, member.country].filter(Boolean).join(', ');
  const skills = member.skills ?? [];
  const expertiseDomains = member.expertiseDomains ?? [];
  const whatsapp = member.phone?.replace(/\D/g, '').replace(/^0/, '237');
  const messageHref = `/member/messages?to=${encodeURIComponent(member._id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(member.email)}`;

  return (
    <article className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md">
      <div className="flex items-start gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <AvatarLightbox src={photo} alt={name} className={'h-12 w-12 shrink-0 rounded-full border-2 object-cover ' + memberAvatarBorderClass(member.gender)} />
        ) : (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${memberInitialsClass(member.gender)}`}>
            {formatInitials(member.firstName, member.lastName, 'M')}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-neutral-900">{name}</p>
          <p className="mt-0.5 truncate text-xs font-semibold text-emerald-700">{member.activitySector || 'Secteur non renseigne'}</p>
          {location && (
            <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold text-neutral-400">
              <MapPin size={11} /> {location}
            </p>
          )}
        </div>
      </div>

      {member.bio && <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-500">{member.bio}</p>}

      <div className="mt-3 space-y-2">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map(skill => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">
                <Tag size={10} /> {skill}
              </span>
            ))}
          </div>
        )}
        {expertiseDomains.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {expertiseDomains.slice(0, 5).map(domain => (
              <span key={domain} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 ring-1 ring-amber-100">
                <Briefcase size={10} /> {domain}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        <a href={`mailto:${member.email}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-black text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700">
          <Mail size={12} /> Email
        </a>
        {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-2.5 text-xs font-black text-green-700 transition hover:bg-green-100">WhatsApp</a>}
        <Link href={messageHref} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 text-xs font-black text-white transition hover:bg-emerald-700"><MessageSquare size={12} /> Message</Link>
        {member.antenne && <span className="text-[11px] font-bold text-neutral-400">Antenne {member.antenne}</span>}
      </div>
    </article>
  );
}

export default function NetworkingPage() {
  const [search, setSearch] = useState('');
  const query = useMemberDirectorySearch(search, 24);
  const results = query.data?.data?.data ?? [];
  const trimmed = search.trim();

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    results.forEach(member => {
      [member.activitySector, ...(member.skills ?? []), ...(member.expertiseDomains ?? [])]
        .filter(Boolean)
        .forEach(item => counts.set(String(item), (counts.get(String(item)) ?? 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [results]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-[clamp(1.55rem,3vw,2rem)] font-black tracking-[-0.03em] text-neutral-900">Networking</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Repertoire de competences et de secteurs d'activite SALAM.</p>
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

        {trimmed.length < 2 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center">
            <Handshake size={34} className="mb-3 text-neutral-200" />
            <p className="text-sm font-black text-neutral-500">Tapez au moins 2 caracteres.</p>
            <p className="mt-1 max-w-md text-xs leading-6 text-neutral-400">
              Essayez un secteur, une competence ou un domaine comme finance, React, marketing ou data.
            </p>
          </div>
        )}

        {trimmed.length >= 2 && query.isLoading && (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-neutral-100 py-10 text-sm font-bold text-neutral-400">
            <Loader2 size={16} className="animate-spin" /> Recherche en cours...
          </div>
        )}

        {trimmed.length >= 2 && !query.isLoading && results.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-12 text-center">
            <Users size={34} className="mb-3 text-neutral-200" />
            <p className="text-sm font-black text-neutral-500">Aucun profil trouve.</p>
            <p className="mt-1 max-w-md text-xs leading-6 text-neutral-400">Essayez un mot-cle plus large ou un autre secteur.</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">{results.length} profil(s)</span>
              {topTags.map(([tag, count]) => (
                <span key={tag} className="rounded-full bg-neutral-50 px-2.5 py-1 text-[10px] font-black text-neutral-500 ring-1 ring-neutral-100">
                  {tag} · {count}
                </span>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {results.map(member => <MemberNetworkingCard key={member._id} member={member} />)}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
