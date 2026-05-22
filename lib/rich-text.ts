export type TextSelectionTarget = HTMLInputElement | HTMLTextAreaElement;

export type StoredTextSelection = {
  element: TextSelectionTarget;
  start: number;
  end: number;
};

export type InlineTextStylePatch = {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
};

export function captureTextSelection(target: EventTarget | null): StoredTextSelection | null {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return null;
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? 0;
  return { element: target, start, end };
}

function styleAttr(patch: InlineTextStylePatch) {
  const rules: string[] = [];
  if (patch.color) rules.push(`color:${patch.color}`);
  if (patch.fontSize) rules.push(`font-size:${patch.fontSize}px`);
  if (patch.fontFamily) rules.push(`font-family:${patch.fontFamily}`);
  return rules.length ? ` style="${rules.join(';')}"` : '';
}

export function applyInlineTextStyle(selection: StoredTextSelection | null, patch: InlineTextStylePatch) {
  if (!selection || selection.start === selection.end) return false;
  const { element, start, end } = selection;
  const current = element.value;
  const selected = current.slice(start, end);
  let next = selected;

  if (patch.bold) next = `<strong>${next}</strong>`;
  if (patch.italic) next = `<em>${next}</em>`;
  const styled = styleAttr(patch);
  if (styled) next = `<span${styled}>${next}</span>`;

  element.setRangeText(next, start, end, 'select');
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.focus();
  return true;
}

export function sanitizeRichHtml(value: unknown) {
  const html = String(value ?? '');
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/<(?!\/?(strong|em|span|br)\b)[^>]*>/gi, '')
    .replace(/style="([^"]*)"/gi, (_match, styles) => {
      const allowed = String(styles)
        .split(';')
        .map((rule: string) => rule.trim())
        .filter((rule: string) => /^(color|font-size|font-family)\s*:/i.test(rule))
        .join(';');
      return allowed ? `style="${allowed}"` : '';
    });
}

export function richTextPlain(value: unknown) {
  return String(value ?? '').replace(/<[^>]+>/g, '');
}
