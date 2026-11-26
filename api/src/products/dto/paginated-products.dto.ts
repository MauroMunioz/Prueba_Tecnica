import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

// Respuesta de GET /products
export class PaginatedProductsDto {
  @ApiProperty({ type: Product, isArray: true })
  items!: Product[];

  @ApiProperty({ description: 'Productos que cumplen el filtro, en todas las paginas', example: 23 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ description: 'Total de paginas; 0 si no hay productos', example: 3 })
  totalPages!: number;
}
