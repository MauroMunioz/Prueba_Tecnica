import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/transformers/trim.transformer';

export class FindProductsQueryDto {
  // Un ?q= vacio o con solo espacios equivale a no filtrar
  @ApiPropertyOptional({
    description:
      'Texto a buscar dentro del nombre, sin distinguir mayusculas. % y _ se buscan literalmente.',
    example: 'mesa',
    maxLength: 255,
  })
  @MaxLength(255, { message: 'La busqueda no puede superar los 255 caracteres' })
  @IsString({ message: 'La busqueda debe ser un texto' })
  @IsOptional()
  @Trim()
  q?: string;
}
