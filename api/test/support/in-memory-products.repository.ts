import { Injectable } from '@nestjs/common';
import { Product } from '../../src/products/entities/product.entity';
import { DuplicateSkuError } from '../../src/products/errors/duplicate-sku.error';
import {
  CreateProductData,
  FindProductsFilter,
  Page,
  PageRequest,
  ProductsRepository,
  UpdateProductData,
} from '../../src/products/repositories/products.repository';

/**
 * Implementacion en memoria para tests. Imita lo que hace MySQL con la tabla
 * products: id autoincremental, stock por defecto 0, SKU unico y comparaciones
 * sin distinguir mayusculas (collation utf8mb4_unicode_ci).
 * Devuelve copias para que los tests no puedan modificar el estado interno.
 */
@Injectable()
export class InMemoryProductsRepository extends ProductsRepository {
  private readonly rows = new Map<number, Product>();
  private nextId = 1;

  findAll(filter: FindProductsFilter = {}, page?: PageRequest): Promise<Page<Product>> {
    // includes() ya es una busqueda literal, equivalente al LIKE con comodines escapados
    const needle = filter.name?.toLowerCase();
    const matches = [...this.rows.values()]
      .filter((p) => !needle || p.name.toLowerCase().includes(needle))
      .sort((a, b) => a.id - b.id);
    const items = page
      ? matches.slice(page.offset, page.offset + page.limit)
      : matches;
    return Promise.resolve({ items: items.map(clone), total: matches.length });
  }

  findById(id: number): Promise<Product | null> {
    const row = this.rows.get(id);
    return Promise.resolve(row ? clone(row) : null);
  }

  findBySku(sku: string): Promise<Product | null> {
    const row = this.findRowBySku(sku);
    return Promise.resolve(row ? clone(row) : null);
  }

  create(data: CreateProductData): Promise<Product> {
    if (this.findRowBySku(data.sku)) {
      return Promise.reject(new DuplicateSkuError(data.sku));
    }
    const row = Object.assign(new Product(), {
      id: this.nextId++,
      sku: data.sku,
      name: data.name,
      price: data.price,
      stock: data.stock ?? 0,
      createdAt: new Date(),
    });
    this.rows.set(row.id, row);
    return Promise.resolve(clone(row));
  }

  update(id: number, data: UpdateProductData): Promise<Product | null> {
    const row = this.rows.get(id);
    if (!row) {
      return Promise.resolve(null);
    }
    if (data.sku !== undefined) {
      const owner = this.findRowBySku(data.sku);
      // Conservar el SKU propio no es conflicto
      if (owner && owner.id !== id) {
        return Promise.reject(new DuplicateSkuError(data.sku));
      }
    }
    // Los DTO pueden traer propiedades en undefined; no deben pisar valores
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        Object.assign(row, { [key]: value });
      }
    }
    return Promise.resolve(clone(row));
  }

  delete(id: number): Promise<boolean> {
    return Promise.resolve(this.rows.delete(id));
  }

  private findRowBySku(sku: string): Product | undefined {
    const target = sku.toLowerCase();
    return [...this.rows.values()].find((p) => p.sku.toLowerCase() === target);
  }
}

function clone(product: Product): Product {
  return Object.assign(new Product(), product, {
    createdAt: new Date(product.createdAt),
  });
}
