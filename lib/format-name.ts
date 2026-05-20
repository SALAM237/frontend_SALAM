const NAME_LOCALE = 'fr-FR';

function formatNamePart(value?: string | null) {
  const clean = (value ?? '').trim();
  if (!clean) return '';

  return clean
    .toLocaleLowerCase(NAME_LOCALE)
    .split(/([\s'-]+)/)
    .map(part => {
      if (!part || /^[\s'-]+$/.test(part)) return part;
      return part.charAt(0).toLocaleUpperCase(NAME_LOCALE) + part.slice(1);
    })
    .join('');
}

export function formatFirstName(value?: string | null) {
  return formatNamePart(value);
}

export function formatLastName(value?: string | null) {
  return (value ?? '').trim().toLocaleUpperCase(NAME_LOCALE);
}

export function formatFullName(firstName?: string | null, lastName?: string | null) {
  return [formatFirstName(firstName), formatLastName(lastName)].filter(Boolean).join(' ');
}

export function formatShortName(firstName?: string | null, lastName?: string | null) {
  const first = formatFirstName(firstName);
  const lastInitial = formatLastName(lastName).charAt(0);
  return [first, lastInitial ? `${lastInitial}.` : ''].filter(Boolean).join(' ');
}

export function formatInitials(firstName?: string | null, lastName?: string | null, fallback = '') {
  const firstInitial = formatFirstName(firstName).charAt(0);
  const lastInitial = formatLastName(lastName).charAt(0);
  return `${firstInitial}${lastInitial}`.toLocaleUpperCase(NAME_LOCALE) || fallback;
}
