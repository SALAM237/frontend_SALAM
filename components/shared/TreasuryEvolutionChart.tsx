'use client';

import { useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CalendarRange, Loader2, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  formatFcfa, useTreasuryChart,
  type TreasuryChartFilter, type TreasuryChartGranularity, type TreasurySource,
} from '@/lib/api/treasury';

type ChartPoint = { label: string; income: number; expense: number };
type SourcePoint = { source: TreasurySource; amount: number };

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2010;
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }).map((_, i) => CURRENT_YEAR - i);
const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const selectCls = 'h-7 w-full rounded-lg border border-neutral-200 bg-white px-0.5 text-[8px] font-semibold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:w-32 sm:rounded-xl sm:px-2.5 sm:text-xs';
const yearSelectCls = 'h-7 w-16 shrink-0 rounded-lg border border-neutral-200 bg-white px-0.5 text-[8px] font-semibold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 sm:h-9 sm:w-24 sm:rounded-xl sm:px-2.5 sm:text-xs';
const monthNativeCls = 'h-7 w-full rounded-lg border border-neutral-200 bg-white px-1.5 text-[10px] font-semibold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10';
const labelCls = 'text-[9px] font-black uppercase tracking-[0.08em] text-neutral-500 sm:text-[10px]';

function toMonthInputValue(monthIdx: string, year: string) {
  return `${year}-${String(Number(monthIdx) + 1).padStart(2, '0')}`;
}

