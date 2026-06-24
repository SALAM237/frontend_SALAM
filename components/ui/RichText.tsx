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
  const classes = ['whitespace-pre-line break-words', className].filter(Boolean).join(' ');

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
