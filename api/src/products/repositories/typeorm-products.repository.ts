import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { DuplicateSkuError } from '../errors/duplicate-sku.error';
import {
  CreateProductData,
  FindProductsFilter,
  Page,
  PageRequest,
  ProductsRepository,
  UpdateProductData,
} from './products.repository';

// Escapa los comodines de LIKE (y el propio caracter de escape) para buscar el texto literal
function escapeLike(value: string): string {
  return value.replace(/[!%_]/g, '!$&');
}

@Injectable()
export class TypeOrmProductsRepository extends ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {
    super();
  }

  async findAll(
    filter: FindProductsFilter = {},
    page?: PageRequest,
  ): Promise<Page<Product>> {
    const query = this.repo
      .createQueryBuilder('product')
      .orderBy('product.id', 'ASC');

    if (filter.name) {
      // ESCAPE explicito con '!' para no depender de NO_BACKSLASH_ESCAPES en sql_mode
      query.where("product.name LIKE :name ESCAPE '!'", {
        name: `%${escapeLike(filter.name)}%`,
      });
    }

    if (page) {
      query.skip(page.offset).take(page.limit);
    }

    // Un SELECT para la pagina y un COUNT con el mismo filtro para el total
    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }

  findById(id: number): Promise<Product | null> {
    return this.repo.findOneBy({ id });
  }

  findBySku(sku: string): Promise<Product | null> {
    return this.repo.findOneBy({ sku });
  }

  async create(data: CreateProductData): Promise<Product> {
    try {
      return await this.repo.save(this.repo.create(data));
    } catch (error) {
      throw this.translateError(error, data.sku);
    }
  }

  // UPDATE directo en vez de leer y luego save(): save() hace upsert, y si otra
  // peticion borraba el producto entre la lectura y el guardado, lo volvia a insertar
  async update(id: number, data: UpdateProductData): Promise<Product | null> {
    // Los DTO pueden traer propiedades en undefined; no deben pisar valores
    const changes = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as UpdateProductData;

    // Sin campos no hay UPDATE posible (TypeORM lo rechaza): basta con leer
    if (Object.keys(changes).length > 0) {
      try {
        const result = await this.repo.update({ id }, changes);
        if (!result.affected) {
          return null;
        }
      } catch (error) {
        // Solo un cambio de sku puede chocar con el indice unico
        throw this.translateError(error, changes.sku ?? '');
      }
    }

    return this.repo.findOneBy({ id });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  // La unica clave unica de products ademas de la PK es sku, por eso
  // cualquier ER_DUP_ENTRY en esta tabla corresponde a un SKU repetido
  private translateError(error: unknown, sku: string): unknown {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string } | undefined)?.code ===
        'ER_DUP_ENTRY'
    ) {
      return new DuplicateSkuError(sku);
    }
    return error;
  }
}
