// Contrato con la API (/api/products). Debe coincidir con la entidad y los DTOs de Nest.

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  /** Fecha ISO 8601 en UTC, tal como la serializa la API */
  createdAt: string;
}

export interface ProductInput {
  sku: string;
  name: string;
  price: number;
  /** Si se omite al crear, la base aplica 0 */
  stock?: number;
}

/** Respuesta de GET /api/products */
export interface ProductPage {
  items: Product[];
  /** Productos que cumplen la busqueda, en todas las paginas */
  total: number;
  page: number;
  limit: number;
  /** 0 si no hay productos */
  totalPages: number;
}

export interface ProductListParams {
  q?: string;
  /** Empieza en 1 */
  page: number;
  limit: number;
}
