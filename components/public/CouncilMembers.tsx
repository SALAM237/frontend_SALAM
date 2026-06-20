'use client';

import { Loader2 } from 'lucide-react';
import { usePublicBureau } from '@/lib/api/roles';
import { assetUrl } from '@/lib/assets';
import { formatFullName, formatInitials } from '@/lib/format-name';

export function CouncilMembers() {
  const { data, isLoading } = usePublicBureau('council');
  const members = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-sm text-neutral-500">
        <Loader2 size={20} className="animate-spin text-emerald-600" />
        Chargement du conseil...
      </div>
    );
  }

  if (!members.length) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map(member => {
        const name = formatFullName(member.firstName, member.lastName);
        const photo = assetUrl(member.image ?? member.bureauPhoto);
        const poste = member.title || member.bureauPoste;

        return (
          <article key={member._id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-neutral-100">
              {photo ? (
                <img src={photo} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-700 text-xl font-black text-white">
                  {formatInitials(member.firstName, member.lastName)}
                </span>
              )}
            </div>
            <div className="p-5 text-center">
              <h3 className="text-base font-black text-neutral-900">{name}</h3>
              <p className="mt-1 text-sm font-semibold text-emerald-700">{poste}</p>
              <span className="mt-3 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-[11px] font-bold text-yellow-800">
                Conseil des sages
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}