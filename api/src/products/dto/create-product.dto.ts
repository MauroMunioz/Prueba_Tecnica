import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../common/transformers/trim.transformer';

// Limites tomados de database/schema.sql
const SKU_MAX_LENGTH = 64;
const NAME_MAX_LENGTH = 255;
const PRICE_MAX = 99_999_999.99; // DECIMAL(10, 2)
const STOCK_MAX = 4_294_967_295; // INT UNSIGNED

// class-validator evalua los decoradores de abajo hacia arriba y el pipe usa
// stopAtFirstError, por eso la regla mas basica va pegada a la propiedad.
// @ApiProperty solo documenta; las reglas reales son las de class-validator.
export class CreateProductDto {
  @ApiProperty({
    description: 'Codigo unico del producto. Se recortan los espacios.',
    example: 'SKU-001',
    maxLength: SKU_MAX_LENGTH,
  })
  @MaxLength(SKU_MAX_LENGTH, {
    message: `El SKU no puede superar los ${SKU_MAX_LENGTH} caracteres`,
  })
  @IsString({ message: 'El SKU debe ser un texto' })
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  @Trim()
  sku!: string;

  @ApiProperty({
    description: 'Nombre del producto. Se recortan los espacios.',
    example: 'Mesa de roble',
    maxLength: NAME_MAX_LENGTH,
  })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `El nombre no puede superar los ${NAME_MAX_LENGTH} caracteres`,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Trim()
  name!: string;

  @ApiProperty({
    description: 'Precio mayor que 0, con maximo 2 decimales.',
    example: 199.99,
    exclusiveMinimum: true,
    minimum: 0,
    maximum: PRICE_MAX,
    multipleOf: 0.01,
  })
  @Max(PRICE_MAX, { message: `El precio no puede superar ${PRICE_MAX}` })
  @IsPositive({ message: 'El precio debe ser mayor que 0' })
  @IsNumber(
    { maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false },
    { message: 'El precio debe ser un numero con maximo 2 decimales' },
  )
  @IsDefined({ message: 'El precio es obligatorio' })
  price!: number;

  // Opcional: si no se envia, la base aplica DEFAULT 0. No se usa @IsOptional
  // porque tambien deja pasar null, que llegaria a MySQL (columna NOT NULL) como 500
  @ApiPropertyOptional({
    description: 'Unidades disponibles. Si no se envia, vale 0.',
    example: 3,
    type: 'integer',
    minimum: 0,
    maximum: STOCK_MAX,
    default: 0,
  })
  @Max(STOCK_MAX, { message: `El stock no puede superar ${STOCK_MAX}` })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @IsInt({ message: 'El stock debe ser un numero entero' })
  @ValidateIf((_, value) => value !== undefined)
  stock?: number;
}
