import type { ReactNode } from 'react';

// Sin 'use client': se resuelve solo con CSS (hover y foco de teclado)

type Side = 'top' | 'bottom';
type Align = 'center' | 'start' | 'end';

const sides: Record<Side, string> = {
  top: 'bottom-full mb-2 origin-bottom',
  bottom: 'top-full mt-2 origin-top',
};

const aligns: Record<Align, string> = {
  center: 'left-1/2 -translate-x-1/2',
  start: 'left-0',
  end: 'right-0',
};

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: Side;
  /** end evita que se corte junto al borde derecho de un contenedor */
  align?: Align;
}

/**
 * Etiqueta flotante para hover y foco con teclado (no con clic, para que no
 * quede pegada). Es aria-hidden: el elemento envuelto debe tener su propio
 * nombre accesible, por ejemplo aria-label en un boton de solo icono.
 */
export function Tooltip({ label, children, side = 'top', align = 'center' }: TooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute z-40 scale-95 rounded-md bg-brand-950 px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition duration-150 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 group-hover/tooltip:delay-300 group-has-[:focus-visible]/tooltip:scale-100 group-has-[:focus-visible]/tooltip:opacity-100 ${sides[side]} ${aligns[align]}`}
      >
        {label}
      </span>
    </span>
  );
}
