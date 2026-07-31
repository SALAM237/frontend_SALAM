'use client';

import { useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CalendarRange, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { formatFcfa, useTreasuryChart, type TreasuryChartFilter, type TreasuryChartGranularity } from '@/lib/api/treasury';

type ChartPoint = { label: string; income: number; expense: number };

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 12 }).map((_, i) => CURRENT_YEAR - i);

function monthInputToIso(value: string, boundary: 'start' | 'end') {
  const [y, m] = value.split('-').map(Number);
  if (!y || !m) return null;
  const d = boundary === 'start' ? new Date(y, m - 1, 1) : new Date(y, m, 0);
  return d.toISOString().slice(0, 10);
}

function yearInputToIso(value: string, boundary: 'start' | 'end') {
  const y = Number(value);
  if (!y) return null;
  const d = boundary === 'start' ? new Date(y, 0, 1) : new Date(y, 11, 31);
  return d.toISOString().slice(0, 10);
}

export function TreasuryEvolutionChart({ admin, defaultChart, loading = false, gradientId }: {
  admin: boolean;
  defaultChart: ChartPoint[];
  loading?: boolean;
  gradientId: string;
}) {
  const [open, setOpen] = useState(false);
  const [granularity, setGranularity] = useState<TreasuryChartGranularity>('month');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [fromYear, setFromYear] = useState(String(CURRENT_YEAR - 1));
  const [toYear, setToYear] = useState(String(CURRENT_YEAR));
  const [filter, setFilter] = useState<TreasuryChartFilter | null>(null);

  const chartQuery = useTreasuryChart(admin, filter);
  const chart = filter ? (chartQuery.data?.data?.chart ?? []) : defaultChart;
  const isBusy = filter ? chartQuery.isLoading : loading;

  const applyFilter = () => {
    const from = granularity === 'month' ? monthInputToIso(fromMonth, 'start') : yearInputToIso(fromYear, 'start');
    const to = granularity === 'month' ? monthInputToIso(toMonth, 'end') : yearInputToIso(toYear, 'end');
    if (!from || !to) {
      toast.error('Renseignez une periode de debut et de fin.');
      return;
    }
    if (from > to) {
      toast.error('La date de debut doit preceder la date de fin.');
      return;
    }
    setFilter({ granularity, from, to });
    setOpen(false);
  };

  const resetFilter = () => {
    setFilter(null);
    setFromMonth('');
    setToMonth('');
    setFromYear(String(CURRENT_YEAR - 1));
    setToYear(String(CURRENT_YEAR));
    setOpen(false);
  };

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-neutral-900">Evolution encaissements & depenses</p>
          {filter && (
            <p className="mt-0.5 text-xs font-semibold text-emerald-600">
              Periode personnalisee · {filter.granularity === 'month' ? 'par mois' : 'par annee'}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {filter && (
            <button
              onClick={resetFilter}
              title="Revenir aux 6 derniers mois"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-red-200 hover:text-red-600"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-black transition ${
              open || filter
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-neutral-200 text-neutral-600 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            <CalendarRange size={13} /> Periode
          </button>
        </div>
      </div>

      {open && (
        <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
          <div className="flex flex-wrap gap-1.5">
            {(['month', 'year'] as TreasuryChartGranularity[]).map(g => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`h-8 rounded-lg px-3 text-[11px] font-black transition ${
                  granularity === g ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-500 border border-neutral-200'
                }`}
              >
                {g === 'month' ? 'Par mois' : 'Par annee'}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            {granularity === 'month' ? (
              <>
                <label className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">De</span>
                  <input type="month" value={fromMonth} onChange={e => setFromMonth(e.target.value)} className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">A</span>
                  <input type="month" value={toMonth} onChange={e => setToMonth(e.target.value)} className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
                </label>
              </>
            ) : (
              <>
                <label className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">De</span>
                  <select value={fromYear} onChange={e => setFromYear(e.target.value)} className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10">
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">A</span>
                  <select value={toYear} onChange={e => setToYear(e.target.value)} className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10">
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
              </>
            )}
            <button onClick={applyFilter} className="h-9 rounded-lg bg-emerald-600 px-3 text-[11px] font-black text-white transition hover:bg-emerald-700">
              Appliquer
            </button>
            {filter && (
              <button onClick={resetFilter} className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-[11px] font-black text-neutral-600 transition hover:border-red-200 hover:text-red-600">
                Reinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative h-[300px]">
        {isBusy && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
            <Loader2 size={20} className="animate-spin text-emerald-600" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart}>
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
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(Number(v) / 1000)}k`} />
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
    </div>
  );
}
