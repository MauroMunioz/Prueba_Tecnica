import { useCallback, useEffect, useState } from 'react';
import { listProducts } from '../api';
import { getErrorMessage } from '../api-error';
import type { Product, ProductListParams, ProductPage } from '../types';

interface LoadResult {
  /** Que peticion produjo este resultado (parametros + numero de recarga) */
  key: string;
  data: ProductPage | null;
  error: string | null;
}

export interface ProductsState {
  products: Product[];
  /** Productos que cumplen la busqueda, en todas las paginas */
  total: number;
  totalPages: number;
  error: string | null;
  /** Hay una peticion en curso */
  isLoading: boolean;
  /** En curso y sin datos validos que mostrar mientras tanto */
  isInitialLoading: boolean;
  /** Vuelve a pedir la pagina actual */
  reload: () => void;
}

/**
 * Pagina de productos filtrada por nombre. Cancela la peticion anterior cuando
 * cambian los parametros, para que una respuesta lenta no pise a una mas nueva.
 * Mientras carga otra pagina se siguen mostrando los datos anteriores.
 */
export function useProducts({ q = '', page, limit }: ProductListParams): ProductsState {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);

  const key = `${reloadCount}:${page}:${limit}:${q}`;

  useEffect(() => {
    const controller = new AbortController();
    listProducts({ q, page, limit }, { signal: controller.signal }).then(
      (data) => setResult({ key, data, error: null }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setResult((previous) => ({
          key,
          data: previous?.data ?? null,
          error: getErrorMessage(error),
        }));
      },
    );
    return () => controller.abort();
  }, [key, q, page, limit]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // Se deriva en lugar de guardarlo: esta cargando mientras el resultado no sea de la peticion actual
  const isLoading = result?.key !== key;
  const data = result?.data;

  return {
    products: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    error: isLoading ? null : (result?.error ?? null),
    isLoading,
    isInitialLoading: isLoading && (result === null || result.error !== null),
    reload,
  };
}
