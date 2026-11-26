import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// Rango de INT UNSIGNED AUTO_INCREMENT
const ID_MAX = 4_294_967_295;

/**
 * Valida ids de ruta: solo digitos, sin signo, sin decimales y dentro del rango
 * de la columna. ParseIntPipe acepta negativos y no controla el maximo.
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = /^[1-9]\d*$/.test(value) ? Number(value) : NaN;
    if (!Number.isSafeInteger(id) || id > ID_MAX) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    return id;
  }
}
