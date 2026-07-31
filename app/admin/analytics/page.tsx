'use client';

import { useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Activity, Eye, Laptop, Monitor, Smartphone, Tablet, Users } from 'lucide-react';
import { useAnalyticsOverview, useAnalyticsActivity, type AnalyticsActivityRow } from '@/lib/api/analytics';
import { ListToolbar } from '@/components/shared/ListToolbar';
import { formatPageUrl } from '@/lib/format-url';

const CATEGORY_COLORS = ['#059669', '#2563eb', '#f59e0b', '#7c3aed', '#dc2626', '#0f766e', '#64748b'];

const EVENT_TYPES = [
  { value: 'all',       label: 'Tous les événements' },
  { value: 'page_view', label: 'Pages visitées' },
  { value: 'login',     label: 'Connexions' },
  { value: 'logout',    label: 'Déconnexions' },
];

function DeviceIcon({ type }: { type?: string }) {
  if (type === 'mobile') return <Smartphone size={13} />;
  if (type === 'tablet') return <Tablet size={13} />;
  if (type === 'desktop') return <Monitor size={13} />;
  return <Laptop size={13} />;
}

function StatTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Icon size={14} /></span>
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-neutral-900">{value.toLocaleString('fr-FR')}</p>
    </div>
  );
}

function RankRow({ label, value, max, color }: { label: string; value: number; max: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate font-black text-neutral-800">{label}</span>
        <span className="shrink-0 font-semibold text-neutral-500">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full" style={{ width: `${Math.max(6, (value / max) * 100)}%`, background: color ?? '#059669' }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const overview = useAnalyticsOverview(days);
  const data = overview.data?.data;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('all');
  const activity = useAnalyticsActivity({ page, limit: pageSize, search, eventType });
  const logs = activity.data?.data?.logs ?? [];
  const total = activity.data?.data?.total ?? 0;

  const topPages = data?.topPages ?? [];
  const maxPage = Math.max(1, ...topPages.map(p => p.count));
  const byBrowser = data?.byBrowser ?? [];
  const maxBrowser = Math.max(1, ...byBrowser.map(b => b.count));
  const byDevice = data?.byDevice ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Analytics</h1>
          <p className="mt-1 text-sm text-neutral-500">Activité de la plateforme — pages visitées, appareils, tendance.</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
        >
          <option value={7}>7 derniers jours</option>
          <option value={30}>30 derniers jours</option>
          <option value={90}>90 derniers jours</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={Eye} label="Événements" value={data?.totals.events ?? 0} />
        <StatTile icon={Activity} label="Sessions" value={data?.totals.sessions ?? 0} />
        <StatTile icon={Users} label="Utilisateurs" value={data?.totals.users ?? 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-neutral-200/70 bg-white p-5 shadow-sm lg:col-span-2">
          <p className="mb-4 text-sm font-black text-neutral-900">Tendance ({days} jours)</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend ?? []} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="analyticsTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis width={32} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#059669" fill="url(#analyticsTrend)" strokeWidth={2} name="Événements" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200/70 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-black text-neutral-900">Appareils</p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byDevice} dataKey="count" nameKey="type" innerRadius={44} outerRadius={68} paddingAngle={4}>
                  {byDevice.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {byDevice.length === 0 && <p className="text-xs font-semibold text-neutral-400">Aucune donnée.</p>}
            {byDevice.map((d, i) => (
              <div key={d.type} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-semibold capitalize text-neutral-600">
                  <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <DeviceIcon type={d.type} /> {d.type}
                </span>
                <b className="text-neutral-900">{d.count}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-200/70 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-black text-neutral-900">Pages les plus visitées</p>
          {topPages.length === 0 && <p className="text-xs font-semibold text-neutral-400">Aucune donnée.</p>}
          <div className="space-y-3">
            {topPages.map(p => <RankRow key={p.path} label={formatPageUrl(p.path)} value={p.count} max={maxPage} />)}
          </div>
        </section>
        <section className="rounded-xl border border-neutral-200/70 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-black text-neutral-900">Navigateurs</p>
          {byBrowser.length === 0 && <p className="text-xs font-semibold text-neutral-400">Aucune donnée.</p>}
          <div className="space-y-3">
            {byBrowser.map((b, i) => <RankRow key={b.browser} label={b.browser} value={b.count} max={maxBrowser} color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-neutral-200/70 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-black text-neutral-900">Journal d'activité</p>
        <ListToolbar
          search={search}
          onSearchChange={v => { setSearch(v); setPage(1); }}
          pageSize={pageSize}
          onPageSizeChange={v => { setPageSize(v); setPage(1); }}
          placeholder="Rechercher par page, utilisateur..."
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
        <p className="mb-2 text-xs font-semibold text-neutral-400">{activity.isLoading ? '…' : `${total} événement(s)`}</p>
        <div className="divide-y divide-neutral-50">
          {activity.isLoading && <p className="py-6 text-center text-sm text-neutral-400">Chargement…</p>}
          {!activity.isLoading && logs.length === 0 && <p className="py-6 text-center text-sm text-neutral-400">Aucune activité.</p>}
          {logs.map((log: AnalyticsActivityRow) => (
            <div key={log._id} className="flex items-center gap-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"><DeviceIcon type={log.device?.type} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-neutral-900">{log.path ? formatPageUrl(log.path) : log.eventType}</p>
                <p className="truncate text-[11px] text-neutral-400">{log.userName ?? 'Utilisateur'} · {log.device?.browser ?? '—'}</p>
              </div>
              <p className="shrink-0 text-[11px] font-semibold text-neutral-400">{new Date(log.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
