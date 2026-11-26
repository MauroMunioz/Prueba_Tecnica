import { ApiError } from './api-error';
import type {
  Product,
  ProductInput,
  ProductListParams,
  ProductPage,
} from './types';

export { ApiError } from './api-error';

// Ruta relativa: el navegador llama al mismo origen y next.config la reenvia a la API.
// Por eso estas funciones estan pensadas para usarse desde el cliente.
const PRODUCTS_URL = '/api/products';

interface RequestOptions {
  signal?: AbortSignal;
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    // Una cancelacion no es un fallo: quien cancelo decide que hacer
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(body, response.status));
  }
  return body as T;
}

function extractMessage(body: unknown, status: number): string | string[] {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.every((m) => typeof m === 'string')) {
      return message;
    }
  }
  // Sin cuerpo de Nest: por ejemplo, el proxy no alcanzo la API
  return status >= 500
    ? 'El servidor no está disponible en este momento. Intenta más tarde.'
    : `Error inesperado (${status}).`;
}

export function listProducts(
  { q, page, limit }: ProductListParams,
  options: RequestOptions = {},
): Promise<ProductPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const search = q?.trim();
  if (search) params.set('q', search);
  return request<ProductPage>(`${PRODUCTS_URL}?${params}`, { signal: options.signal });
}

export function getProduct(id: number, options: RequestOptions = {}): Promise<Product> {
  return request<Product>(`${PRODUCTS_URL}/${id}`, { signal: options.signal });
}

export function createProduct(input: ProductInput): Promise<Product> {
  return request<Product>(PRODUCTS_URL, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateProduct(id: number, input: ProductInput): Promise<Product> {
  return request<Product>(`${PRODUCTS_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: number): Promise<void> {
  return request<void>(`${PRODUCTS_URL}/${id}`, { method: 'DELETE' });
}
