import type { ProductInput } from './types';

// Mismas reglas y mensajes que los DTOs de la API (api/src/products/dto).
// Si cambian alla, actualizar aqui.
export const PRODUCT_LIMITS = {
  skuMaxLength: 64,
  nameMaxLength: 255,
  priceMax: 99_999_999.99, // DECIMAL(10, 2)
  stockMax: 4_294_967_295, // INT UNSIGNED
} as const;

/** Valores tal como estan en el formulario: todo texto */
export interface ProductFormValues {
  sku: string;
  name: string;
  price: string;
  stock: string;
}

export type ProductField = keyof ProductFormValues;
export type FieldErrors = Partial<Record<ProductField, string>>;

export const PRODUCT_FIELDS: ProductField[] = ['sku', 'name', 'price', 'stock'];

function validateSku(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return 'El SKU es obligatorio';
  if (value.length > PRODUCT_LIMITS.skuMaxLength) {
    return `El SKU no puede superar los ${PRODUCT_LIMITS.skuMaxLength} caracteres`;
  }
}

function validateName(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return 'El nombre es obligatorio';
  if (value.length > PRODUCT_LIMITS.nameMaxLength) {
    return `El nombre no puede superar los ${PRODUCT_LIMITS.nameMaxLength} caracteres`;
  }
}

// Se acepta coma como separador decimal, habitual al escribir precios en COP
function normalizeDecimal(raw: string): string {
  return raw.trim().replace(',', '.');
}

function validatePrice(raw: string): string | undefined {
  const value = normalizeDecimal(raw);
  if (!value) return 'El precio es obligatorio';
  if (!/^-?\d+(\.\d+)?$/.test(value)) return 'El precio debe ser un numero';
  const price = Number(value);
  if (price <= 0) return 'El precio debe ser mayor que 0';
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return 'El precio debe ser un numero con maximo 2 decimales';
  }
  if (price > PRODUCT_LIMITS.priceMax) {
    return `El precio no puede superar ${PRODUCT_LIMITS.priceMax}`;
  }
}

function validateStock(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return 'El stock es obligatorio (usa 0 si no hay unidades)';
  if (/^-\d+$/.test(value)) return 'El stock no puede ser negativo';
  if (!/^\d+$/.test(value)) return 'El stock debe ser un numero entero';
  if (Number(value) > PRODUCT_LIMITS.stockMax) {
    return `El stock no puede superar ${PRODUCT_LIMITS.stockMax}`;
  }
}

const validators: Record<ProductField, (raw: string) => string | undefined> = {
  sku: validateSku,
  name: validateName,
  price: validatePrice,
  stock: validateStock,
};

export function validateField(field: ProductField, raw: string): string | undefined {
  return validators[field](raw);
}

export type ValidationResult =
  | { ok: true; data: ProductInput }
  | { ok: false; errors: FieldErrors };

/** Valida el formulario completo y, si es valido, devuelve el cuerpo listo para la API */
export function validateProduct(values: ProductFormValues): ValidationResult {
  const errors: FieldErrors = {};
  for (const field of PRODUCT_FIELDS) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      sku: values.sku.trim(),
      name: values.name.trim(),
      price: Number(normalizeDecimal(values.price)),
      stock: Number(values.stock.trim()),
    },
  };
}
