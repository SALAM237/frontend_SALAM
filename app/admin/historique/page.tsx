'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuditLogs, type AuditLogDoc } from '@/lib/api/audit-logs';

const ACTION_COLORS: Record<string, string> = {
  auth:        'bg-blue-50   text-blue-700   border-blue-200',
  cotisation:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  invoice:     'bg-violet-50 text-violet-700 border-violet-200',
  member:      'bg-amber-50  text-amber-700  border-amber-200',
  settings:    'bg-neutral-50 text-neutral-600 border-neutral-200',
  reminder:    'bg-orange-50 text-orange-700 border-orange-200',
  treasury:    'bg-emerald-50 text-emerald-800 border-emerald-200',
  content:     'bg-sky-50 text-sky-700 border-sky-200',
  activity:    'bg-teal-50 text-teal-700 border-teal-200',
};

const ACTION_LABELS: Record<string, string> = {
  'cotisation.status.paid':    'Cotisation → Payé',
  'cotisation.status.unpaid':  'Cotisation → Non payé',
  'cotisation.status.exempt':  'Cotisation → Exempté',
  'cotisation.reminder.send':  'Relances envoyées',
  'invoice.create':            'Facture créée',
  'invoice.send':              'Facture envoyée',
  'member.create':             'Nouveau membre',
  'member.status.active':      'Adhérent validé',
  'member.status.suspended':   'Adhérent suspendu',
  'settings.update':           'Paramètres modifiés',
  'auth.login':                'Connexion',
  'auth.logout':               'Déconnexion',
  'auth.register':             'Inscription',
};

const EXTRA_ACTION_LABELS: Record<string, string> = {
  role_created: 'Rôle créé',
  role_updated: 'Rôle modifié',
  role_deleted: 'Rôle supprimé',
  permission_created: 'Permission créée',
  roles_assigned: 'Rôles assignés',
  poste_assigned: 'Poste bureau assigné',
  bureau_photo_updated: 'Photo bureau modifiée',
  custom_perms_updated: 'Permissions personnalisées',
  admin_promoted: 'Admin promu',
  admin_revoked: 'Admin révoqué',
  login_success: 'Connexion',
  login_failed: 'Connexion échouée',
  logout: 'Déconnexion',
  register: 'Inscription',
  verify_email: 'Email vérifié',
  password_reset_request: 'Demande réinitialisation',
  password_reset: 'Mot de passe réinitialisé',
  'treasury.transaction.created': 'Écriture trésorerie créée',
  'treasury.transaction.updated': 'Écriture trésorerie modifiée',
  'treasury.transaction.deleted': 'Écriture trésorerie supprimée',
  'treasury.asset.created': 'Patrimoine ajouté',
  'treasury.asset.updated': 'Patrimoine modifié',
  'treasury.asset.deleted': 'Patrimoine supprimé',
  'treasury.document.uploaded': 'Document trésorerie importé',
  'treasury.membership_fee.proposed': 'Frais d’adhésion proposés',
  'treasury.membership_fee.approved': 'Frais d’adhésion validés',
  'treasury.membership_fee.rejected': 'Frais d’adhésion refusés',
  'content.article.created': 'Actualité créée',
  'content.article.updated': 'Actualité modifiée',
  'content.article.deleted': 'Actualité supprimée',
  'activity.created': 'Activité créée',
  'activity.updated': 'Activité modifiée',
  'activity.deleted': 'Activité supprimée',
};

const CATEGORIES = [
  { value: 'all',        label: 'Toutes' },
  { value: 'cotisation', label: 'Cotisations' },
  { value: 'invoice',    label: 'Facturation' },
  { value: 'member',     label: 'Adhérents' },
  { value: 'reminder',   label: 'Relances' },
  { value: 'treasury',   label: 'Trésorerie' },
  { value: 'content',    label: 'Actualités' },
  { value: 'activity',   label: 'Activités' },
  { value: 'settings',   label: 'Paramètres' },
  { value: 'auth',       label: 'Authentification' },
];

function actionCategory(action: string): string {
  if (!action) return 'settings';
  if (action.startsWith('cotisation.reminder')) return 'reminder';
  if (action.startsWith('treasury.')) return 'treasury';
  return action.split('.')[0];
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? EXTRA_ACTION_LABELS[action] ?? action;
}

