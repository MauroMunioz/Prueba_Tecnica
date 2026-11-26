'use client';

import { useEffect, useRef, useState } from 'react';

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
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z"
          clipRule="evenodd"
        />
      </svg>
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
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-9 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpiar busqueda"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-2"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
