import { sanitizeRichHtml } from '@/lib/rich-text';

export function RichText({
  value,
  className,
  block,
}: {
  value?: unknown;
  className?: string;
  block?: boolean;
}) {
  const html = sanitizeRichHtml(String(value ?? '').replace(/\n/g, '<br />'));

  if (block) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      />
    );
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
    />
  );
}
