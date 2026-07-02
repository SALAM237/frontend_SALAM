'use client';

import { useState } from 'react';
import {
  AlertTriangle, Trash2, ChevronDown, ChevronRight,
  Mail, RotateCcw, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMailErrorLogs, useDeleteMailError, useClearMailErrors, type MailErrorLog } from '@/lib/api/mail-errors';
import { useAuthStore } from '@/store/auth.store';

const ALLOWED_EMAILS = ['salamcameroun237@gmail.com', 'vicklionel@yahoo.fr'];

const CODE_LABELS: Record<string, { label: string; cls: string }> = {
  daily_quota_exceeded:   { label: 'Limite quotidienne atteinte',   cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  monthly_quota_exceeded: { label: 'Limite mensuelle atteinte',     cls: 'bg-red-100    text-red-700    border-red-200'    },
  rate_limit_exceeded:    { label: 'Trop de requêtes',              cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  validation_error:       { label: 'Adresse email invalide',        cls: 'bg-blue-100   text-blue-700   border-blue-200'   },
  missing_api_key:        { label: 'Clé API manquante',            cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  unknown:                { label: 'Erreur inconnue',               cls: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
};

function CodeBadge({ code }: { code?: string }) {
  const cfg = CODE_LABELS[code ?? 'unknown'] ?? CODE_LABELS.unknown;
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function LogRow({ log, onDelete }: { log: MailErrorLog; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <button className="text-neutral-400 hover:text-neutral-600 flex-shrink-0">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-neutral-800 truncate">{log.actionLabel || log.action}</span>
            {log.stoppedEarly && (
              <span className="text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-medium">
                Interrompu — limite atteinte
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-neutral-500">
            <span>{fmt(log.createdAt)}</span>
            {log.adminName && <span>Par <strong className="text-neutral-700">{log.adminName}</strong></span>}
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {log.totalSent} envoyé(s)
            </span>
            <span className="flex items-center gap-1 text-red-500 font-medium">
              <AlertCircle size={12} />
              {log.totalFailed} échec(s)
            </span>
          </div>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onDelete(log._id); }}
          className="flex-shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Supprimer cette entrée"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Expanded failures */}
      {open && (
        <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3">
          {log.failures.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">Aucun détail disponible.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                Adresses en échec ({log.failures.length})
              </p>
              {log.failures.map((f, i) => (
                <div key={i} className="flex flex-wrap items-start gap-3 bg-white border border-red-100 rounded-lg px-3 py-2">
                  <Mail size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-neutral-800">{f.name}</div>
                    <div className="text-xs text-red-600 font-mono break-all">{f.email}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{f.reason}</div>
                  </div>
                  <CodeBadge code={f.code} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GestionErreursPage() {
  const user = useAuthStore(s => s.user);
  const [page, setPage]       = useState(1);
  const [confirmClear, setConfirmClear] = useState(false);

  const { data, isLoading, refetch, isFetching } = useMailErrorLogs(page);
  const deleteEntry = useDeleteMailError();
  const clearAll    = useClearMailErrors();

  const logs  = data?.data?.logs  ?? [];
  const total = data?.data?.total ?? 0;
  const pages = data?.data?.pages ?? 1;

  const email = user?.email ?? '';
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

  const handleDelete = (id: string) => {
    deleteEntry.mutate(id);
  };

  const handleClearAll = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAll.mutate(undefined, { onSettled: () => setConfirmClear(false) });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Gestion des erreurs mail</h1>
            <p className="text-sm text-neutral-500">{total} entrée(s) enregistrée(s)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
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
              {confirmClear ? 'Confirmer la suppression' : 'Vider l\'historique'}
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

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(CODE_LABELS).map(([code, { label, cls }]) => (
          <span key={code} className={`px-2 py-0.5 rounded-full border font-medium ${cls}`}>{label}</span>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-neutral-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
          <CheckCircle2 size={40} className="text-emerald-400" />
          <p className="font-medium text-neutral-600">Aucune erreur enregistrée</p>
          <p className="text-sm">Tous les envois se sont déroulés correctement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <LogRow key={log._id} log={log} onDelete={handleDelete} />
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
