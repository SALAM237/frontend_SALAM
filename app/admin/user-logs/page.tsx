'use client';

import { useState } from 'react';
import {
  AlertTriangle, Laptop, LogIn, LogOut, MapPin, Monitor, Smartphone, Tablet,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUserActivityLogs, useUserAuditLogs, type UserActivityLogDoc, type UserAuditLogDoc } from '@/lib/api/user-logs';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';
import { ListToolbar } from '@/components/shared/ListToolbar';
import { formatPageUrl } from '@/lib/format-url';

const ALLOWED_EMAIL = 'salamcameroun237@gmail.com';

type TabValue = 'activity' | 'audit';

const tabs: { value: TabValue; label: string }[] = [
  { value: 'activity', label: 'Activité' },
  { value: 'audit',    label: 'Audit' },
];

const EVENT_TYPES = [
  { value: 'all',       label: 'Tous les événements' },
  { value: 'page_view', label: 'Pages visitées' },
  { value: 'login',     label: 'Connexions' },
  { value: 'logout',    label: 'Déconnexions' },
];

function DeviceIcon({ type }: { type?: string }) {
  if (type === 'mobile') return <Smartphone size={14} />;
  if (type === 'tablet') return <Tablet size={14} />;
  if (type === 'desktop') return <Monitor size={14} />;
  return <Laptop size={14} />;
}

function fmt(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h'),
  };
}

function humanizeAction(action: string) {
  return action.replace(/[._]/g, ' ');
}

export default function UserLogsPage() {
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState<TabValue>('activity');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('all');

  const activityQuery = useUserActivityLogs({ page, limit: pageSize, search, eventType });
  const auditQuery = useUserAuditLogs({ page, limit: pageSize, search });

  if (user?.email !== ALLOWED_EMAIL) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-neutral-500">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-lg font-semibold">Accès non autorisé</p>
        <p className="text-sm">Vous n'avez pas la permission d'accéder à cette section.</p>
      </div>
    );
  }

  const activityLogs = activityQuery.data?.data?.logs ?? [];
  const activityTotal = activityQuery.data?.data?.total ?? 0;
  const activityPages = activityQuery.data?.data?.pages ?? 1;

  const auditLogs = auditQuery.data?.data?.logs ?? [];
  const auditTotal = auditQuery.data?.data?.total ?? 0;
  const auditPages = auditQuery.data?.data?.pages ?? 1;

  const changeTab = (v: TabValue) => { setTab(v); setPage(1); };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">User Log</h1>
        <p className="mt-1 text-sm text-neutral-500">Journal complet d'activité et d'audit — accès restreint.</p>
      </div>

      <AnimatedTabBar items={tabs} value={tab} onChange={changeTab} />

      {tab === 'activity' && (
        <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <ListToolbar
            search={search}
            onSearchChange={v => { setSearch(v); setPage(1); }}
            pageSize={pageSize}
            onPageSizeChange={v => { setPageSize(v); setPage(1); }}
            placeholder="Rechercher par nom, email, page..."
            filterSlot={
              <select
                value={eventType}
                onChange={e => { setEventType(e.target.value); setPage(1); }}
                className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-semibold text-neutral-600 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:rounded-xl sm:text-sm"
              >
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            }
          />
          <p className="mb-2 text-xs font-semibold text-neutral-400">{activityQuery.isLoading ? '…' : `${activityTotal} événement(s)`}</p>

          <div className="divide-y divide-neutral-50">
            {activityQuery.isLoading && <p className="py-8 text-center text-sm text-neutral-400">Chargement…</p>}
            {activityQuery.isError && <p className="py-8 text-center text-sm text-red-500">Erreur de chargement.</p>}
            {!activityQuery.isLoading && activityLogs.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">Aucune activité.</p>}
            {activityLogs.map((log: UserActivityLogDoc) => {
              const { date, time } = fmt(log.createdAt);
              return (
                <div key={log._id} className="flex items-start gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    {log.eventType === 'login' ? <LogIn size={15} /> : log.eventType === 'logout' ? <LogOut size={15} /> : <DeviceIcon type={log.device?.type} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <p className="text-sm font-black text-neutral-900">{log.userName || 'Utilisateur'}</p>
                      <span className="text-xs text-neutral-400">{log.userEmail}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {log.eventType === 'page_view' ? `Page : ${log.path ? formatPageUrl(log.path) : '—'}` : log.eventType === 'login' ? 'Connexion' : 'Déconnexion'}
                      {log.method && ` · ${log.method}`}
                      {log.statusCode && ` · ${log.statusCode}`}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-neutral-400">
                      {log.ip && <span className="font-mono">IP {log.ip}</span>}
                      {log.geo?.city && <span className="flex items-center gap-1"><MapPin size={10} />{log.geo.city}{log.geo.country ? `, ${log.geo.country}` : ''}</span>}
                      {log.device?.browser && <span>{log.device.browser} {log.device.browserVersion}</span>}
                      {log.device?.os && <span>{log.device.os} {log.device.osVersion}</span>}
                      {log.device?.type && <span className="capitalize">{log.device.type}</span>}
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

          {activityPages > 1 && (
            <Pagination page={page} pages={activityPages} onChange={setPage} />
          )}
        </section>
      )}

      {tab === 'audit' && (
        <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <ListToolbar
            search={search}
            onSearchChange={v => { setSearch(v); setPage(1); }}
            pageSize={pageSize}
            onPageSizeChange={v => { setPageSize(v); setPage(1); }}
            placeholder="Rechercher par nom, action..."
          />
          <p className="mb-2 text-xs font-semibold text-neutral-400">{auditQuery.isLoading ? '…' : `${auditTotal} entrée(s)`}</p>

          <div className="divide-y divide-neutral-50">
            {auditQuery.isLoading && <p className="py-8 text-center text-sm text-neutral-400">Chargement…</p>}
            {auditQuery.isError && <p className="py-8 text-center text-sm text-red-500">Erreur de chargement.</p>}
            {!auditQuery.isLoading && auditLogs.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">Aucune entrée.</p>}
            {auditLogs.map((log: UserAuditLogDoc) => {
              const { date, time } = fmt(log.createdAt);
              return (
                <div key={log._id} className="flex items-start gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-black text-white">
                    {(log.adminName ?? 'Sys').split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || 'SY'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black capitalize text-neutral-900">{humanizeAction(log.action)}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">Par {log.adminName ?? 'Système'} {log.adminRole ? `· ${log.adminRole}` : ''}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-neutral-400">
                      {log.ip && <span className="font-mono">IP {log.ip}</span>}
                      {log.targetModel && <span>Cible : {log.targetModel}</span>}
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

          {auditPages > 1 && (
            <Pagination page={page} pages={auditPages} onChange={setPage} />
          )}
        </section>
      )}
    </div>
  );
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 disabled:opacity-40">
        ‹
      </button>
      <span className="text-sm font-black text-neutral-600">Page {page} / {pages}</span>
      <button onClick={() => onChange(Math.min(pages, page + 1))} disabled={page === pages}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 disabled:opacity-40">
        ›
      </button>
    </div>
  );
}