function fmtLog(log: AuditLogDoc): { date: string; time: string } {
  const d = new Date(log.createdAt);
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h'),
  };
}

function logDetailsStr(log: AuditLogDoc): string {
  const d = log.details ?? log.meta ?? {};
  const parts: string[] = [];
  if (d.memberName)     parts.push(String(d.memberName));
  if (d.year)           parts.push(`Année ${d.year}`);
  if (d.reference)      parts.push(`Réf. ${d.reference}`);
  if (d.invoiceNumber)  parts.push(String(d.invoiceNumber));
  if (d.title)          parts.push(String(d.title));
  if (d.status)         parts.push(`Statut ${d.status}`);
  if (d.visibility)     parts.push(d.visibility === 'public' ? 'Public' : d.visibility === 'members' ? 'Membres' : String(d.visibility));
  if (d.amount)         parts.push(`${Number(d.amount).toLocaleString('fr-FR')} F.CFA`);
  if (d.sent !== undefined) parts.push(`${d.sent} envoyé(s)`);
  if (d.recipientCount) parts.push(`${d.recipientCount} destinataires`);
  if (d.fromLabel && d.toLabel) parts.push(`${d.fromLabel} → ${d.toLabel}`);
  return parts.join(' — ') || '—';
}

function Skeleton() {
  return (
    <div className="divide-y divide-neutral-50">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-start gap-4 px-5 py-4">
          <div className="h-9 w-9 rounded-full bg-neutral-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-neutral-100" />
            <div className="h-2 w-64 rounded bg-neutral-50" />
            <div className="h-2 w-32 rounded bg-neutral-50" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-2 w-20 rounded bg-neutral-100" />
            <div className="h-2 w-12 rounded bg-neutral-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HistoriquePage() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [page,     setPage]     = useState(1);

  const { data, isLoading, isError } = useAuditLogs(page);

  const logs  = data?.data?.logs  ?? [];
  const total = data?.data?.total ?? 0;
  const pages = data?.data?.pages ?? 1;

  const filtered = useMemo(() =>
    logs.filter(l => {
      const cat    = actionCategory(l.action);
      const matchCat    = category === 'all' || cat === category;
      const matchSearch = `${l.adminName ?? ''} ${l.adminRole ?? ''} ${actionLabel(l.action)} ${logDetailsStr(l)}`
        .toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }),
  [logs, search, category]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Historique des actions</h1>
        <p className="mt-1 text-sm text-neutral-500">Toutes les actions effectuées par les administrateurs.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 text-sm outline-none placeholder:text-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="h-10 appearance-none rounded-xl border border-neutral-200 bg-white pl-8 pr-8 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
        <span className="text-xs font-semibold text-neutral-400">
          {isLoading ? '…' : `${total} total`}
        </span>
      </div>

      {/* Log list */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="divide-y divide-neutral-50">

          {isLoading && <Skeleton />}

          {isError && (
            <div className="px-5 py-10 text-center text-sm text-red-500">
              Erreur de chargement. Vérifiez la connexion au serveur.
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-neutral-400">Aucune entrée pour ce filtre.</p>
          )}

          {!isLoading && !isError && filtered.map(log => {
            const cat      = actionCategory(log.action);
            const colorCls = ACTION_COLORS[cat] ?? ACTION_COLORS.settings;
            const { date, time } = fmtLog(log);
            const actorInitials = (log.adminName ?? 'Sys').split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2) || 'SY';
            const categoryLabel = CATEGORIES.find(c => c.value === cat)?.label ?? 'Audit';
            return (
              <div key={log._id} className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-50/60 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white shadow-sm">
                  {actorInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black leading-tight tracking-[-0.02em] text-neutral-900">
                      {actionLabel(log.action)}
                    </h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${colorCls}`}>
                      {categoryLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{logDetailsStr(log)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-neutral-400">
                    <span>Par {log.adminName ?? 'Système'}</span>
                    <span>{log.adminRole ?? 'Audit'}</span>
                    {log.ip && <span className="font-mono">IP: {log.ip}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-semibold text-neutral-500">{date}</p>
                  <p className="text-[10px] text-neutral-400">{time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 disabled:opacity-40">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-black text-neutral-600">
            Page {page} / {pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 disabled:opacity-40">
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 size={18} className="animate-spin text-neutral-300" />
        </div>
      )}
    </div>
  );
}
