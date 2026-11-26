'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

// Debe coincidir con la duracion de modal-out en globals.css
const EXIT_MS = 180;

type IconTone = 'brand' | 'danger';

const iconTones: Record<IconTone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  danger: 'bg-accent-50 text-accent-600 ring-accent-100',
};

interface ModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** Icono del encabezado */
  icon?: ReactNode;
  iconTone?: IconTone;
  onClose: () => void;
  /** Impide cerrar con Escape, clic afuera o la X, por ejemplo mientras se envia */
  preventClose?: boolean;
  role?: 'dialog' | 'alertdialog';
  children: ReactNode;
}

/**
 * Dialogo modal sobre el elemento nativo <dialog>: el navegador ya resuelve
 * el foco atrapado, Escape, la capa de fondo y que el resto de la pagina quede inerte.
 * Al cerrar, mantiene el contenido mientras corre la animacion de salida; por eso
 * el padre debe conservar los datos que muestra hasta que el modal se vuelva a abrir.
 */
export function Modal({
  open,
  title,
  description,
  icon,
  iconTone = 'brand',
  onClose,
  preventClose = false,
  role = 'dialog',
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // closing: open ya es false pero el <dialog> sigue visible animando la salida.
  // Se ajusta durante el render al cambiar open, en lugar de en un efecto
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setClosing(!open);
  }

  // El <dialog> se abre con showModal(); open como atributo no lo haria modal
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (!dialog.open) return;
    const timer = setTimeout(() => {
      dialog.close();
      setClosing(false);
    }, EXIT_MS);
    // Si se vuelve a abrir antes de terminar la salida, no se cierra
    return () => clearTimeout(timer);
  }, [open]);

  const requestClose = () => {
    if (!preventClose && open) onClose();
  };

  return (
    <dialog
      ref={ref}
      role={role}
      data-state={open ? 'open' : 'closed'}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape dispara cancel: se cancela el cierre nativo y decide el padre
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      // Solo el fondo es el propio <dialog>; el contenido esta en el div interior
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-visible rounded-2xl bg-white p-0 text-slate-900 shadow-2xl ring-1 ring-slate-900/5 backdrop:bg-brand-950/50 backdrop:backdrop-blur-sm"
    >
      {(open || closing) && (
        <div className="p-6">
          <div className="flex items-start gap-4">
            {icon && (
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full ring-4 [&_svg]:size-5 ${iconTones[iconTone]}`}
              >
                {icon}
              </span>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
              {description && (
                <div id={descriptionId} className="mt-1 text-sm text-slate-600">
                  {description}
                </div>
              )}
            </div>
            <Tooltip label="Cerrar" align="end">
              <Button
                variant="ghost"
                size="icon"
                onClick={requestClose}
                disabled={preventClose}
                aria-label="Cerrar"
                className="-mt-1 -mr-2"
              >
                <X />
              </Button>
            </Tooltip>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}
