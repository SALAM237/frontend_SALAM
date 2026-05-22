import { sanitizeRichHtml } from '@/lib/rich-text';

export function RichText({ value, className }: { value?: unknown; className?: string }) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(String(value ?? '').replace(/\n/g, '<br />')) }}
    />
  );
}
