import { Product } from '../entities/product.entity';

export type CreateProductData = Pick<Product, 'sku' | 'name' | 'price'> &
  Partial<Pick<Product, 'stock'>>;

export type UpdateProductData = Partial<CreateProductData>;

export interface FindProductsFilter {
  // Texto a buscar dentro del nombre; se toma literal (% y _ no son comodines)
  name?: string;
}

// Rango de filas a devolver, ya calculado a partir de pagina y tamano
export interface PageRequest {
  offset: number;
  limit: number;
}

// Una pagina de resultados y el total de filas que cumplen el filtro
export interface Page<T> {
  items: T[];
  total: number;
}

/**
 * Contrato de persistencia de productos. Se usa como token de inyeccion,
 * asi los services no dependen de TypeORM.
 * create y update lanzan DuplicateSkuError si el SKU ya existe.
 */
export abstract class ProductsRepository {
  // Sin page devuelve todas las filas que cumplen el filtro
  abstract findAll(
    filter?: FindProductsFilter,
    page?: PageRequest,
  ): Promise<Page<Product>>;
  abstract findById(id: number): Promise<Product | null>;
  abstract findBySku(sku: string): Promise<Product | null>;
  abstract create(data: CreateProductData): Promise<Product>;
  abstract update(id: number, data: UpdateProductData): Promise<Product | null>;
  abstract delete(id: number): Promise<boolean>;
}
