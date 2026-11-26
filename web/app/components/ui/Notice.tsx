'use client';

import { CircleAlert, CircleCheck, TriangleAlert, X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export type NoticeTone = 'success' | 'warning' | 'error';

const tones: Record<NoticeTone, { box: string; icon: ReactNode }> = {
  success: {
    box: 'border-l-emerald-500 [&_.notice-icon]:text-emerald-600',
    icon: <CircleCheck />,
  },
  warning: {
    box: 'border-l-amber-500 [&_.notice-icon]:text-amber-600',
    icon: <TriangleAlert />,
  },
  error: {
    box: 'border-l-accent-500 [&_.notice-icon]:text-accent-600',
    icon: <CircleAlert />,
  },
};

interface NoticeProps {
  tone: NoticeTone;
  children: ReactNode;
  onDismiss?: () => void;
  /** Se cierra solo pasado este tiempo; los avisos importantes no lo usan */
  autoHideMs?: number;
}

/** Aviso flotante en la esquina superior derecha */
export function Notice({ tone, children, onDismiss, autoHideMs }: NoticeProps) {
  useEffect(() => {
    if (!autoHideMs || !onDismiss) return;
    const timer = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(timer);
  }, [autoHideMs, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-4 top-20 z-50 flex justify-end sm:left-auto sm:w-96">
      <div
        role={tone === 'success' ? 'status' : 'alert'}
        className={`animate-toast-in pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-l-4 border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg ${tones[tone].box}`}
      >
        <span className="notice-icon mt-0.5 shrink-0 [&_svg]:size-5">{tones[tone].icon}</span>
        <div className="min-w-0 flex-1">{children}</div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar aviso"
            className="-m-1 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
