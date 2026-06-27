/**
 * Badge "Pli de page" affiché en haut à droite d'une carte pour signaler un élément non lu.
 * Le parent doit avoir `position: relative` (et idéalement `overflow: hidden`).
 */
export function UnreadCorner({ label = 'Non lue' }: { label?: string }) {
  return (
    <span
      aria-label={label}
      className="pointer-events-none absolute right-0 top-0 z-10"
      style={{
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: '0 48px 48px 0',
        borderColor: 'transparent #ef4444 transparent transparent',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute select-none whitespace-nowrap text-[7px] font-black uppercase leading-none tracking-wide text-white"
        style={{
          top: 6,
          left: -42,
          transform: 'rotate(45deg)',
          transformOrigin: 'left top',
        }}
      >
        {label}
      </span>
    </span>
  );
}
