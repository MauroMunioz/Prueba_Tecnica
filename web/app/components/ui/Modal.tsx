'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  onClose: () => void;
  /** Impide cerrar con Escape o clic afuera, por ejemplo mientras se envia */
  preventClose?: boolean;
  role?: 'dialog' | 'alertdialog';
  children: ReactNode;
}

/**
 * Dialogo modal sobre el elemento nativo <dialog>: el navegador ya resuelve
 * el foco atrapado, Escape, la capa de fondo y que el resto de la pagina quede inerte.
 */
export function Modal({
  open,
  title,
  description,
  onClose,
  preventClose = false,
  role = 'dialog',
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // El <dialog> se abre con showModal(); open como atributo no lo haria modal
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape dispara cancel: se cancela el cierre nativo y decide el padre
      onCancel={(event) => {
        event.preventDefault();
        if (!preventClose) onClose();
      }}
      // Solo el fondo es el propio <dialog>; el contenido esta en el div interior
      onClick={(event) => {
        if (event.target === event.currentTarget && !preventClose) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="p-6">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          {description && (
            <div id={descriptionId} className="mt-1 text-sm text-slate-600">
              {description}
            </div>
          )}
          <div className="mt-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
