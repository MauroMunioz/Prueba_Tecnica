import { ApiError, getErrorMessage } from './api-error';
import type { FieldErrors, ProductField } from './validation';

// La API devuelve los errores de validacion como textos sueltos. Cada mensaje
// empieza con el nombre del campo, asi que se asocian por prefijo.
const FIELD_PREFIXES: [prefix: string, field: ProductField][] = [
  ['El SKU', 'sku'],
  ['El nombre', 'name'],
  ['El precio', 'price'],
  ['El stock', 'stock'],
];

function fieldForMessage(message: string): ProductField | undefined {
  return FIELD_PREFIXES.find(([prefix]) => message.startsWith(prefix))?.[1];
}

export interface FormErrorState {
  fieldErrors: FieldErrors;
  /** Error que no corresponde a un campo: se muestra arriba del formulario */
  formError: string | null;
}

/**
 * Traduce un error de la API a errores del formulario:
 * 409 va al campo sku; 400 a cada campo cuando se reconoce, y el resto arriba.
 * El 404 no pasa por aqui: el formulario lo maneja aparte.
 */
export function toFormErrors(error: unknown): FormErrorState {
  if (!(error instanceof ApiError)) {
    return { fieldErrors: {}, formError: getErrorMessage(error) };
  }

  if (error.status === 409) {
    return { fieldErrors: { sku: error.messages[0] }, formError: null };
  }

  if (error.status === 400) {
    const fieldErrors: FieldErrors = {};
    const unmatched: string[] = [];
    for (const message of error.messages) {
      const field = fieldForMessage(message);
      if (field && !fieldErrors[field]) fieldErrors[field] = message;
      else if (!field) unmatched.push(message);
    }
    return {
      fieldErrors,
      formError: unmatched.length > 0 ? unmatched.join('. ') : null,
    };
  }

  return { fieldErrors: {}, formError: error.message };
}
