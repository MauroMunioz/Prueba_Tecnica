import { ValueTransformer } from 'typeorm';

/**
 * mysql2 devuelve las columnas DECIMAL como string para no perder precision.
 * Este transformer las convierte a number al leer. Es seguro mientras los
 * importes quepan en un double (DECIMAL(10,2) cabe sin problema).
 */
export class DecimalTransformer implements ValueTransformer {
  to(value: number | null | undefined): number | null | undefined {
    return value;
  }

  from(value: string | null): number | null {
    return value === null ? null : Number(value);
  }
}
