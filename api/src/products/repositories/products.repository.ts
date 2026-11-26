import { Product } from '../entities/product.entity';

export type CreateProductData = Pick<Product, 'sku' | 'name' | 'price'> &
  Partial<Pick<Product, 'stock'>>;

export type UpdateProductData = Partial<CreateProductData>;

export interface FindProductsFilter {
  // Texto a buscar dentro del nombre; se toma literal (% y _ no son comodines)
  name?: string;
}

/**
 * Contrato de persistencia de productos. Se usa como token de inyeccion,
 * asi los services no dependen de TypeORM.
 * create y update lanzan DuplicateSkuError si el SKU ya existe.
 */
export abstract class ProductsRepository {
  abstract findAll(filter?: FindProductsFilter): Promise<Product[]>;
  abstract findById(id: number): Promise<Product | null>;
  abstract findBySku(sku: string): Promise<Product | null>;
  abstract create(data: CreateProductData): Promise<Product>;
  abstract update(id: number, data: UpdateProductData): Promise<Product | null>;
  abstract delete(id: number): Promise<boolean>;
}
