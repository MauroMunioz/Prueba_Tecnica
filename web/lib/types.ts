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

export type ProductUpdate = Partial<ProductInput>;
