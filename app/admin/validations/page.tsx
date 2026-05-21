'use client';

import Link from 'next/link';
import { BriefcaseBusiness, Loader2, Newspaper, Images, Tags, Check, X, UserRound } from 'lucide-react';
import { usePendingValidations, useReviewPendingValidation, type PendingValidationItem } from '@/lib/api/validations';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { formatFullName, formatInitials } from '@/lib/format-name';

const TYPE_META = {
  content: { label: 'Actualité', icon: Newspaper, cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  gallery: { label: 'Album galerie', icon: Images, cls: 'bg-purple-50 text-purple-700 border-purple-100' },
  sector: { label: 'Secteur networking', icon: Tags, cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  opportunity: { label: 'Opportunite', icon: BriefcaseBusiness, cls: 'bg-amber-50 text-amber-700 border-amber-100' },
} as const;

function validationDetails(item: PendingValidationItem) {
  const raw = item.item ?? {};
  const data = (raw.data ?? {}) as Record<string, unknown>;
  const details: string[] = [];

  if (item.type === 'content') {
    if (data.category) details.push(`Catégorie : ${String(data.category)}`);
    if (data.excerpt) details.push(String(data.excerpt));
  }

  if (item.type === 'gallery') {
    const images = Array.isArray(raw.images) ? raw.images.length : 0;
    if (raw.visibility) details.push(`Visibilité : ${String(raw.visibility)}`);
    details.push(`${images} image${images > 1 ? 's' : ''}`);
  }

  if (item.type === 'sector') {
    details.push('Demande d’ajout dans les secteurs networking');
  }

  if (item.type === 'opportunity') {
    if (raw.type) details.push(`Type : ${String(raw.type)}`);
    if (raw.organization) details.push(`Organisation : ${String(raw.organization)}`);
    if (raw.location) details.push(`Lieu : ${String(raw.location)}`);
  }

  return details.filter(Boolean).slice(0, 3);
}

export default function AdminValidationsPage() {
  const { data, isLoading } = usePendingValidations();
  const review = useReviewPendingValidation();
  const items = data?.data?.items ?? [];

  const handleReview = (item: PendingValidationItem, action: 'approve' | 'reject') => {
    const id = item.item?._id;
    if (!id || review.isPending) return;
    review.mutate({ type: item.type, id, action });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Validations en attente</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Éléments soumis par les membres, filtrés selon vos permissions de publication.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {isLoading && (
          <div className="flex flex-col items-center py-16">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
            <p className="mt-3 text-sm text-neutral-400">Chargement...</p>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <Check size={36} className="mb-3 text-emerald-200" />
            <p className="text-sm font-semibold text-neutral-400">Aucune validation en attente pour vos permissions.</p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="divide-y divide-neutral-50">
            {items.map(item => {
              const meta = TYPE_META[item.type];
              const Icon = meta.icon;
              const submitter = item.submitter;
              const submitterName = submitter ? formatFullName(submitter.firstName ?? '', submitter.lastName ?? '') : '';
              const submitterPhoto = memberPhotoUrl(submitter);
              const details = validationDetails(item);
              return (
                <div key={`${item.type}-${item.item?._id}`} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.cls}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-neutral-900">{item.title}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${meta.cls}`}>{meta.label}</span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">
                        Soumis le {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {details.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {details.map(detail => (
                            <span key={detail} className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
                              {detail}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex min-w-0 items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-2.5 py-2">
                        {submitter ? (
                          <>
                            {submitterPhoto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={submitterPhoto} alt={submitterName} className={`h-7 w-7 shrink-0 rounded-full border-2 object-cover ${memberAvatarBorderClass(submitter.gender)}`} />
                            ) : (
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${memberInitialsClass(submitter.gender)}`}>
                                {formatInitials(submitter.firstName ?? '', submitter.lastName ?? '', '?')}
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link href={`/admin/adherents/${submitter._id}`} className="truncate text-xs font-black text-neutral-800 transition hover:text-emerald-700">
                                {submitterName || 'Membre'}
                              </Link>
                              {submitter.email && <p className="truncate text-[10px] text-neutral-400">{submitter.email}</p>}
                            </div>
                          </>
                        ) : (
                          <>
                            <UserRound size={14} className="text-neutral-300" />
                            <p className="text-xs font-semibold text-neutral-400">Demandeur non renseigné</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => handleReview(item, 'reject')}
                      disabled={review.isPending}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:flex-none"
                    >
                      <X size={13} /> Refuser
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(item, 'approve')}
                      disabled={review.isPending}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
                    >
                      <Check size={13} /> Valider
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
