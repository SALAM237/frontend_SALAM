'use client';

import { useEffect } from 'react';

const ERROR_SELECTOR = '[role="alert"], [data-error-message="true"]';

function isScrollableError(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  if (element.closest('[data-sonner-toaster], [data-sonner-toast]')) return false;
  if (element.dataset.errorScrollHandled === 'true') return false;

  const style = window.getComputedStyle(element);
  return element.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden';
}

export function ErrorAutoScroller() {
  useEffect(() => {
    let frame = 0;

    const scrollToFirstError = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const target = Array.from(document.querySelectorAll(ERROR_SELECTOR)).find(isScrollableError);
        if (!target) return;

        target.dataset.errorScrollHandled = 'true';
        const rect = target.getBoundingClientRect();
        const visible = rect.top >= 16 && rect.bottom <= window.innerHeight - 16;

        if (!visible) {
          target.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }

        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    };

    const observer = new MutationObserver(records => {
      const changedErrors = records.flatMap(record => {
        const parentError = record.target instanceof Element
          ? record.target.closest(ERROR_SELECTOR)
          : record.target.parentElement?.closest(ERROR_SELECTOR);
        const addedErrors = Array.from(record.addedNodes).flatMap(node => {
          if (!(node instanceof Element)) return [];
          return [
            ...(node.matches(ERROR_SELECTOR) ? [node] : []),
            ...Array.from(node.querySelectorAll(ERROR_SELECTOR)),
          ];
        });
        return [...(parentError ? [parentError] : []), ...addedErrors];
      });

      if (!changedErrors.length) return;
      changedErrors.forEach(element => {
        if (element instanceof HTMLElement) delete element.dataset.errorScrollHandled;
      });
      scrollToFirstError();
    });

    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    scrollToFirstError();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}