'use client';

import { useState } from 'react';
import {
  AlertTriangle, Trash2, ChevronDown, ChevronRight,
  Mail, RotateCcw, AlertCircle, CheckCircle2, Loader2,
  Upload, Shield, Database, FileText, Bell, HelpCircle,
  Settings, Table, Scan, Star, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAppErrorLogs, useDeleteAppError, useClearAppErrors, useResolveAppError,
  type AppErrorLog, type AppErrorCategory,
} from '@/lib/api/mail-errors';
import { useAuthStore } from '@/store/auth.store';

const ALLOWED_EMAILS = ['salamcameroun237@gmail.com', 'vicklionel@yahoo.fr'];

type FilterKey = AppErrorCategory | 'all';

const CATEGORY_CFG: Record<FilterKey, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  all:          { label: 'Toutes',         bg: 'bg-neutral-100', text: 'text-neutral-700', icon: AlertTriangle },
  email:        { label: 'Email',          bg: 'bg-blue-100',    text: 'text-blue-700',    icon: Mail },
  upload:       { label: 'Upload',         bg: 'bg-orange-100',  text: 'text-orange-700',  icon: Upload },
  auth:         { label: 'Auth',           bg: 'bg-purple-100',  text: 'text-purple-700',  icon: Shield },
  validation:   { label: 'Validation',     bg: 'bg-yellow-100',  text: 'text-yellow-700',  icon: AlertCircle },
  database:     { label: 'Base données',   bg: 'bg-red-100',     text: 'text-red-700',     icon: Database },
  pdf:          { label: 'PDF',            bg: 'bg-teal-100',    text: 'text-teal-700',    icon: FileText },
  qr_scan:      { label: 'QR / Scanner',   bg: 'bg-cyan-100',    text: 'text-cyan-700',    icon: Scan },
  cauris:       { label: 'Cauris',         bg: 'bg-amber-100',   text: 'text-amber-700',   icon: Star },
  config:       { label: 'Config',         bg: 'bg-rose-100',    text: 'text-rose-700',    icon: Settings },
  csv_import:   { label: 'Import CSV',     bg: 'bg-lime-100',    text: 'text-lime-700',    icon: Table },
  notification: { label: 'Notification',   bg: 'bg-indigo-100',  text: 'text-indigo-700',  icon: Bell },
  other:        { label: 'Autre',          bg: 'bg-neutral-100', text: 'text-neutral-500', icon: HelpCircle },
};

