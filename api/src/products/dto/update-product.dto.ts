// PartialType de @nestjs/swagger (no de mapped-types) para que la documentacion
// tambien muestre los campos como opcionales
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// Mismas reglas que al crear, pero todos los campos son opcionales.
// skipNullProperties: false hace que solo se omita la validacion de los campos
// ausentes (undefined); un null se valida y se rechaza con 400 en vez de
// llegar a MySQL, donde todas las columnas son NOT NULL
export class UpdateProductDto extends PartialType(CreateProductDto, {
  skipNullProperties: false,
}) {}