function parseIsoDateLocal(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatRangeLabel(filter: TreasuryChartFilter) {
  const from = parseIsoDateLocal(filter.from);
  const to = parseIsoDateLocal(filter.to);
  if (filter.granularity === 'year') {
    return from.getFullYear() === to.getFullYear() ? `${from.getFullYear()}` : `${from.getFullYear()} - ${to.getFullYear()}`;
  }
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return fmt(from) === fmt(to) ? fmt(from) : `${fmt(from)} - ${fmt(to)}`;
}

export function TreasuryEvolutionSection({ admin, defaultChart, defaultSources, loading = false, gradientId, sourceLabels, sourceColors }: {
  admin: boolean;
  defaultChart: ChartPoint[];
  defaultSources: SourcePoint[];
  loading?: boolean;
  gradientId: string;
  sourceLabels: Record<TreasurySource, string>;
  sourceColors: string[];
}) {
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [open, setOpen] = useState(false);
  const [granularity, setGranularity] = useState<TreasuryChartGranularity>('month');
  const [mFromMonth, setMFromMonth] = useState(String(now.getMonth()));
  const [mFromYear, setMFromYear] = useState(String(now.getFullYear()));
  const [mToMonth, setMToMonth] = useState(String(now.getMonth()));
  const [mToYear, setMToYear] = useState(String(now.getFullYear()));
  const [yFrom, setYFrom] = useState(String(CURRENT_YEAR - 1));
  const [yTo, setYTo] = useState(String(CURRENT_YEAR));
  const [filter, setFilter] = useState<TreasuryChartFilter | null>(null);

  const chartQuery = useTreasuryChart(admin, filter);
  const chart = filter ? (chartQuery.data?.data?.chart ?? []) : defaultChart;
  const sources = filter ? (chartQuery.data?.data?.sources ?? []) : defaultSources;
  const isBusy = filter ? chartQuery.isLoading : loading;

  const applyFilter = () => {
    let from: string;
    let to: string;
    if (granularity === 'month') {
      from = new Date(Number(mFromYear), Number(mFromMonth), 1).toISOString().slice(0, 10);
      to = new Date(Number(mToYear), Number(mToMonth) + 1, 0).toISOString().slice(0, 10);
    } else {
      from = new Date(Number(yFrom), 0, 1).toISOString().slice(0, 10);
      to = new Date(Number(yTo), 11, 31).toISOString().slice(0, 10);
    }
    if (from > to) {
      toast.error('La periode de debut doit preceder la periode de fin.');
      return;
    }
    setFilter({ granularity, from, to });
    setOpen(false);
  };

  const resetFilter = () => {
    setFilter(null);
    setOpen(false);
  };

  const applyNativeMonthValue = (value: string, setYear: (v: string) => void, setMonth: (v: string) => void) => {
    const [y, m] = value.split('-');
    if (!y || !m) return;
    setYear(y);
    setMonth(String(Number(m) - 1));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-black text-neutral-900">Evolution encaissements & depenses</p>
            {filter && (
              <>
                <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                  Periode personnalisee - {filter.granularity === 'month' ? 'par mois' : 'par annee'}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-neutral-500">{formatRangeLabel(filter)}</p>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {filter && (
              <button
                onClick={resetFilter}
                title="Revenir aux 6 derniers mois"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-red-200 hover:text-red-600 sm:h-8 sm:w-8"
              >
                <RotateCcw size={12} />
              </button>
            )}
            <button
              onClick={() => setOpen(o => !o)}
              className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-black transition sm:h-8 sm:px-2.5 sm:text-[11px] ${
                open || filter
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-neutral-200 text-neutral-600 hover:border-emerald-200 hover:text-emerald-700'
              }`}
            >
              <CalendarRange size={12} /> Periode
            </button>
          </div>
        </div>

        {open && (
          <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-2.5 sm:p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.08em] text-neutral-500 sm:text-[11px]">Choisir une periode</p>
              <button
                onClick={() => setOpen(false)}
                title="Fermer"
                className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-200/70 hover:text-neutral-600"
              >
                <X size={13} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['month', 'year'] as TreasuryChartGranularity[]).map(g => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`h-7 rounded-lg px-2.5 text-[10px] font-black transition sm:h-8 sm:px-3 sm:text-[11px] ${
                    granularity === g ? 'bg-emerald-600 text-white' : 'border border-neutral-200 bg-white text-neutral-500'
                  }`}
                >
                  {g === 'month' ? 'Par mois' : 'Par année'}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end sm:gap-3">
              {granularity === 'month' ? (
                <>
                  <div className="min-w-0 space-y-1">
                    <span className={labelCls}>De</span>
                    <input
                      type="month"
                      value={toMonthInputValue(mFromMonth, mFromYear)}
                      min={`${MIN_YEAR}-01`}
                      max={currentMonthValue}
                      onChange={e => applyNativeMonthValue(e.target.value, setMFromYear, setMFromMonth)}
                      className={`${monthNativeCls} sm:hidden`}
                    />
                    <div className="hidden min-w-0 gap-1 sm:flex">
                      <select value={mFromMonth} onChange={e => setMFromMonth(e.target.value)} className={`${selectCls} min-w-0 flex-1`}>
                        {MONTH_LABELS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                      </select>
                      <select value={mFromYear} onChange={e => setMFromYear(e.target.value)} className={yearSelectCls}>
                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <span className={labelCls}>À</span>
                    <input
                      type="month"
                      value={toMonthInputValue(mToMonth, mToYear)}
                      min={`${MIN_YEAR}-01`}
                      max={currentMonthValue}
                      onChange={e => applyNativeMonthValue(e.target.value, setMToYear, setMToMonth)}
                      className={`${monthNativeCls} sm:hidden`}
                    />
                    <div className="hidden min-w-0 gap-1 sm:flex">
                      <select value={mToMonth} onChange={e => setMToMonth(e.target.value)} className={`${selectCls} min-w-0 flex-1`}>
                        {MONTH_LABELS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                      </select>
                      <select value={mToYear} onChange={e => setMToYear(e.target.value)} className={yearSelectCls}>
                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-0 space-y-1">
                    <span className={labelCls}>De</span>
                    <select value={yFrom} onChange={e => setYFrom(e.target.value)} className={selectCls}>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <span className={labelCls}>À</span>
                    <select value={yTo} onChange={e => setYTo(e.target.value)} className={selectCls}>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </>
              )}
              <button onClick={applyFilter} className="col-span-2 h-8 rounded-lg bg-emerald-600 px-3 text-[11px] font-black text-white transition hover:bg-emerald-700 sm:col-auto sm:h-9">
                Appliquer
              </button>
              {filter && (
                <button onClick={resetFilter} className="col-span-2 h-8 rounded-lg border border-neutral-200 bg-white px-3 text-[11px] font-black text-neutral-600 transition hover:border-red-200 hover:text-red-600 sm:col-auto sm:h-9">
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}

        <div className="relative h-[260px] sm:h-[300px]">
          {isBusy && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
              <Loader2 size={20} className="animate-spin text-emerald-600" />
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`${gradientId}Income`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`${gradientId}Expense`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis width={42} tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`} />
              <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
              <Area type="monotone" dataKey="income" stroke="#059669" fill={`url(#${gradientId}Income)`} strokeWidth={2} name="Encaissements" />
              <Area type="monotone" dataKey="expense" stroke="#dc2626" fill={`url(#${gradientId}Expense)`} strokeWidth={2} name="Depenses" />
            </AreaChart>
          </ResponsiveContainer>
          {!isBusy && chart.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs font-semibold text-neutral-400">Aucune donnee sur cette periode.</p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <p className="text-sm font-black text-neutral-900">Sources financieres</p>
          {filter && (
            <>
              <p className="mt-0.5 text-xs font-semibold text-emerald-600">Periode personnalisee</p>
              <p className="mt-0.5 text-xs font-semibold text-neutral-500">{formatRangeLabel(filter)}</p>
            </>
          )}
        </div>
        <div className="relative h-[210px]">
          {isBusy && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
              <Loader2 size={18} className="animate-spin text-emerald-600" />
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sources} dataKey="amount" nameKey="source" innerRadius={56} outerRadius={84} paddingAngle={4}>
                {sources.map((_, i) => <Cell key={i} fill={sourceColors[i % sourceColors.length]} />)}
              </Pie>
              <Tooltip formatter={v => formatFcfa(Number(v ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 space-y-2">
          {!isBusy && sources.length === 0 && <p className="text-xs font-semibold text-neutral-400">Aucune source renseignee sur cette periode.</p>}
          {sources.map((source, i) => (
            <div key={source.source} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2 font-semibold text-neutral-500">
                <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: sourceColors[i % sourceColors.length] }} />
                <span className="truncate">{sourceLabels[source.source]}</span>
              </span>
              <b className="shrink-0 text-neutral-900">{formatFcfa(source.amount)}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
