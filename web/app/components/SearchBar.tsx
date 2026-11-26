'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Tooltip } from './ui/Tooltip';

interface SearchBarProps {
  /** Recibe el texto ya recortado, 300 ms despues de la ultima tecla */
  onSearch: (query: string) => void;
  delayMs?: number;
}

export function SearchBar({ onSearch, delayMs = 300 }: SearchBarProps) {
  const [text, setText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Si el componente se desmonta con una busqueda pendiente, se descarta
  useEffect(() => () => clearTimeout(timer.current), []);

  function schedule(value: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(value.trim()), delayMs);
  }

  function clear() {
    clearTimeout(timer.current);
    setText('');
    onSearch('');
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      <label htmlFor="product-search" className="sr-only">
        Buscar productos por nombre
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
      />
      <input
        id="product-search"
        type="text"
        inputMode="search"
        autoComplete="off"
        placeholder="Buscar por nombre..."
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          schedule(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && text) clear();
        }}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-10 pl-9 text-sm text-slate-900 shadow-xs transition-shadow placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
      />
      {text && (
        <span className="absolute top-1/2 right-1.5 -translate-y-1/2">
          <Tooltip label="Limpiar (Esc)" align="end">
            <button
              type="button"
              onClick={clear}
              aria-label="Limpiar búsqueda"
              className="grid size-7 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <X className="size-4" />
            </button>
          </Tooltip>
        </span>
      )}
    </div>
  );
}
