// Moneda en la que se muestran los precios: COP (por defecto) o USD.
// Se fija con NEXT_PUBLIC_CURRENCY al compilar. Solo cambia el formato, no convierte valores.
export type Currency = 'COP' | 'USD';

export const CURRENCY: Currency =
  process.env.NEXT_PUBLIC_CURRENCY?.toUpperCase() === 'USD' ? 'USD' : 'COP';

const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// En COP los centavos casi no se usan: $ 450.000 si es entero, $ 12,50 si no
const copIntegerFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});
const copDecimalFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatPrice(value: number): string {
  if (CURRENCY === 'USD') return usdFormatter.format(value);
  return Number.isInteger(value)
    ? copIntegerFormatter.format(value)
    : copDecimalFormatter.format(value);
}

/** Convierte la fecha UTC de la API a la zona horaria del navegador */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
