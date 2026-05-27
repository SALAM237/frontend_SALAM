export type TextSelectionTarget = HTMLInputElement | HTMLTextAreaElement;

export type StoredTextSelection =
  | {
      kind: 'plain';
      element: TextSelectionTarget;
      start: number;
      end: number;
    }
  | {
      kind: 'rich';
      element: HTMLElement;
      range: Range;
    };

export type InlineTextStylePatch = {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
};

export function captureTextSelection(target: EventTarget | null): StoredTextSelection | null {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    return { kind: 'plain', element: target, start, end };
  }

  if (target instanceof HTMLElement) {
    const root = target.closest<HTMLElement>('[data-rich-text-editor="true"]');
    const selection = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!root || !selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return null;
    return { kind: 'rich', element: root, range: range.cloneRange() };
  }

  return null;
}

function styleAttr(patch: InlineTextStylePatch) {
  const rules: string[] = [];
  if (patch.color) rules.push(`color:${patch.color}`);
  if (patch.fontSize) rules.push(`font-size:${patch.fontSize}px`);
  if (patch.fontFamily) rules.push(`font-family:${patch.fontFamily}`);
  return rules.length ? ` style="${rules.join(';')}"` : '';
}

export function applyInlineTextStyle(selection: StoredTextSelection | null, patch: InlineTextStylePatch) {
  if (!selection) return false;

  if (selection.kind === 'rich') {
    const { element, range } = selection;
    if (range.collapsed) return false;

    const browserSelection = typeof window !== 'undefined' ? window.getSelection() : null;
    browserSelection?.removeAllRanges();
    browserSelection?.addRange(range);

    let wrapper: HTMLElement | null = null;
    if (patch.bold) wrapper = document.createElement('strong');
    if (patch.italic) {
      const em = document.createElement('em');
      if (wrapper) {
        em.appendChild(wrapper);
      }
      wrapper = em;
    }
    if (patch.color || patch.fontSize || patch.fontFamily) {
      const span = document.createElement('span');
      if (patch.color) span.style.color = patch.color;
      if (patch.fontSize) span.style.fontSize = `${patch.fontSize}px`;
      if (patch.fontFamily) span.style.fontFamily = patch.fontFamily;
      if (wrapper) {
        span.appendChild(wrapper);
      }
      wrapper = span;
    }

    if (!wrapper) return false;

    const fragment = range.extractContents();
    let deepest = wrapper;
    while (deepest.firstElementChild) deepest = deepest.firstElementChild as HTMLElement;
    deepest.appendChild(fragment);
    range.insertNode(wrapper);

    element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'formatSetBlockTextDirection' }));
    element.focus();
    browserSelection?.removeAllRanges();
    return true;
  }

  if (selection.start === selection.end) return false;
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
  const html = String(value ?? '')
    .replace(/<div><br><\/div>/gi, '<br>')
    .replace(/<\/(div|p)>/gi, '<br>')
    .replace(/<(div|p)\b[^>]*>/gi, '');
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
