// Los precios estan en dolares (moneda oficial de Ecuador) y se muestran con
// el formato regional es-EC: $1.234,50
export const CURRENCY = 'USD';

const LOCALE = 'es-EC';

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Convierte la fecha UTC de la API a la zona horaria del navegador */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
