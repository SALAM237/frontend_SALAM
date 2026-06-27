/**
 * Ruban "pli de coin" en haut à droite d'une carte non lue.
 * Le parent doit avoir `position: relative` (overflow:hidden non requis — clipping interne).
 */
export function UnreadCorner({ label = 'Non lue' }: { label?: string }) {
  return (
    <div
      aria-label={label}
      className="pointer-events-none absolute right-0 top-0 z-10 size-14 overflow-hidden"
    >
      <p
        aria-hidden="true"
        className="absolute -right-[18px] top-[11px] w-[80px] rotate-45 bg-red-500 py-[3.5px] text-center text-[7px] font-black uppercase tracking-[0.1em] text-white shadow-sm"
      >
        {label}
      </p>
    </div>
  );
}
