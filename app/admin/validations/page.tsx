'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BriefcaseBusiness, Loader2, Newspaper, Images, Tags, Check, X, UserRound, ShieldCheck, Plus, XCircle, ChevronDown } from 'lucide-react';
import { usePendingValidations, useReviewPendingValidation, type PendingValidationItem } from '@/lib/api/validations';
import {
  useMemberCardChangeRequests, useReviewMemberCardChangeRequest, useMemberProfileValidationPolicy,
  useUpdateMemberProfileValidationPolicy,
  type MemberCardChangeRequest, type MemberProfileValidationField,
} from '@/lib/api/members';
import { memberAvatarBorderClass, memberInitialsClass, memberPhotoUrl } from '@/lib/avatar';
import { formatFullName, formatInitials } from '@/lib/format-name';

const TYPE_META = {
  content: { label: 'Actualité', icon: Newspaper, cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  gallery: { label: 'Album galerie', icon: Images, cls: 'bg-purple-50 text-purple-700 border-purple-100' },
  sector: { label: 'Secteur networking', icon: Tags, cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  opportunity: { label: 'Opportunite', icon: BriefcaseBusiness, cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  memberDeletion: { label: 'Suppression compte', icon: UserRound, cls: 'bg-red-50 text-red-700 border-red-100' },
} as const;

function validationDetails(item: PendingValidationItem) {
  const raw = item.item ?? {};
  const data = (raw.data ?? {}) as Record<string, unknown>;
  const details: string[] = [];

  if (item.type === 'content') {
    if (data.category) details.push('Categorie : ' + String(data.category));
    if (data.excerpt) details.push(String(data.excerpt));
  }

  if (item.type === 'gallery') {
    const images = Array.isArray(raw.images) ? raw.images.length : 0;
    if (raw.visibility) details.push('Visibilite : ' + String(raw.visibility));
    details.push(images + ' image' + (images > 1 ? 's' : ''));
  }

  if (item.type === 'sector') {
    details.push('Demande d\'ajout dans les secteurs networking');
  }

  if (item.type === 'opportunity') {
    if (raw.type) details.push('Type : ' + String(raw.type));
    if (raw.organization) details.push('Organisation : ' + String(raw.organization));
    if (raw.location) details.push('Lieu : ' + String(raw.location));
  }

  if (item.type === 'memberDeletion') {
    const target = raw.userId as Record<string, unknown> | undefined;
    const email = typeof target?.email === 'string' ? target.email : undefined;
    if (email) details.push('Compte : ' + email);
    if (raw.reason) details.push('Motif : ' + String(raw.reason));
    details.push('Suppression definitive apres validation');
  }

  return details.filter(Boolean).slice(0, 3);
}
function displayChangeValue(field: string, value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (field === 'gender') return value === 'femme' ? 'Madame' : 'Monsieur';
  if (field === 'birthDate') {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('fr-FR');
  }
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function ChangeBox({ label, field, before, after }: { label: string; field: string; before: unknown; after: unknown }) {
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs">
        <span className="break-words font-semibold text-neutral-500">{displayChangeValue(field, before)}</span>
        <ChevronDown size={13} className="-rotate-90 text-neutral-300" />
        <span className="break-words text-right font-black text-neutral-900">{displayChangeValue(field, after)}</span>
      </div>
    </div>
  );
}

function ValidationFieldsConfigurator() {
  const { data, isLoading, isError, error } = useMemberProfileValidationPolicy();
  const update = useUpdateMemberProfileValidationPolicy();
  const policy = data?.data;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (policy?.fields) setSelected(new Set(policy.fields));
  }, [policy?.fields]);

  const grouped = useMemo(() => {
    const groups = new Map<string, MemberProfileValidationField[]>();
    for (const field of policy?.availableFields ?? []) {
      groups.set(field.group, [...(groups.get(field.group) ?? []), field]);
    }
    return [...groups.entries()];
  }, [policy?.availableFields]);

  const toggle = (field: MemberProfileValidationField) => {
    if (field.required || policy?.requiredFields.includes(field.key)) return;
    setSelected(previous => {
      const next = new Set(previous);
      next.has(field.key) ? next.delete(field.key) : next.add(field.key);
      return next;
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-emerald-600" /></div>;
  if (isError) return <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error instanceof Error ? error.message : 'Configuration indisponible.'}</div>;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-sm font-black text-amber-900">Validation avant mise à jour</p>
        <p className="mt-1 text-xs leading-5 text-amber-700">
          Toute modification d'un champ sélectionné sera stockée en attente et ne modifiera le profil qu'après approbation d'un administrateur.
        </p>
      </div>
      {grouped.map(([group, fields]) => (
        <section key={group}>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">{group}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map(field => {
              const checked = selected.has(field.key);
              const required = field.required || policy?.requiredFields.includes(field.key);
              const buttonClass = 'flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition '
                + (checked ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 bg-white hover:border-emerald-200');
              const checkboxClass = 'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border '
                + (checked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-neutral-300 bg-white');
              return (
                <button key={field.key} type="button" onClick={() => toggle(field)} className={buttonClass}>
                  <div>
                    <p className={checked ? 'text-xs font-black text-emerald-800' : 'text-xs font-black text-neutral-700'}>{field.label}</p>
                    {required && <p className="mt-0.5 text-[10px] font-semibold text-amber-600">Validation obligatoire</p>}
                  </div>
                  <span className={checkboxClass}>{checked && <Check size={12} />}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <div className="sticky bottom-0 flex justify-end border-t border-neutral-100 bg-white pt-4">
        <button type="button" onClick={() => update.mutate([...selected])} disabled={update.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
          {update.isPending && <Loader2 size={14} className="animate-spin" />}
          Enregistrer les validations
        </button>
      </div>
    </div>
  );
}

function CardModificationsSection() {
  const [open, setOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const { data, isLoading, isError, error } = useMemberCardChangeRequests('pending');
  const { data: policyData } = useMemberProfileValidationPolicy();
  const review = useReviewMemberCardChangeRequest();
  const requests = data?.data?.data ?? [];
  const pendingCount = data?.data?.pending ?? 0;
  const availableFields = policyData?.data?.availableFields ?? [];
  const labels = new Map(availableFields.map(field => [field.key, field.label]));

  const submit = (request: MemberCardChangeRequest, action: 'approve' | 'reject') => {
    review.mutate({ id: request._id, action });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-neutral-50/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="font-black text-neutral-900">Modifications membres</p>
            <p className="mt-0.5 text-xs text-neutral-400">Champs sensibles soumis à validation admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-black text-white">
              {pendingCount}
            </span>
          )}
          <ChevronDown size={16} className={`text-neutral-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-neutral-100">
          <div className="flex items-center justify-between border-b border-neutral-50 px-5 py-3">
            <p className="text-sm font-semibold text-neutral-500">
              {showConfig ? 'Champs soumis à validation' : `${pendingCount} modification${pendingCount > 1 ? 's' : ''} en attente`}
            </p>
            <button
              type="button"
              onClick={() => setShowConfig(v => !v)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
            >
              <Plus size={12} />
              {showConfig ? 'Voir les demandes' : 'Configurer les champs'}
            </button>
          </div>

          <div className="max-h-[65vh] overflow-y-auto p-5">
            {showConfig ? (
              <ValidationFieldsConfigurator />
            ) : (
              <>
                {isLoading && <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-emerald-600" /></div>}
                {!isLoading && isError && (
                  <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error instanceof Error ? error.message : 'Impossible de charger les demandes.'}
                  </div>
                )}
                {!isLoading && !isError && requests.length === 0 && (
                  <div className="py-10 text-center">
                    <ShieldCheck size={28} className="mx-auto mb-3 text-neutral-200" />
                    <p className="text-sm font-semibold text-neutral-400">Aucune modification en attente.</p>
                  </div>
                )}
                {!isLoading && !isError && requests.length > 0 && (
                  <div className="space-y-3">
                    {requests.map(request => {
                      const member = request.userId;
                      const changes = request.changes?.length
                        ? request.changes
                        : [
                            ...(request.currentGender !== request.requestedGender
                              ? [{ field: 'gender', previousValue: request.currentGender, requestedValue: request.requestedGender }]
                              : []),
                            ...(request.currentPromotionYear !== request.requestedPromotionYear
                              ? [{ field: 'promotionYear', previousValue: request.currentPromotionYear, requestedValue: request.requestedPromotionYear }]
                              : []),
                          ];
                      return (
                        <div key={request._id} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-neutral-900">{formatFullName(member.firstName, member.lastName)}</p>
                              <p className="font-mono text-[11px] text-neutral-400">{member.memberNumber ?? '-'}</p>
                              <p className="mt-0.5 text-xs text-neutral-500">{member.email}</p>
                            </div>
                            <p className="text-[11px] font-semibold text-neutral-400">
                              {new Date(request.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {changes.map(change => (
                              <ChangeBox
                                key={change.field}
                                label={labels.get(change.field) ?? change.field}
                                field={change.field}
                                before={change.previousValue}
                                after={change.requestedValue}
                              />
                            ))}
                          </div>
                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <button type="button" onClick={() => submit(request, 'reject')} disabled={review.isPending}
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 px-4 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60">
                              Refuser
                            </button>
                            <button type="button" onClick={() => submit(request, 'approve')} disabled={review.isPending}
                              className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-600 px-4 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
                              Valider les modifications
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
      <CardModificationsSection />

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
                                {formatInitials(submitter.firstName ?? '', submitter.lastName ?? '', '??')}
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


