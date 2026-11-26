import { useCallback, useEffect, useState } from 'react';
import { listProducts } from '../api';
import { getErrorMessage } from '../api-error';
import type { Product } from '../types';

interface LoadResult {
  /** Que peticion produjo este resultado (busqueda + numero de recarga) */
  key: string;
  products: Product[];
  error: string | null;
}

export interface ProductsState {
  products: Product[];
  error: string | null;
  /** Hay una peticion en curso */
  isLoading: boolean;
  /** En curso y sin datos validos que mostrar mientras tanto */
  isInitialLoading: boolean;
  /** Vuelve a pedir la lista con la busqueda actual */
  reload: () => void;
}

/**
 * Lista de productos filtrada por nombre. Cancela la peticion anterior cuando
 * cambia la busqueda, para que una respuesta lenta no pise a una mas nueva.
 */
export function useProducts(query: string): ProductsState {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);

  const key = `${reloadCount}:${query}`;

  useEffect(() => {
    const controller = new AbortController();
    listProducts(query, { signal: controller.signal }).then(
      (products) => setResult({ key, products, error: null }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setResult((previous) => ({
          key,
          products: previous?.products ?? [],
          error: getErrorMessage(error),
        }));
      },
    );
    return () => controller.abort();
  }, [key, query]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // Se deriva en lugar de guardarlo: esta cargando mientras el resultado no sea de la peticion actual
  const isLoading = result?.key !== key;

  return {
    products: result?.products ?? [],
    error: isLoading ? null : (result?.error ?? null),
    isLoading,
    isInitialLoading: isLoading && (result === null || result.error !== null),
    reload,
  };
}
