import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Trim } from '../../common/transformers/trim.transformer';

export const DEFAULT_PAGE_SIZE = 10;
// Tope para que un cliente no pueda pedir toda la tabla de una vez
export const MAX_PAGE_SIZE = 100;

export class FindProductsQueryDto {
  // Un ?q= vacio o con solo espacios equivale a no filtrar
  @ApiPropertyOptional({
    description:
      'Texto a buscar dentro del nombre, sin distinguir mayusculas. % y _ se buscan literalmente.',
    example: 'mesa',
    maxLength: 255,
  })
  @MaxLength(255, { message: 'La búsqueda no puede superar los 255 caracteres' })
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @IsOptional()
  @Trim()
  q?: string;

  // Los query params llegan como texto: @Type los convierte a numero antes de
  // validar. Un texto no numerico queda en NaN y lo rechaza @IsInt
  @ApiPropertyOptional({
    description: 'Numero de pagina, empezando en 1.',
    type: 'integer',
    minimum: 1,
    default: 1,
  })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  @IsInt({ message: 'La página debe ser un número entero' })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de productos por pagina.',
    type: 'integer',
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    default: DEFAULT_PAGE_SIZE,
  })
  @Max(MAX_PAGE_SIZE, {
    message: `El tamaño de página no puede superar ${MAX_PAGE_SIZE}`,
  })
  @Min(1, { message: 'El tamaño de página debe ser mayor o igual a 1' })
  @IsInt({ message: 'El tamaño de página debe ser un número entero' })
  @IsOptional()
  @Type(() => Number)
  limit: number = DEFAULT_PAGE_SIZE;
}