const SEVERITY_CFG = {
  critical: { label: 'Critique', cls: 'bg-red-100 text-red-700 border-red-200' },
  major:    { label: 'Majeure',  cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  minor:    { label: 'Mineure',  cls: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
};

const FILTER_TABS: FilterKey[] = [
  'all', 'email', 'upload', 'auth', 'validation',
  'database', 'pdf', 'qr_scan', 'cauris', 'config', 'csv_import', 'notification', 'other',
];

function fmt(d: string) {
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function CategoryBadge({ category }: { category: AppErrorCategory }) {
  const cfg = CATEGORY_CFG[category] ?? CATEGORY_CFG.other;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CFG[severity as keyof typeof SEVERITY_CFG] ?? SEVERITY_CFG.minor;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function EmailFailures({ failures }: { failures: { name?: string; email?: string; reason?: string; code?: string }[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
        Adresses en échec ({failures.length})
      </p>
      {failures.map((f, i) => (
        <div key={i} className="flex flex-wrap items-start gap-3 bg-white border border-red-100 rounded-lg px-3 py-2">
          <Mail size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {f.name  && <div className="font-medium text-sm text-neutral-800">{f.name}</div>}
            {f.email && <div className="text-xs text-red-600 font-mono break-all">{f.email}</div>}
            {f.reason && <div className="text-xs text-neutral-500 mt-0.5">{f.reason}</div>}
          </div>
          {f.code && (
            <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
              {f.code}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function LogRow({
  log, onDelete, onResolve,
}: {
  log: AppErrorLog;
  onDelete: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const details  = log.details as Record<string, any> | undefined;
  const failures = details?.failures as any[] | undefined;

  return (
    <div className={`border rounded-xl overflow-hidden bg-white transition-opacity ${log.resolved ? 'opacity-55 border-neutral-100' : 'border-neutral-200'}`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <button className="text-neutral-400 hover:text-neutral-600 flex-shrink-0">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <CategoryBadge category={log.category} />
            <SeverityBadge severity={log.severity} />
            {details?.stoppedEarly && (
              <span className="text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-medium">
                Interrompu
              </span>
            )}
            {log.resolved && (
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                <Check size={10} />
                Résolu
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-neutral-800 truncate">{log.message}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-neutral-500">
            <span>{fmt(log.createdAt)}</span>
            {log.userName && (
              <span>Par <strong className="text-neutral-700">{log.userName}</strong></span>
            )}
            {log.source && (
              <code className="font-mono text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded max-w-xs truncate">
                {log.source}
              </code>
            )}
            {details?.totalSent !== undefined && (
              <span className="flex items-center gap-0.5">
                <CheckCircle2 size={11} className="text-emerald-500" />
                {String(details.totalSent)} envoyé(s)
              </span>
            )}
            {details?.totalFailed !== undefined && (
              <span className="flex items-center gap-0.5 text-red-500 font-medium">
                <AlertCircle size={11} />
                {String(details.totalFailed)} échec(s)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {!log.resolved && (
            <button
              onClick={() => onResolve(log._id)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
              title="Marquer comme résolu"
            >
              <Check size={15} />
            </button>
          )}
          <button
            onClick={() => onDelete(log._id)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3 space-y-4">
          {/* Context identifiers */}
          {(log.userId || log.ip || log.requestPath) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {log.userId && (
                <div>
                  <div className="text-neutral-400 mb-0.5">User ID</div>
                  <div className="font-mono text-neutral-700 break-all">{log.userId}</div>
                </div>
              )}
              {log.ip && (
                <div>
                  <div className="text-neutral-400 mb-0.5">IP</div>
                  <div className="font-mono text-neutral-700">{log.ip}</div>
                </div>
              )}
              {log.requestPath && (
                <div className="col-span-full">
                  <div className="text-neutral-400 mb-0.5">Route</div>
                  <div className="font-mono text-neutral-700">
                    {log.requestMethod} {log.requestPath}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email failures list */}
          {failures && failures.length > 0 && <EmailFailures failures={failures} />}

          {/* Generic details (non-email) */}
          {details && !failures && Object.keys(details).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Détails</div>
              <pre className="text-xs bg-white border border-neutral-200 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}

          {/* Resolved by */}
          {log.resolved && log.resolvedBy && (
            <div className="text-xs text-emerald-600">
              Résolu par <strong>{log.resolvedBy}</strong>
              {log.resolvedAt && ` le ${fmt(log.resolvedAt)}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GestionErreursPage() {
  const user = useAuthStore(s => s.user);
  const [page,         setPage]         = useState(1);
  const [category,     setCategory]     = useState<FilterKey>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const catArg = category === 'all' ? undefined : category;
  const { data, isLoading, refetch, isFetching } = useAppErrorLogs(page, catArg);
  const deleteEntry  = useDeleteAppError();
  const clearAll     = useClearAppErrors();
  const resolveEntry = useResolveAppError();

  const allLogs = data?.data?.logs ?? [];
  const logs    = showResolved ? allLogs : allLogs.filter(l => !l.resolved);
  const total   = data?.data?.total ?? 0;
  const pages   = data?.data?.pages ?? 1;

  const email        = user?.email ?? '';
  const isSuperAdmin = user?.effectivePermissions?.includes('*') ?? false;

  if (!isSuperAdmin && !ALLOWED_EMAILS.includes(email)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-neutral-500">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-lg font-semibold">Accès non autorisé</p>
        <p className="text-sm">Vous n'avez pas la permission d'accéder à cette section.</p>
      </div>
    );
  }

  const handleDelete  = (id: string) => deleteEntry.mutate(id);
  const handleResolve = (id: string) => resolveEntry.mutate(id);
  const handleClearAll = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAll.mutate(undefined, { onSettled: () => setConfirmClear(false) });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Gestion des erreurs</h1>
            <p className="text-sm text-neutral-500">{total} entrée(s) — toutes catégories</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowResolved(v => !v)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              showResolved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {showResolved ? 'Masquer résolus' : 'Afficher résolus'}
          </button>

          <button
            onClick={() => { void refetch(); }}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 disabled:opacity-50 transition-colors"
          >
            {isFetching ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            Actualiser
          </button>

          {total > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearAll.isPending}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                confirmClear
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                  : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <Trash2 size={14} />
              {confirmClear ? 'Confirmer suppression' : 'Vider'}
            </button>
          )}
          {confirmClear && (
            <button
              onClick={() => setConfirmClear(false)}
              className="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(key => {
          const cfg = CATEGORY_CFG[key];
          return (
            <button
              key={key}
              onClick={() => { setCategory(key); setPage(1); }}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                category === key
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-neutral-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
          <CheckCircle2 size={40} className="text-emerald-400" />
          <p className="font-medium text-neutral-600">Aucune erreur pour cette catégorie</p>
          <p className="text-sm">Toutes les opérations se sont déroulées correctement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <LogRow
              key={log._id}
              log={log}
              onDelete={handleDelete}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
