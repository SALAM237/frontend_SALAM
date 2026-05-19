'use client';

export function GenderIcon({
  gender,
  size = 14,
  className = '',
}: {
  gender?: string;
  size?: number;
  className?: string;
}) {
  if (!gender) return null;

  if (gender === 'homme') {
    return (
      <svg
        width={size} height={size}
        viewBox="0 0 24 24" fill="currentColor"
        aria-label="Homme"
        className={`shrink-0 text-blue-500 ${className}`}
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M6 20v-2a6 6 0 0112 0v2H6z" />
      </svg>
    );
  }

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="currentColor"
      aria-label="Femme"
      className={`shrink-0 text-pink-500 ${className}`}
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M12 13c-3 0-5.5 1.3-7 3.3V21h14v-4.7C17.5 14.3 15 13 12 13z" />
    </svg>
  );
}
