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

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const next = sanitizeRichHtml(value ?? '').replace(/\n/g, '<br>');
    if (node.innerHTML !== next) node.innerHTML = next;
  }, [value]);

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
      onPaste={event => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
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

        ref.current?.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertLineBreak' }));
      }}
      className={`${className ?? ''} empty:before:pointer-events-none empty:before:text-neutral-300 empty:before:content-[attr(data-placeholder)]`}
      style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', ...style }}
    />
  );
}
