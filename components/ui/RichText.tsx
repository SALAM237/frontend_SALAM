import { sanitizeRichHtml } from '@/lib/rich-text';

function normalizeBlockHtml(value: unknown) {
  const raw = String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<p\b[^>]*>/gi, '')
    .replace(/<div\b[^>]*>/gi, '');

  const paragraphs = raw
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean);

  if (!paragraphs.length) return '';

  return paragraphs
    .map(part => `<p>${sanitizeRichHtml(part.replace(/\n/g, '<br />'))}</p>`)
    .join('');
}

export function RichText({
  value,
  className,
  block,
}: {
  value?: unknown;
  className?: string;
  block?: boolean;
}) {
  const html = block
    ? normalizeBlockHtml(value)
    : sanitizeRichHtml(String(value ?? '').replace(/\r\n?/g, '\n').replace(/\n/g, '<br />'));
  const classes = [
    'break-words',
    block ? '[&_p]:mb-4 [&_p:last-child]:mb-0' : 'whitespace-pre-line',
    className,
  ].filter(Boolean).join(' ');

  if (block) {
    return (
      <div
        className={classes}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={classes}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}