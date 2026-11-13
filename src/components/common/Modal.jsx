import { useEffect, useRef } from 'react';
import { CloseIcon } from './Icons';

/** Accessible dialog: focus moves in, Tab is trapped, Escape and backdrop click close it. */
export default function Modal({ title, onClose, initialFocus, children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement;
    const panel = panelRef.current;
    (initialFocus ? panel.querySelector(initialFocus) : null)?.focus?.() ?? panel.querySelector('button')?.focus();
    if (initialFocus && !panel.contains(document.activeElement)) panel.querySelector('button')?.focus();
    document.body.style.overflow = 'hidden';

    const onKey = (event) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key !== 'Tab') return;
      const focusable = panel.querySelectorAll('button:not([disabled]), a[href], input, textarea, select, iframe, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [initialFocus]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onMouseDown={(e) => e.target === e.currentTarget && closeRef.current()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={title} className="modal-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close dialog"><CloseIcon /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
