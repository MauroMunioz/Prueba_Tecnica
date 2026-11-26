import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { DuplicateSkuError } from './errors/duplicate-sku.error';
import { ProductsRepository } from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly products: ProductsRepository) {}

  findAll(q?: string): Promise<Product[]> {
    return this.products.findAll({ name: q || undefined });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) {
      throw this.notFound(id);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    try {
      return await this.products.create(dto);
    } catch (error) {
      throw this.toHttpError(error);
    }
  }

  // Conservar el SKU propio no choca con la clave unica (es la misma fila),
  // asi que solo da conflicto si el SKU pertenece a otro producto
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    let product: Product | null;
    try {
      product = await this.products.update(id, dto);
    } catch (error) {
      throw this.toHttpError(error);
    }
    if (!product) {
      throw this.notFound(id);
    }
    return product;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.products.delete(id);
    if (!deleted) {
      throw this.notFound(id);
    }
  }

  private notFound(id: number): NotFoundException {
    return new NotFoundException(`No existe un producto con id ${id}`);
  }

  private toHttpError(error: unknown): unknown {
    if (error instanceof DuplicateSkuError) {
      return new ConflictException(error.message);
    }
    return error;
  }
}
