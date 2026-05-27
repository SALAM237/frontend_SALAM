'use client';

import { useEffect, useRef } from 'react';
import { sanitizeRichHtml } from '@/lib/rich-text';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
};

export function RichTextEditor({
  value,
  onChange,
  className,
  style,
  placeholder,
  multiline = true,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  const emitInput = () => {
    const node = ref.current;
    if (!node) return;
    const html = sanitizeRichHtml(node.innerHTML);
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new CustomEvent('rich-text-change', {
      bubbles: true,
      detail: html,
    }));
  };

  const insertPlainText = (text: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const lines = multiline ? text.replace(/\r\n?/g, '\n').split('\n') : [text.replace(/\s+/g, ' ')];
    const fragment = document.createDocumentFragment();
    lines.forEach((line, index) => {
      if (index > 0) fragment.appendChild(document.createElement('br'));
      fragment.appendChild(document.createTextNode(line));
    });

    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.setEndAfter(lastNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    emitInput();
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const next = sanitizeRichHtml(value ?? '').replace(/\n/g, '<br>');
    if (node.innerHTML === next) return;
    if (document.activeElement === node) return;
    node.innerHTML = next;
  }, [value]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const sync = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : undefined;
      onChange(sanitizeRichHtml(typeof detail === 'string' ? detail : node.innerHTML));
    };
    node.addEventListener('rich-text-change', sync);
    return () => node.removeEventListener('rich-text-change', sync);
  }, [onChange]);

  const handleInput = () => {
    const node = ref.current;
    if (!node) return;
    onChange(sanitizeRichHtml(node.innerHTML));
  };

  return (
    <div
      ref={ref}
      data-rich-text-editor="true"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      data-placeholder={placeholder}
      onInput={handleInput}
      onBlur={handleInput}
      onPaste={event => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        insertPlainText(text);
      }}
      onKeyDown={event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (!multiline) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const br = document.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.setEndAfter(br);
        selection.removeAllRanges();
        selection.addRange(range);

        emitInput();
      }}
      className={`${className ?? ''} empty:before:pointer-events-none empty:before:text-neutral-300 empty:before:content-[attr(data-placeholder)]`}
      style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', ...style }}
    />
  );
}
