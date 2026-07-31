import { formatFcfa } from '@/lib/api/treasury';

export function RecoveryRateBlock({ label, rate, pending }: { label: string; rate: number; pending?: number }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-100 text-center">
      <div className="flex flex-1 items-center justify-center bg-emerald-500/10 px-2 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700">{label}</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white px-2 py-4">
        <p className="text-3xl font-black tracking-[-0.04em] text-emerald-700">
          {rate}<span className="text-base">%</span>
        </p>
      </div>
      <div className="bg-neutral-50/70 px-2 py-2">
        <p className="text-[10px] font-semibold text-neutral-400">
          {pending !== undefined ? `${formatFcfa(pending)} en attente` : '—'}
        </p>
      </div>
    </div>
  );
}
