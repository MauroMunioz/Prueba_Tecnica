import { Transform } from 'class-transformer';

// Quita espacios al inicio y al final; los valores que no son string se dejan
// intactos para que el validador de tipo los rechace con su propio mensaje
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
