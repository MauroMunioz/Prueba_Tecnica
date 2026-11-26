'use client';

import { useEffect, type ReactNode } from 'react';

export type NoticeTone = 'success' | 'warning' | 'error';

const tones: Record<NoticeTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-800',
};

interface NoticeProps {
  tone: NoticeTone;
  children: ReactNode;
  onDismiss?: () => void;
  /** Se cierra solo pasado este tiempo; los avisos importantes no lo usan */
  autoHideMs?: number;
}

export function Notice({ tone, children, onDismiss, autoHideMs }: NoticeProps) {
  useEffect(() => {
    if (!autoHideMs || !onDismiss) return;
    const timer = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(timer);
  }, [autoHideMs, onDismiss]);

  return (
    <div
      role={tone === 'success' ? 'status' : 'alert'}
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}
    >
      <div>{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          className="-m-1 rounded p-1 opacity-70 hover:opacity-100 focus-visible:outline-2"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
